import "../styles/globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { UserProvider } from "@/context/UserContext"; // 👈 import the context

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider> 
          <LayoutWrapper>{children}</LayoutWrapper>
        </UserProvider>
      </body>
    </html>
  );
}