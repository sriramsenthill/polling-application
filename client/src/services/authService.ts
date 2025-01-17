import axiosInstance from "@/utils/axiosInstance";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

export const Registration = async (username: string) => {
    try {
        const registrationStartResponse = await axiosInstance.post(`/auth/start_reg/${username}`);

        const credentials = await registrationStartResponse.data.publicKey;

        const attResponse = await startRegistration({ optionsJSON: credentials });

        const registrationFinishResponse = await axiosInstance.post(`/auth/finish_reg`, JSON.stringify(attResponse));

        return registrationFinishResponse;
    } catch (error) {
        throw error;
    }
}
export const Authentication = async (username: string) => {
    try {
        const authenticationStartResponse = await axiosInstance.post(`/auth/start_auth/${username}`);

        const requestOptions = authenticationStartResponse.data.publicKey;

        const attResp = await startAuthentication({ optionsJSON: requestOptions });

        const authenticationFinishResponse = await axiosInstance.post(`/auth/finish_auth/${username}`, attResp);

        return authenticationFinishResponse;
    } catch (error) {
        throw error;
    }
}

export const LogOut = async () => {
    try {
        await (await axiosInstance.post("/auth/logout")).data;
    } catch (error) {
        throw error;
    }
}