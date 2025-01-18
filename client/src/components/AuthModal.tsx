'use client';
import { useEffect } from 'react';
import { useLogin } from '@/hooks/useAuth';
import Button from '@/components/Button';

interface AuthModalProps {
    mode: 'login' | 'register';
    onClose: () => void;
    onSwitchMode: () => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
    const { username, setUsername, handleLogin, handleRegister, isLoading, message } = useLogin();

    const handleSubmit = async () => {
        if (mode === 'login') {
            await handleLogin();

            if (message?.type === 'success') {
                setTimeout(onClose, 500);
            }
        } else {
            await handleRegister();

            if (message?.type === 'success') {
                setTimeout(onClose, 500);
            }
        }
    };

    useEffect(() => {
        if (mode === 'login' && message?.type === 'success' || mode === 'register' && message?.type === 'success') {
            const timeout = setTimeout(onClose, 500);
            return () => clearTimeout(timeout);
        }
    }, [mode, message, onClose]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-[5px]">
                <h1 className="font-satoshi font-bold text-lg text-gray-800">
                    {mode === 'login' ? 'Login Here.' : 'Register Here.'}
                </h1>
                <p className="text-xs">
                    {mode === 'login'
                        ? 'Welcome Back, Change Awaits'
                        : 'One Step to Make a Difference'}
                </p>

                {message && (
                    <p
                        className={`text-sm mt-2 ${message.type === 'error' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
                            }`}
                    >
                        {message.text}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2 w-full">
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl py-2 pl-3 text-sm pr-10 border focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                {isLoading ? (
                    <p className="w-full text-xs text-center">Loading...</p>
                ) : (
                    <Button href="#" onClick={handleSubmit}>
                        {mode === 'login' ? 'Login' : 'Register'}
                    </Button>
                )}
            </div>

            <div className="text-center text-sm text-gray-500">
                <span>
                    {mode === 'login'
                        ? "Don't have an account? "
                        : 'Already have an account? '}
                </span>
                <button
                    className="text-black hover:underline"
                    onClick={onSwitchMode}
                >
                    {mode === 'login' ? 'Register' : 'Login'}
                </button>
            </div>
        </div>
    );
}
