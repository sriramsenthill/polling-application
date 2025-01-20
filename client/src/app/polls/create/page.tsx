import React from 'react'
import CreatePoll from '@/components/polls/CreatePoll';

function page() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-custom-gray">
            <div className="p-8">
                <CreatePoll />
            </div>

        </div>
    )
}

export default page
