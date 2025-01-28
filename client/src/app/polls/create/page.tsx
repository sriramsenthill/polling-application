'use client';

import React from 'react';
import CreatePoll from '@/components/polls/CreatePoll';
import useAuthMiddleware from "@/middleware/authMiddleware";

function Page() {
    useAuthMiddleware();

    return (
        <div className="min-h-screen flex flex-col items-center justify-start px-6 text-white">
            <CreatePoll />
        </div>
    );
}

export default Page;
