"use client";

import Link from "next/link";
import { useLogin } from "@/hooks/useAuth";
import Button from "@/components/Button";
import BackgroundContainer from "@/components/BackgroundContainer";

export default function Login() {
    const { username, setUsername, handleLogin, isLoading } = useLogin();

    return (
        <BackgroundContainer>
            <div className="w-fit max-w-md p-6 flex flex-col items-start justify-center gap-[15px]">
                <div className="flex flex-col gap-[5px]">
                    <h1 className="font-satoshi font-bold text-lg text-gray-800">Login Here.</h1>
                    <p className="text-xs">Welcome Back, Change Awaits</p>
                </div>
                <div className="flex flex-col gap-2 bg-white rounded-2xl p-4 w-full">
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl py-2 pl-3 text-sm pr-10 border focus:outline-none focus:ring-2 focus:ring-[#D7E96D]"
                    />
                    {isLoading ? (
                        <p className="w-full text-xs text-center">Loading...</p>
                    ) : (
                        <Button href="#" onClick={handleLogin}>
                            Login
                        </Button>
                    )}
                </div>
                <div className="text-center text-sm text-gray-500 w-full">
                    <span>Dont have an account? </span>
                    <Link className="text-black hover:underline" href="/register">
                        Register
                    </Link>
                </div>
            </div>
        </BackgroundContainer>
    );
}