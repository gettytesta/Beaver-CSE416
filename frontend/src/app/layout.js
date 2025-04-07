import "../styles/globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { UserProvider } from "@/context/UserContext"; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap the entire app in UserProvider to manage user session state */}
        <UserProvider> 
          {/* LayoutWrapper handles consistent navigation and layout across pages */}
          <LayoutWrapper>{children}</LayoutWrapper>
        </UserProvider>
      </body>
    </html>
  );
}