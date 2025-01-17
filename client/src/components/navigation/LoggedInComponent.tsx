'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function LoggedInComponent() {
    const pathname = usePathname();

    return (
        <div className="flex items-center space-x-6 flex-1 justify-end">
            <Link href="/polls/manage">
                <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/manage' ? 'font-bold' : 'font-medium'}`}>
                    Manage polls
                </span>
            </Link>
            <Link href="/polls/new">
                <span className={`text-[#55525d] text-sm hover:opacity-90 transition-all ${pathname === '/polls/new' ? 'font-bold' : 'font-medium'}`}>
                    Create poll
                </span>
            </Link>
        </div>
    );
}