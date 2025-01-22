'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../Button';
import Modal from '../Modal';
import { useUserStore } from '@/store/userStore';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

const CreatePoll: React.FC = () => {
    const router = useRouter();
    const { username } = useUserStore((state) => state);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState([{ text: '' }]);
    const [expirationDate, setExpirationDate] = useState('');
    const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddOption = () => {
        setOptions([...options, { text: '' }]);
    };

    const handleRemoveOption = (index: number) => {
        const updatedOptions = options.filter((_, i) => i !== index);
        setOptions(updatedOptions);
    };

    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...options];
        updatedOptions[index].text = value;
        setOptions(updatedOptions);
    };

    const handleSubmit = async () => {
        if (!title || !description || options.some((o) => !o.text) || !expirationDate) {
            setModalMessage({ type: 'error', text: 'All fields are required.' });
            setIsModalOpen(true);
            return;
        }

        const formattedExpirationDate = new Date(expirationDate).toISOString();

        const pollData = {
            title,
            description,
            creator: username,
            options,
            expiration_date: formattedExpirationDate,
        };

        setIsLoading(true);
        setModalMessage(null);

        try {
            await axiosInstance.post('/api/polls', pollData);
            setModalMessage({ type: 'success', text: 'Poll created successfully.' });
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
                router.push('/');
            }, 2000);
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                setModalMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to create poll.',
                });
            } else {
                setModalMessage({
                    type: 'error',
                    text: 'Failed to create poll.',
                });
            }
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 w-full max-w-sm">
            <h1 className="text-xl font-bold text-gray-800">Create a Poll</h1>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Poll Title"
                className="text-lg font-satoshi font-bold text-gray-800 break-words gap-2 bg-white rounded-2xl p-4 focus:outline-none"
            />

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Poll Description"
                className="w-full rounded-2xl text-lg font-satoshi font-bold text-gray-800 break-words gap-2 bg-white p-4 focus:outline-none"
            />

            <div className="flex flex-col gap-3 bg-white rounded-2xl p-4">
                <label className="text-base font-bold text-gray-700">Options</label>
                {options.map((option, index) => (
                    <div key={index} className="flex justify-between gap-2">
                        <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="w-full flex justify-between text-gray-700 items-center p-2 bg-gray-100 rounded-lg shadow-sm focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-custom-pink font-bold"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-custom-pink font-semibold"
                >
                    + Add Option
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-gray-700 ">Expiration Date</label>
                <input
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full text-lg font-satoshi font-bold text-gray-800 break-words gap-2 bg-white rounded-2xl p-4 focus:outline-none"
                />
            </div>

            <Button onClick={handleSubmit}>
                {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>

            {modalMessage && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div
                        className={`p-20 text-center rounded-xl ${modalMessage.type === 'success' ? ' text-green-700' : 'text-red-700'
                            }`}
                    >
                        {modalMessage.text}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CreatePoll;
