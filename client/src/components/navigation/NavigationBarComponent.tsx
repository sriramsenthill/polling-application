'use client';

import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoggedInComponent from "./LoggedInComponent";
import axiosInstance from "@/utils/axiosInstance";
export default function NavigationBar() {
    const { checkUserSession, username, isLoading } = useUserStore((state) => state);

    const router = useRouter();

    useEffect(() => {
        checkUserSession();
        if (!isLoading && !username) {
            router.push("/login");
        }
    }, [checkUserSession, username, isLoading]);

    return (
        <nav className="bg-white m-4 shadow-md rounded-2xl">
            <div className="max-w-7xl p-[15px] rounded-md mx-auto flex justify-between items-center">
                <div className="text-black font-semibold">
                    <Link className="lg:text-2xl md:text-xl text-sm" href="/">Polling Application</Link>
                </div>
                <div className="flex space-x-3 lg:space-x-6 md:space-x-6  items-center">
                    {username ?
                        <LoggedInComponent /> :
                        <>
                            <Link className="text-center lg:text-base md:text-base text-xs hover:-translate-y-[3px] text-black transition-all hover:text-black-200" href="/register">
                                Register
                            </Link>
                            <Link href="/login" className="bg-slate-500 transition-all py-2 px-6 rounded-xl  hover:-translate-y-[3px]  hover:text-black focus:outline-none focus:ring-2 focus:ring-black" >
                                <span className="text-black lg:text-base md:text-base text-xs hover:text-black transition">Log in</span>
                            </Link>
                        </>
                    }
                </div>

            </div>
        </nav>
    );
};