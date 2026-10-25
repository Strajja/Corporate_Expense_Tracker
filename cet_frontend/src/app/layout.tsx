import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import type { Metadata } from 'next';

/**
 * RootLayout Component
 * Defines the main HTML document structure and injects the global Navbar and Footer.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen"> 
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Corporate Expense Tracker',
  description: 'Service for manipulating expenses in the company.',
  icons: {
    icon: '/img/ico/favicon.ico', // Points to public/favicon.ico
  },
};