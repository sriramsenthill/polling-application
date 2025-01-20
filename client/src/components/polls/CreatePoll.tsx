'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../Button';
import { useUserStore } from '@/store/userStore';
import axiosInstance from '@/utils/axiosInstance';

const CreatePoll: React.FC = () => {
    const router = useRouter();
    const { username } = useUserStore((state) => state);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState([{ text: '' }]);
    const [expirationDate, setExpirationDate] = useState('');
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
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
            setMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }

        // Convert expiration date to the correct format (ISO 8601)
        const formattedExpirationDate = new Date(expirationDate).toISOString();

        const pollData = {
            title,
            description,
            creator: username,
            options,
            expiration_date: formattedExpirationDate, // Use formatted expiration date
        };

        setIsLoading(true);
        setMessage(null);

        try {
            await axiosInstance.post('/api/polls', pollData); // Send formatted expiration date
            setMessage({ type: 'success', text: 'Poll created successfully.' });
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create poll.' });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 w-full max-w-sm">
            <h1 className="text-xl font-bold text-gray-800">Create a Poll</h1>

            {message && (
                <p
                    className={`text-sm font-semibold ${message.type === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}
                >
                    {message.text}
                </p>
            )}

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
                            className="w-full flex justify-between items-center p-2 bg-gray-100 rounded-lg shadow-sm focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-pink-600 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-pink-600 font-semibold"
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

            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
        </div>
    );
};

export default CreatePoll;
