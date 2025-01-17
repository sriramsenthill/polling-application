'use client';

import { useUserStore } from "@/store/userStore";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Button from "../Button";

export default function NavigationBar() {
    const { checkUserSession, username, isLoading, resetUserSession } = useUserStore((state) => state);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkUserSession();
        if (!isLoading && !username) {
            router.push("/login");
        }
    }, [checkUserSession, username, isLoading]);

    const handleLogOut = async () => {
        try {
            resetUserSession();
            const response = await (await axiosInstance.post("/auth/logout")).data;
            console.log(response);
            router.push("/login");
            console.log("Logged out successfully.");
        } catch (error) {
            console.log("Logout failed:", error);
        }
    };

    return (
        <nav className="m-4">
            <div className="max-w-7xl p-[15px] mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link
                        className={`font-satoshi font-bold text-[#55525d] lg:text-2xl md:text-xl text-sm cursor-pointer`}
                        href="/"
                    >
                        polling app
                    </Link>
                    {username && (
                        <div className="flex items-center space-x-6">
                            <Link href="/polls/manage">
                                <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/manage' ? 'font-bold' : 'font-medium'}`}>
                                    Manage polls
                                </span>
                            </Link>
                            <Link href="/polls/new">
                                <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/new' ? 'font-bold' : 'font-medium'}`}>
                                    Create poll
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {!username ? (
                    <div className="flex items-center space-x-6">
                        <Link href="/register">
                            <span className={`text-[#55525d] ${pathname === '/register' ? 'font-bold' : 'font-medium'} text-xs sm:text-xs md:text-sm lg:text-base font-satoshi hover:opacity-90 transition-all`}>
                                Register
                            </span>
                        </Link>
                        <Button href="/login">Log in</Button>
                    </div>
                ) : (
                    <Button href="/" onClick={handleLogOut}>Log out</Button>
                )}
            </div>
        </nav>
    );
}