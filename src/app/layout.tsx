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
      <head>
        {/* Apply the saved theme before paint to avoid a flash. 'system' (or
            anything else) leaves the media-query default in place. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
