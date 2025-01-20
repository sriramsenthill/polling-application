'use client';

import React, { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import Button from '../Button';

interface PollOption {
    option_id: number;
    text: string;
    votes: number;
}

interface Poll {
    poll_id: number;
    title: string;
    creator: string;
    description: string;
    created_at: string;
    expiration_date: string;
    status: string; // Can be "Active", "Closed", etc.
    options: PollOption[];
    users_voted: string[];
}

interface VotePollCardProps {
    poll: Poll;
    username: string; // Username of the logged-in user
}

const VotePollCard: React.FC<VotePollCardProps> = ({ poll, username }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null); // Track selected option
    const router = useRouter();

    const handleVote = async () => {
        if (selectedOption === null) {
            alert('Please select an option to vote.');
            return;
        }

        try {
            await axiosInstance.post('/api/polls/vote', {
                poll_id: poll.poll_id,
                username,
                option_id: selectedOption,
            });

            alert('Vote submitted successfully!');
            router.push('/'); // Redirect to home screen
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote.');
        }
    };

    // Conditional styling for poll status
    const statusStyles =
        poll.status === 'Active'
            ? 'text-green-600 bg-green-200'
            : 'text-red-600 bg-red-100';

    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 w-full max-w-sm">
            {/* Title and Status */}
            <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles}`}>
                    {poll.status}
                </span>

                <h2 className="text-lg font-satoshi font-bold text-gray-800 break-words gap-2 h-24 bg-white rounded-2xl p-2">
                    {poll.title}
                </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 break-words bg-white rounded-2xl p-4 h-24">
                {poll.description}
            </p>

            {/* Options */}
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
                        <span className="text-xs">
                            {option.votes} votes
                        </span>
                    </button>
                ))}
            </div>

            {/* Additional Information */}
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

            {/* Vote Button */}
            <Button onClick={handleVote}>Vote</Button>
        </div>
    );
};

export default VotePollCard;
