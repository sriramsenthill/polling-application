"use client";

import Link from "next/link";
import { useLogin } from "@/hooks/useAuth";

export default function Login() {

    const { username, setUsername, handleLogin, isLoading } = useLogin();

    return (
        <div className="w-full h-[80dvh] flex justify-center items-center">
            <div className="w-fit max-w-md p-6 rounded-xl transition-all bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] h-[20rem] flex flex-col items-start justify-center gap-[15px]">
                <div className="flex flex-col gap-[5px]">
                    <h1 className="font-sans text-lg font-semibold text-gray-800">Login Here.</h1>
                    <p className="text-xs">Welcome Back, Change Awaits</p>
                </div>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl py-2 pl-3 text-sm pr-10 border focus:outline-none focus:ring-2 focus:ring-[#D7E96D]"
                />
                {isLoading ? <p className="w-full text-xs text-center">Loading...</p> : <button
                    className="w-full py-[5px] text-sm rounded-xl bg-[#B4FE3A] text-black shadow hover:bg-[#b2ff36] focus:outline-none focus:ring-2 focus:ring-[#d0ff85] transition"
                    onClick={handleLogin}
                >
                    Login
                </button>}
                <div className="text-center text-sm text-gray-500">
                    <span>Dont have an account? </span>
                    <Link
                        className="text-black hover:underline"
                        href="/register"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>

    );


}
