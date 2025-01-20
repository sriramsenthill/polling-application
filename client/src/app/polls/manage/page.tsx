'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import PollCard from '@/components/polls/PollCard'; // Assuming you already have a PollCard component

function Page() { // Renamed to 'Page' instead of 'page'
    const { username } = useUserStore((state) => state);

    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const response = await axiosInstance.get('api/polls/0'); // Fetch polls
                const userPolls = response.data.filter((poll: any) => poll.creator === username); // Filter polls by logged-in user
                setPolls(userPolls);
                setLoading(false);
            } catch (error) {
                setMessage('Failed to fetch polls.');
                setLoading(false);
            }
        };

        fetchPolls();
    }, [username]);

    const handleDelete = async (pollId: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this poll?');
        if (confirmDelete) {
            try {
                await axiosInstance.delete(`api/polls/${pollId}`);
                setPolls(polls.filter((poll) => poll.poll_id !== pollId)); // Remove the deleted poll from the list
                setMessage('Poll deleted successfully!');
            } catch (error) {
                setMessage('Failed to delete poll.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-custom-gray">
            <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6  max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Manage Your Polls</h1>

                {message && (
                    <p className={`text-sm font-semibold ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="flex flex-row gap-4">
                        {polls.map((poll) => (
                            <div key={poll.poll_id} className="relative">
                                <PollCard key={poll.poll_id} poll={poll} buttonLabel="Delete" buttonAction={() => handleDelete(poll.poll_id)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Page; // Export the component with the updated name
