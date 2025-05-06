import "../styles/globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { UserProvider } from "@/context/UserContext";
import { SimulationResultProvider } from "@/context/SimulationResultContext"; // ✅ import it

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <SimulationResultProvider> {/* ✅ Wrap this inside UserProvider */}
            <LayoutWrapper>{children}</LayoutWrapper>
          </SimulationResultProvider>
        </UserProvider>
      </body>
    </html>
  );
}