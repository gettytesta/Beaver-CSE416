import "../styles/globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex-1 ml-60">
          {/* Navbar */}
          <Navbar />

          {/* Main Page Content below navbar */}
          <div className="px">{children}</div>
        </div>
      </body>
    </html>
  );
}