'use client';
import { useUserStore } from "@/store/userStore";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../Button";
import Modal from "../Modal";
import AuthModal from "../AuthModal";

export default function NavigationBar() {
    const { checkUserSession, username, resetUserSession } = useUserStore((state) => state);
    const pathname = usePathname();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    useEffect(() => {
        checkUserSession();
    }, [checkUserSession]);

    const handleLogOut = async () => {
        try {
            resetUserSession();
            const response = await (await axiosInstance.post("/auth/logout")).data;
            console.log(response);
            console.log("Logged out successfully.");
        } catch (error) {
            console.log("Logout failed:", error);
        }
    };

    const handleAuthClick = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const handleSwitchMode = () => {
        setAuthMode(mode => mode === 'login' ? 'register' : 'login');
    };

    return (
        <>
            <nav className="m-4">
                <div className="max-w-7xl p-[15px] mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <Link
                            className="font-satoshi font-bold text-[#55525d] lg:text-2xl md:text-xl text-sm cursor-pointer"
                            href="/"
                        >
                            voting app
                        </Link>
                        {username && (
                            <div className="flex items-center space-x-6">
                                <Link href="/polls/create">
                                    <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/create' ? 'font-bold' : 'font-medium'}`}>
                                        Create poll
                                    </span>
                                </Link>
                                <Link href="/polls/manage">
                                    <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/manage' ? 'font-bold' : 'font-medium'}`}>
                                        Manage polls
                                    </span>
                                </Link>
                                <Link href="/polls/vote">
                                    <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/vote' ? 'font-bold' : 'font-medium'}`}>
                                        Vote polls
                                    </span>
                                </Link>

                            </div>
                        )}
                    </div>

                    {!username && (
                        <div className="flex items-center space-x-6">
                            <button
                                className="text-[#55525d] text-xs sm:text-xs md:text-sm lg:text-base font-satoshi hover:opacity-90 transition-all"
                                onClick={() => handleAuthClick('register')}
                            >
                                Register
                            </button>
                            <Button onClick={() => handleAuthClick('login')}>
                                Log in
                            </Button>
                        </div>
                    )}

                    {username && <Button onClick={handleLogOut}>Log out</Button>}
                </div>
            </nav>

            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            >
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={handleSwitchMode}
                />
            </Modal>
        </>
    );
}