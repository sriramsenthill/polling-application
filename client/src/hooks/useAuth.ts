"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Authentication, Registration } from "@/services/authService";
import { useUserStore } from "@/store/userStore";

export const useLogin = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

    const router = useRouter();
    const { setUserSession } = useUserStore((state) => state);

    const handleLogin = async () => {
        if (!username.trim()) {
            setMessage({ type: "error", text: "Username cannot be empty." });
            return;
        }
        setIsLoading(true);
        setMessage(null);
        try {
            await Authentication(username);
            setUserSession(username);
            setMessage({ type: "success", text: "Successfully logged in." });
            console.log("username is: ", username);
            router.push("/");
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: "error", text: `Error: ${error.message}` });
            } else {
                setMessage({ type: "error", text: "Error logging in. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleRegister = async () => {
        if (!username.trim()) {
            setMessage({ type: "error", text: "Username cannot be empty." });
            return;
        }
        setIsLoading(true);
        setMessage(null);
        try {
            const registrationFinishResponse = await Registration(username);
            if (registrationFinishResponse.status === 200) {
                setMessage({ type: "success", text: "Successfully registered." });
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: "error", text: `Error: ${error.message}` });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        username,
        setUsername,
        handleLogin,
        handleRegister,
        isLoading,
        message,
    };
};
