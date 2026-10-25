'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Navbar Component
 * Main navigation bar handling dynamic routing and role-based link visibility.
 */
export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // Retrieve user role from local storage to manage route access
  useEffect(() => {
    setRole(localStorage.getItem("user_role"));
  }, [pathName]);

  /**
   * Determines the text styling based on the active path.
   * Highlights the link if it matches the current URL.
   */
  const getLinkColor = (linkPath: string) => {
    if (pathName === linkPath) {
      return "text-[#8e082d] font-bold";
    }
    return "text-white hover:text-[#8e082d]";
  };

  /**
   * Logs out the user by clearing local storage and redirecting to the auth page.
   */
  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth");
  };

  // Hide Navbar on the authentication page or if the user is not logged in
  if (pathName === "/auth" || !role) return null;

  return (
    <nav className="bg-black px-8 py-4 flex justify-between items-center shadow-lg relative">
      <div>
        <Link href="/" className="inline-block">
          <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
            <Image src="/img/logo/cet.png" alt="Expense Tracker Logo" width={32} height={32} />
          </div>
        </Link>
      </div>

      <ul className="absolute left-1/2 -translate-x-1/2 flex flex-row items-center gap-8">
        <li>
          <Link href="/" className={`transition-colors duration-300 font-medium ${getLinkColor("/")}`}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/expenses" className={`transition-colors duration-300 font-medium ${getLinkColor("/expenses")}`}>
            Expenses
          </Link>
        </li>
        
        {/* Render Approvals link only for managers and admins */}
        {(role === "manager" || role === "admin") && (
          <li>
            <Link href="/approvals" className={`transition-colors duration-300 font-medium ${getLinkColor("/approvals")}`}>
              Approvals
            </Link>
          </li>
        )}
        
        {/* Render Team link for all authenticated user roles */}
        {(role === "manager" || role === "admin" || role === "employee") && (
          <li>
            <Link href="/team" className={`transition-colors duration-300 font-medium ${getLinkColor("/team")}`}>
              Team
            </Link>
          </li>
        )}
        
        <li>
          <Link href="/account" className={`transition-colors duration-300 font-medium ${getLinkColor("/account")}`}>
            Account
          </Link>
        </li>
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