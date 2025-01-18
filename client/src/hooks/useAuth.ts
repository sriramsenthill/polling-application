"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Authentication, LogOut, Registration } from "@/services/authService";
import { useUserStore } from "@/store/userStore";
import _ from "lodash";

export const useLogin = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

    const router = useRouter();
    const { setUserSession, resetUserSession } = useUserStore((state) => state);

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
            router.push("/");
        } catch (error) {
            setMessage({ type: "error", text: "Error logging in. Please try again." });
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
            setMessage({ type: "error", text: "Error registering. Please try again." });
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
