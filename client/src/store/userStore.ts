import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";

type UserState = {
    username: string | null;
    isLoading: boolean,
    setUserSession: (username: string) => void;
    checkUserSession: () => void;
    resetUserSession: () => void;
};

export const useUserStore = create(
    persist<UserState>(
        (set) => ({
            username: null,
            isLoading: true,
            setUserSession: (username) => {
                set({ username, isLoading: false });
            },
            resetUserSession: () => {
                set({ username: null, isLoading: false });
            },
            checkUserSession: () => {
                set({ isLoading: false });
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )

)
