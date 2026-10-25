import React from "react";

/**
 * Footer Component
 * Renders the global application footer containing copyright info and contact links.
 */
export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 p-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Corporate Expense Tracker. All rights reserved. 
            <span className="ml-2 text-xs text-gray-500 font-mono">v1.0.0</span>
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-sm">
            Developed by <span className="text-white font-medium">Strahinja Stefanović</span>
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a
              href="https://www.linkedin.com/in/strahinja-stefanovic-414b3a214"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#8e082d] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Strajja"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#8e082d] transition-colors"
            >
              GitHub
            </a>
            <a
              href="mailto:stradza.stefanovic@gmail.com"
              className="hover:text-[#8e082d] transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}