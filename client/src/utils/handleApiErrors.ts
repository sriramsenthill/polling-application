export const handleApiError = (
    error: any,
    message: string,
    notifyError: (message: string) => void,
    notifyWarning: (message: string) => void,
    resetUserSession: () => void
) => {

    console.log(error);
    if (error.name === "NotAllowedError") {
        resetUserSession();
        notifyError(message);
    } else if (error.response?.data) {
        if (error.response.data.error === "Unauthorized") {
            resetUserSession();
            notifyError(error.response.data.message);
        }
        else {
            notifyError(error.response.data);
        }
    } else {
        notifyWarning(message);
        console.error(error);
    }
};
