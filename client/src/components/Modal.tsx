'use client';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div
                className="bg-white/50 backdrop-blur-[20px] mx-auto transform transition-transform duration-300 ease-out animate-[scaleIn_0.3s_ease-out] rounded-2xl w-[600px]"
                style={{
                    animation: 'scaleIn 0.3s ease-out',
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
}