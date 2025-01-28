'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import PollCard from '@/components/polls/PollCard';
import PollCardSkeleton from '@/components/polls/PollCardSkeleton';
import WelcomeComponent from '@/components/WelcomeComponent';
import { useRouter } from 'next/navigation';
import { Poll } from '@/types/poll';
import { AxiosError } from 'axios';

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  const handleVote = (pollId: number) => {
    router.push(`/polls/vote/${pollId}`);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPolls = async () => {
      if (!isMounted) return;

      try {
        const response = await axiosInstance.get('api/polls/0');
        if (isMounted) {
          setPolls(response.data);
          setFetchError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof AxiosError
            ? err.message
            : 'Unable to fetch polls. Please check your connection.';
          setFetchError(errorMessage);
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
    <div className="min-h-screen flex flex-col items-center justify-start text-white">
      <div className="w-full max-w-4xl px-4 py-6">
        <WelcomeComponent />
      </div>

      <div className="w-full max-w-4xl px-4 py-6 flex flex-row justify-between gap-6 overflow-auto">
        {(isLoading || fetchError) ? (
          Array(3).fill(0).map((_, index) => (
            <PollCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          polls.map((poll) => (
            <PollCard
              key={poll.poll_id}
              poll={poll}
              buttonLabel="Vote"
              buttonAction={() => handleVote(poll.poll_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}