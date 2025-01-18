'use client';

import { ReactNode } from 'react';

interface BackgroundContainerProps {
    children: ReactNode;
}

export default function BackgroundContainer({ children }: BackgroundContainerProps) {
    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="bg-white/50 rounded-[20px] relative overflow-hidden before:content-[''] before:bg-black before:bg-opacity-0 before:absolute before:top-0 before:left-0 before:h-full before:w-full before:pointer-events-none before:transition-colors before:duration-700">
                {children}
            </div>
        </div>
    );
}