import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Main application layout wrapping all children with Navbar and Footer components.
  return (
    <html
      lang="en"
    >
      <body
        className="flex flex-col min-h-screen"
      > 
        <Navbar />
        
        <main
          className="flex-grow"
        >
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}