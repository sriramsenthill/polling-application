import { create } from 'zustand';
import { Bounce, toast } from 'react-toastify';

type NotificationState = {
    notify: (message: string) => void;
    notifyWarning: (message: string) => void;
    notifySuccess: (message: string) => void;
    notifyError: (message: string) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
    notify: (message) => {
        toast.info(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,

        });
    },
    notifyWarning: (message: string) => {
        toast.warn(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,

        });
    },
    notifySuccess: (message: string) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,

        });
    },
    notifyError: (message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    }
}));
