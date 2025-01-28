'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import PollCard from '@/components/polls/PollCard';
import { useRouter } from 'next/navigation';
import { Poll } from '@/types/poll';
import PollCardSkeleton from '@/components/polls/PollCardSkeleton';
import { AxiosError } from 'axios';

const Page = () => {
    const router = useRouter();

    const handleVote = (pollId: number) => {
        router.push(`/polls/vote/${pollId}`);
    };

    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPolls = async () => {
            try {
                const response = await axiosInstance.get('api/polls/0');
                if (isMounted) {
                    setPolls(response.data);
                    setFetchError(null);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const errorMessage =
                        err instanceof AxiosError
                            ? err.response?.data?.message || 'Failed to fetch polls.'
                            : 'Unable to fetch polls. Please check your connection.';
                    setFetchError(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        const interval = setInterval(fetchPolls, 5000);
        fetchPolls();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start px-6 text-white">
            {isLoading ? (
                <div className="flex flex-row gap-6 justify-center items-center w-full">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <PollCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : fetchError ? (
                <div className="text-center text-red-500">
                    <p>{fetchError}</p>
                </div>
            ) : polls.length === 0 ? (
                <div className="text-center text-gray-400">
                    <p>No polls available at the moment.</p>
                </div>
            ) : (
                <div className="w-full max-w-6xl flex flex-row flex-wrap gap-6 justify-center items-center mx-auto px-4">
                    {polls.map((poll) => (
                        <PollCard
                            key={poll.poll_id}
                            poll={poll}
                            buttonLabel="Vote"
                            buttonAction={() => handleVote(poll.poll_id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Page;
