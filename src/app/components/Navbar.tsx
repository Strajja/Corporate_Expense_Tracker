"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


export default function Navbar() {

    const pathName = usePathname();

    const activeNavText: string = "#8e082d";
    const inactiveNavText: string = "white";


    return (
        <nav
            className="bg-black px-8 py-4 flex justify-between items-center shadow-lg">
            <div>
                <Link
                    href="/"
                    className="inline-block">
                    <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
                        <Image
                            src="/img/logo/cet.png"
                            alt="Expense Tracker Logo"
                            width={32}
                            height={32}
                        />
                    </div>
                </Link>
            </div>

            <ul>
                <li>
                    <Link
                        href="/"
                        className={`transition-colors duration-300 font-medium ${pathName === "/" ? "text-[#8e082d] font-bold" : "text-white hover:text-[#8e082d]"}`}
                    >Dashboard
                    </Link>
                </li>

                <li>
                    <Link
                        href="/expenses"
                        className={`transition-colors duration-300 font-medium ${pathName === "/expenses" ? "text-[#8e082d] font-bold" : "text-white hover:text-[#8e082d]"}`}
                    >Expenses
                    </Link>
                </li>

                <li>
                    <Link
                        href="/expenses"
                        className={`transition-colors duration-300 font-medium ${pathName === "/approvals" ? "text-[#8e082d] font-bold" : "text-white hover:text-[#8e082d]"}`}
                    >Approvals
                    </Link>
                </li>
            </ul>

            <div
                className="flex space-x-4">

                <Link
                    href="/login">
                    <button
                        className="bg-white text-black px-6 py-2 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
                    >Login
                    </button>
                </Link>

                <Link
                    href="/register">
                    <button
                        className="bg-white text-black px-6 py-2 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
                    >Register
                    </button>
                </Link>

            </div>

        </nav>
    );
}