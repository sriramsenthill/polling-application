'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ButtonProps {
    onClick?: () => void;
    children: ReactNode;
}

export default function Button({ onClick, children }: ButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) onClick(); // Trigger the passed onClick action
    };

    return (
        <button
            onClick={handleClick}
            className="text-white bg-button-primary rounded-full text-xs sm:text-xs md:text-sm lg:text-base h-9 sm:h-9 md:h-10 lg:h-12 px-6 min-w-32 font-satoshi font-bold transition-colors duration-500 hover:opacity-90 focus:outline-none rounded-xl sm:rounded-xl md:rounded-xl lg:rounded-2xl flex items-center justify-center"
        >
            {children}
        </button>
    );
}
