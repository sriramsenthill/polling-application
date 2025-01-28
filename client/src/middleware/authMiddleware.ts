"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

const useAuthMiddleware = () => {
    const username = useUserStore((state) => state.username);
    const router = useRouter();

    useEffect(() => {
        if (!username) {
            router.replace("/"); // Redirect to home if no session
        }
    }, [username, router]);
};

export default useAuthMiddleware;
