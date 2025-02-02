'use client';

import { ReactNode } from 'react';

interface ButtonProps {
    onClick?: () => void;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
}

export default function Button({ onClick, children, disabled = false, className = '' }: ButtonProps) {
    const handleClick = () => {
        if (onClick && !disabled) onClick();
    };

    const baseClasses = "text-white bg-button-primary text-xs sm:text-xs md:text-sm lg:text-base h-9 sm:h-9 md:h-10 lg:h-12 px-6 min-w-32 font-satoshi font-bold transition-colors duration-500 focus:outline-none rounded-xl sm:rounded-xl md:rounded-xl lg:rounded-2xl flex items-center justify-center";
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90';
    const combinedClasses = `${baseClasses} ${disabledClasses} ${className}`;

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={combinedClasses}
        >
            {children}
        </button>
    );
}