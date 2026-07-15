import React from "react";

export default function Footer() {
  // Renders the global footer component.
  return (
    <footer
      className="bg-black text-white p-6 mt-auto"
    >
      <div
        className="container mx-auto text-center"
      >
        <p
          className="text-sm"
        >
          &copy; {new Date().getFullYear()} SAP Fioneer ExpenseApp. All rights reserved.
        </p>
        <div
          className="flex justify-center space-x-4 mt-2"
        >
          <a
            href="#"
            className="hover:text-[#8e082d] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-[#8e082d] transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}