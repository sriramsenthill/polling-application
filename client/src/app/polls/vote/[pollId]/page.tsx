'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { useUserStore } from '@/store/userStore';
import VotePollCard from '@/components/polls/VotePollCard';

const PollVotePage = () => {
    const { pollId } = useParams();
    const { username } = useUserStore((state) => state);

    const [poll, setPoll] = useState(null);

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await axiosInstance.get(`/api/polls/${pollId}`);
                setPoll(response.data);
            } catch (error) {
                console.error('Error fetching poll:', error);
            }
        };

        fetchPoll();
    }, [pollId]);

    if (!poll) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-custom-gray">
            <VotePollCard poll={poll} username={username} />
        </div>
    );
};

export default PollVotePage;
