export const metadata = {
  title: "Beaver LFP",
  description: "Lifetime Financial Planner by team Beaver",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
