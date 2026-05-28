import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelPlanner – Reisen & Events gemeinsam planen",
  description:
    "Kollaborativ Reisen und Events planen: Flüge, Unterkünfte, Gegenden, Kosten und Mitreisende an einem Ort.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
