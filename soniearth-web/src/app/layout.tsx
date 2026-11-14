import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoniEarth — The Earth Information Jukebox",
  description: "Transforming NASA Earth observation data into real-time accessible musical soundscapes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cosmos-obsidian text-slate-100 min-h-screen antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
