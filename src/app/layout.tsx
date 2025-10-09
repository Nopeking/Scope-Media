import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
    title: "Scope Media",
    description: "Your one-stop destination for the best live streams and video content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" data-theme="light">
      <body className={`${inter.variable} font-display bg-background-light text-slate-800 antialiased`} suppressHydrationWarning>
        <div className="flex min-h-screen w-full flex-col" suppressHydrationWarning>
          <Navigation />
          <main className="flex-1" suppressHydrationWarning>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}