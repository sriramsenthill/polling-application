"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Authentication, LogOut, Registration } from "@/services/authService";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import _ from "lodash";
import { handleApiError } from "@/utils/handleApiErrors";

export const useLogin = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { setUserSession, resetUserSession } = useUserStore((state) => state);
    const { notifyError, notifySuccess, notifyWarning } = useNotificationStore((state) => state);


    const handleLogin = async () => {
        if (!username.trim()) {
            notifyWarning("Username cannot be empty.");
            return;
        }
        setIsLoading(true);
        try {
            await Authentication(username);
            setUserSession(username);
            notifySuccess("Successfully logged in.");
            router.push("/");
        } catch (error) {
            handleApiError(error, "Error logging in.", notifyError, notifyWarning, resetUserSession);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!username.trim()) {
            notifyWarning("Username cannot be empty.");
            return;
        }
        try {
            setIsLoading(true);
            const registrationFinishResponse = await Registration(username);
            if (registrationFinishResponse.status === 200) {
                notifySuccess("Successfully registered.")
                router.push("/login");
            }
        }
        catch (err) {
            notifyError("Error : " + err);
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogOut = async () => {
        try {
            resetUserSession();
            LogOut();
            router.push("/login");
            notifySuccess("Logged out successfully.");
        } catch (error) {
            notifyError("There seems to be an issue with logging out. Please try again.");
            console.log(error);
        }
    }

    return {
        username,
        setUsername,
        handleLogin,
        isLoading,
        handleRegister
    };
};
