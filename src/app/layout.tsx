import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/ClientNavigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
    title: "Scope Media",
    description: "Your one-stop destination for the best live streams and video content.",
    icons: {
      icon: '/favicon.ico',
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-display antialiased`} suppressHydrationWarning>
        <ClientNavigation>
          <main className="flex-1" suppressHydrationWarning>
            {children}
          </main>
        </ClientNavigation>
      </body>
    </html>
  );
}