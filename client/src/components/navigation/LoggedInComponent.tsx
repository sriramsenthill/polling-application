"use client";

import { useUserStore } from "@/store/userStore";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoggedInComponent() {

    const { resetUserSession, username } = useUserStore((state) => state);

    const router = useRouter();

    const handleLogOut = async () => {
        try {
            resetUserSession();

            const response = await (await axiosInstance.post("/auth/logout")).data;

            console.log(response);

            router.push("/login");

            console.log("Logged out successfully.");
        } catch (error) {
            console.log("Logout failed:", error);
        }
    }
    return <>
        <Link className="flex justify-center items-center" href="/">
            <span className="text-black text-xs sm:text-base md:text-base lg:text-base opacity-90 hover:opacity-100 transition-all hover:-translate-y-[3px]">Home</span>
        </Link>


        <Link className="justify-center items-center flex md:hidden lg:hidden" href={"/polls/manage"}>
            <span className="text-black text-xs sm:text-base md:text-base lg:text-base opacity-90 hover:opacity-100 transition-all hover:-translate-y-[3px]">Manage</span>
        </Link>


        <Link className="justify-center items-center flex md:hidden lg:hidden" href="/polls/new">
            <span className="text-black text-xs sm:text-base md:text-base lg:text-base opacity-90 hover:opacity-100 transition-all hover:-translate-y-[3px]">Create</span>
        </Link>


        <Link className="lg:flex md:flex justify-center items-center hidden" href={"/polls/manage"}>
            <span className="text-black text-xs sm:text-base md:text-base lg:text-base opacity-90 hover:opacity-100 transition-all hover:-translate-y-[3px]">Manage polls</span>
        </Link>


        <Link className="lg:flex md:flex justify-center items-center hidden" href="/polls/new">
            <span className="text-black text-xs sm:text-base md:text-base lg:text-base opacity-90 hover:opacity-100 transition-all hover:-translate-y-[3px]">Create poll</span>
        </Link>

        <Link href="#" onClick={handleLogOut} className="bg-[#B4FE3A] py-1 px-3 lg:py-2 lg:px-6 rounded-lg hover:-translate-y-1 hover:text-black focus:outline-none focus:ring-2 focus:ring-black transition">
            <span className="text-black text-xs sm:text-base md:text-base lg:text-base opacity-90 hover:opacity-100 transition-all hover:-translate-y-[3px]">Log out</span>
        </Link>
    </>
};