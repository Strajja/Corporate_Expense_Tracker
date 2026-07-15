'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Reads user role from local storage to configure route visibility.
    setRole(localStorage.getItem("user_role"));
  }, [pathName]);

  const getLinkColor = (linkPath: string) => {
    // Dynamically highlights the active navigation link based on the current URL.
    if (pathName === linkPath) {
      return "text-[#8e082d] font-bold";
    } else {
      return "text-white hover:text-[#8e082d]";
    }
  };

  const handleLogout = () => {
    // Ends user session and redirects to authentication page.
    localStorage.clear();
    router.push("/auth");
  };

  if (pathName === "/auth" || !role) return null;

  return (
    <nav
      className="bg-black px-8 py-4 flex justify-between items-center shadow-lg relative"
    >
      <div>
        <Link
          href="/"
          className="inline-block"
        >
          <div
            className="bg-white w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
          >
            <Image
              src="/img/logo/cet.png"
              alt="Expense Tracker Logo"
              width={32}
              height={32}
            />
          </div>
        </Link>
      </div>

      <ul
        className="absolute left-1/2 -translate-x-1/2 flex flex-row items-center gap-8"
      >
        <li>
          <Link
            href="/"
            className={`transition-colors duration-300 font-medium ${getLinkColor("/")}`}
          >
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            href="/expenses"
            className={`transition-colors duration-300 font-medium ${getLinkColor("/expenses")}`}
          >
            Expenses
          </Link>
        </li>

        {role === "manager" && (
          <li>
            <Link
              href="/approvals"
              className={`transition-colors duration-300 font-medium ${getLinkColor("/approvals")}`}
            >
              Approvals
            </Link>
          </li>
        )}
      </ul>

      <div>
        <button
          onClick={handleLogout}
          className="bg-white text-black px-6 py-2 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}