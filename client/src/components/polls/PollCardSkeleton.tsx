import React from 'react';

const PollCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl p-6 w-full max-w-sm animate-pulse">
            <div className="flex flex-col gap-2">
                <div className="w-20 h-6 bg-gray-200 rounded-full" />

                <div className="h-24 bg-white rounded-2xl p-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded-full" />
                    <div className="w-1/2 h-4 bg-gray-200 rounded-full mt-2" />
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 h-24">
                <div className="w-full h-3 bg-gray-200 rounded-full" />
                <div className="w-3/4 h-3 bg-gray-200 rounded-full mt-2" />
                <div className="w-1/2 h-3 bg-gray-200 rounded-full mt-2" />
            </div>

            <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 h-32">
                <div className="w-24 h-4 bg-gray-200 rounded-full" />

                {[1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="relative flex justify-between items-center py-3 p-2 bg-gray-100 rounded-lg shadow-sm overflow-hidden"
                        style={{ borderRadius: '1rem' }}
                    >
                        <div className="w-full h-8 bg-gray-200 rounded-lg" />
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 bg-white/50 rounded-2xl pt-4 pb-3 px-4">
                <div className="flex justify-between">
                    <div className="w-20 h-3 bg-gray-200 rounded-full" />
                    <div className="w-24 h-3 bg-gray-200 rounded-full" />
                </div>
                <div className="flex justify-between">
                    <div className="w-20 h-3 bg-gray-200 rounded-full" />
                    <div className="w-24 h-3 bg-gray-200 rounded-full" />
                </div>
            </div>

            <div className="w-full h-10 bg-gray-200 rounded-lg" />
        </div>
    );
};

export default PollCardSkeleton;