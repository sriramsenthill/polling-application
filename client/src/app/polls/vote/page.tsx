'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance'; // Import your axios instance
import PollCard from '@/components/polls/PollCard'; // Adjust the path as necessary
import WelcomeComponent from '@/components/WelcomeComponent';
import { useRouter } from 'next/navigation';

export default function page() {
    const [polls, setPolls] = useState([]);
    const router = useRouter();

    // Update the handleVote function to use router.push
    const handleVote = (pollId: number) => {
        router.push(`/polls/vote/${pollId}`);
    };

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const response = await axiosInstance.get('api/polls/0');
                setPolls(response.data);
            } catch (error) {
                console.error('Error fetching polls:', error);
            }
        };

        fetchPolls();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start text-white">

            {/* Poll Cards container */}
            <div className="w-full max-w-4xl px-4 py-6 flex flex-row gap-6 justify-between overflow-auto">
                {/* Display Poll Cards */}
                {polls.map((poll) => (
                    <PollCard
                        key={poll.poll_id}
                        poll={poll}
                        buttonLabel="Vote"
                        buttonAction={() => handleVote(poll.poll_id)} // Pass the poll ID to handleVote
                    />
                ))}
            </div>
        </div>
    );
}
