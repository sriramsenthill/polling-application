'use client';

import React from 'react';
import Button from '../Button';
import { Poll } from '@/types/poll';

interface PollCardProps {
    poll: Poll;
    buttonLabel: string;
    buttonAction: () => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, buttonLabel, buttonAction }) => {

    const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);

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

            <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 h-32 overflow-auto">
                <h3 className="text-base font-bold text-gray-700">Options:</h3>
                {poll.options.map((option) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                        <div
                            key={option.option_id}
                            className="relative flex justify-between items-center p-2 bg-gray-100 rounded-lg shadow-sm overflow-hidden"
                            style={{
                                borderRadius: '1rem',
                            }}
                        >
                            <div
                                className="absolute inset-0 bg-gray-200 rounded-lg"
                                style={{
                                    borderRadius: '1rem',
                                }}
                            ></div>

                            <div
                                className="absolute inset-0 bg-custom-pink rounded-lg"
                                style={{
                                    width: `${percentage}%`,
                                    borderRadius: '1rem',
                                }}
                            ></div>

                            <div className="relative z-10 flex justify-between items-center w-full p-2">
                                <p className="text-sm text-gray-700">{option.text}</p>
                                <span className="text-xs text-gray-500">{option.votes} votes</span>
                            </div>
                        </div>

                    );
                })}
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

            <Button onClick={buttonAction}>
                {buttonLabel}
            </Button>
        </div>
    );
};

export default PollCard;
