'use client';

import React, { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import Button from '../Button';
import Modal from '../Modal';
import { Poll } from '@/types/poll';
import { AxiosError } from 'axios';

interface VotePollCardProps {
    poll: Poll;
    username: string;
}

const VotePollCard: React.FC<VotePollCardProps> = ({ poll, username }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const router = useRouter();

    const handleVote = async () => {
        if (selectedOption === null) {
            setModalMessage({ type: 'error', text: 'Please select an option to vote.' });
            setIsSuccess(false);
            setIsModalOpen(true);
            return;
        }

        try {
            await axiosInstance.post('/api/polls/vote', {
                poll_id: poll.poll_id,
                username,
                option_id: selectedOption,
            });
            setModalMessage({ type: 'success', text: 'Vote submitted successfully!' });
            setIsSuccess(true);
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
                setModalMessage({ type: 'error', text: 'Failed to submit vote.' });
            }

            setIsSuccess(false);
            setIsModalOpen(true);

            setTimeout(() => setIsModalOpen(false), 2000);
        }
    };

    const statusStyles =
        poll.status === 'Active'
            ? 'text-green-600 bg-green-200'
            : 'text-red-600 bg-red-100';

    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles}`}>
                    {poll.status}
                </span>

                <h2 className="text-lg font-satoshi font-bold text-gray-800 break-words gap-2 h-24 bg-white rounded-2xl p-2">
                    {poll.title}
                </h2>
            </div>

            <p className="text-sm text-gray-600 break-words bg-white rounded-2xl p-4 h-24">
                {poll.description}
            </p>

            <div className="flex flex-col gap-3 bg-white rounded-2xl p-4">
                <h3 className="text-base font-bold text-gray-700">Options:</h3>
                {poll.options.map((option) => (
                    <button
                        key={option.option_id}
                        onClick={() => setSelectedOption(option.option_id)}
                        className={`flex justify-between items-center p-2 rounded-lg shadow-sm transition-colors ${selectedOption === option.option_id
                            ? 'bg-custom-pink text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <p className="text-sm">{option.text}</p>
                    </button>
                ))}
            </div>

            <div className="flex flex-col text-xs text-gray-400 gap-3 bg-white/50 rounded-2xl pt-4 pb-3 px-4 cursor-pointer transition-[background-color] hover:bg-white">
                <div className="flex justify-between">
                    <p>Created by</p>
                    <p>{poll.creator}</p>
                </div>
                <div className="flex justify-between">
                    <p>Expires on</p>
                    <p>{new Date(poll.expiration_date).toLocaleDateString()}</p>
                </div>
            </div>

            <Button onClick={handleVote}>Vote</Button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div
                    className={`p-20 text-center font-bold rounded-xl ${isSuccess ? 'text-green-700' : 'text-red-700'}`}
                >
                    {modalMessage?.text}
                </div>
            </Modal>
        </div>
    );
};

export default VotePollCard;
