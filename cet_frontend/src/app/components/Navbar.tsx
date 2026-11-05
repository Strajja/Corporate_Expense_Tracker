'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Navbar Component
 * Main navigation bar handling dynamic routing and role-based link visibility.
 */
export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();

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
   * Logs out the user by clearing local storage (but keeping language) and redirecting.
   */
  const handleLogout = () => {
    const savedLanguage = localStorage.getItem("language");
    localStorage.clear();
    
    // Restore language after clearing other data (tokens, role, etc.)
    if (savedLanguage) {
      localStorage.setItem("language", savedLanguage);
    }
    
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
            {t("dashboard")}
          </Link>
        </li>
        <li>
          <Link href="/expenses" className={`transition-colors duration-300 font-medium ${getLinkColor("/expenses")}`}>
            {t("expenses")}
          </Link>
        </li>
        
        {/* Render Approvals link only for managers and admins */}
        {(role === "manager" || role === "admin") && (
          <li>
            <Link href="/approvals" className={`transition-colors duration-300 font-medium ${getLinkColor("/approvals")}`}>
              {t("approvals")}
            </Link>
          </li>
        )}
        
        {/* Render Team link for all authenticated user roles */}
        {(role === "manager" || role === "admin" || role === "employee") && (
          <li>
            <Link href="/team" className={`transition-colors duration-300 font-medium ${getLinkColor("/team")}`}>
              {t("myTeam")}
            </Link>
          </li>
        )}
        
        <li>
          <Link href="/account" className={`transition-colors duration-300 font-medium ${getLinkColor("/account")}`}>
            {t("account")}
          </Link>
        </li>
      </ul>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-bold text-sm">
          <button 
            onClick={() => setLanguage('en')}
            className={`transition-colors duration-300 cursor-pointer ${language === 'en' ? 'text-[#8e082d]' : 'text-white hover:text-gray-300'}`}
          >
            ENG
          </button>
          <span className="text-gray-500">|</span>
          <button 
            onClick={() => setLanguage('sr')}
            className={`transition-colors duration-300 cursor-pointer ${language === 'sr' ? 'text-[#8e082d]' : 'text-white hover:text-gray-300'}`}
          >
            СРП
          </button>
        </div>

        <button 
          onClick={handleLogout} 
          className="bg-white text-black px-6 py-2 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
        >
          {t("logout")}
        </button>
      </div>
    </nav>
  );
}