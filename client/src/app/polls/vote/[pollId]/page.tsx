'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { useUserStore } from '@/store/userStore';
import VotePollCard from '@/components/polls/VotePollCard';
import useAuthMiddleware from "@/middleware/authMiddleware";
import PollCardSkeleton from '@/components/polls/PollCardSkeleton';
import { AxiosError } from 'axios';

const PollVotePage = () => {
    useAuthMiddleware();

    const { pollId } = useParams();
    const { username } = useUserStore((state) => state);

    const [poll, setPoll] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPoll = async () => {
            try {
                const response = await axiosInstance.get(`/api/polls/${pollId}`);
                if (isMounted) {
                    setPoll(response.data);
                    setFetchError(null);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const errorMessage =
                        err instanceof AxiosError
                            ? err.response?.data?.message || 'Failed to fetch poll.'
                            : 'Unable to fetch poll. Please check your connection.';
                    setFetchError(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPoll();

        return () => {
            isMounted = false;
        };
    }, [pollId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 text-white">
                <div className="flex flex-row gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <PollCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 text-center px-6">
                <p>{fetchError}</p>
            </div>
        );
    }

    if (!poll || !username) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-center px-6">
                <p>Poll not found or username missing.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start px-6 text-white">
            <VotePollCard poll={poll} username={username} />
        </div>
    );
};

export default PollVotePage;
