'use client';

import React from 'react';
import Image from 'next/image';

const WelcomeComponent: React.FC = () => {
    return (
        <div className="flex items-center justify-between w-full bg-custom-pink rounded-full p-2 px-4 text-white cursor-pointer undefined">


            <div className="flex items-center justify-between gap-2">
                <div className="w-6 h-6 relative">
                    <Image
                        src="https://app.garden.finance/_next/static/media/star.7a85a320.svg"
                        alt="Link Icon"
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                <p className="text-sm text-white font-bold">Create your polls and engage with the community. Your voice matters, make it heard!</p>
            </div>

            <div className="w-6 h-6 relative">
                <Image
                    src="https://app.garden.finance/_next/static/media/link_icon.d7e9426b.svg"
                    alt="Link Icon"
                    layout="fill"
                    objectFit="contain"
                />
            </div>
        </div>
    );
};

export default WelcomeComponent;
