'use client';

import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
    href: string;
    onClick?: () => void;
    children: ReactNode;
}

export default function Button({ href, onClick, children }: ButtonProps) {
    return (
        <Link
            href={href || "#"}
            onClick={onClick}
            className="text-white bg-button-primary rounded-full text-xs sm:text-xs md:text-sm lg:text-base h-9 sm:h-9 md:h-10 lg:h-12 px-6 min-w-32 font-satoshi font-bold transition-colors duration-500 hover:opacity-90 focus:outline-none rounded-xl sm:rounded-xl md:rounded-xl lg:rounded-2xl flex items-center justify-center"
        >
            {children}
        </Link>
    );
}