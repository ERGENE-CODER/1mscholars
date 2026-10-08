"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ClipboardList, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";

export default function ProfileMenu({
    name,
    email,
    isAdmin,
}: {
    name: string | null;
    email: string | null;
    isAdmin: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    const initial = (name || email || "?").trim().charAt(0).toUpperCase();

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Open profile menu"
                aria-expanded={open}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#2166E8] text-[16px] font-bold text-white shadow-sm transition hover:bg-[#1554C7]"
            >
                {initial}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,45,90,0.15)]">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF5FF] text-[18px] font-bold text-[#2166E8]">
                            {initial}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-[#12396B]">
                                {name || "My account"}
                            </p>
                            <p className="truncate text-[13px] text-gray-500">{email}</p>
                            {isAdmin && (
                                <span className="mt-1 inline-block rounded-full bg-[#12396B] px-2 py-0.5 text-[11px] font-semibold text-white">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-3">
                        <Link
                            href="/my-applications"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#102F59] transition hover:bg-gray-50 hover:text-[#2166E8]"
                        >
                            <ClipboardList size={17} />
                            My Applications
                        </Link>
                    </div>

                    <form action={signOut} className="pt-1">
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#102F59] transition hover:bg-gray-50 hover:text-red-600"
                        >
                            <LogOut size={17} />
                            Logout
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}