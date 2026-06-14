import Navbar from "./components/Navbar"; // 1. Proveri da li je putanja tačna

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar /> 
        
        {children} 
      </body>
    </html>
  );
}