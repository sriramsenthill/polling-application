'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import PollCard from '@/components/polls/PollCard';
import WelcomeComponent from '@/components/WelcomeComponent';
import { useRouter } from 'next/navigation';
import { Poll } from '@/types/poll';

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const router = useRouter();

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
      <div className="w-full max-w-4xl px-4 py-6">
        <WelcomeComponent />
      </div>

      <div className="w-full max-w-4xl px-4 py-6 flex flex-row justify-between gap-6 overflow-auto">
        {polls.map((poll) => (
          <PollCard
            key={poll.poll_id}
            poll={poll}
            buttonLabel="Vote"
            buttonAction={() => handleVote(poll.poll_id)}
          />
        ))}
      </div>
    </div>
  );
}
