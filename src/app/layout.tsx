import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/ClientNavigation";
import HydrationFix from "@/components/HydrationFix";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

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
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            id="hydration-fix"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  function cleanupExtensionAttributes() {
                    const attributes = ['bis_skin_checked', 'data-bis_skin_checked', 'bis_skin_checked_style', 'data-bis_skin_checked_style'];
                    attributes.forEach(attr => {
                      const elements = document.querySelectorAll('[' + attr + ']');
                      elements.forEach(element => {
                        element.removeAttribute(attr);
                      });
                    });
                  }
                  
                  // Run cleanup immediately
                  cleanupExtensionAttributes();
                  
                  // Run cleanup on DOM ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', cleanupExtensionAttributes);
                  }
                  
                  // Run cleanup repeatedly for the first few seconds
                  let count = 0;
                  const maxCount = 60;
                  const interval = setInterval(() => {
                    cleanupExtensionAttributes();
                    count++;
                    if (count >= maxCount) {
                      clearInterval(interval);
                    }
                  }, 16); // ~60fps
                  
                  // Set up mutation observer
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes') {
                        const target = mutation.target;
                        const attributeName = mutation.attributeName;
                        if (attributeName && (attributeName.includes('bis_skin_checked') || attributeName.includes('data-bis_skin_checked'))) {
                          target.removeAttribute(attributeName);
                        }
                      }
                    });
                  });
                  
                  // Start observing when body is available
                  if (document.body) {
                    observer.observe(document.body, {
                      attributes: true,
                      attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked'],
                      subtree: true
                    });
                  } else {
                    document.addEventListener('DOMContentLoaded', function() {
                      observer.observe(document.body, {
                        attributes: true,
                        attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked'],
                        subtree: true
                      });
                    });
                  }
                })();
              `,
            }}
          />
        </head>
        <body className={`${inter.variable} font-display antialiased`} suppressHydrationWarning>
          <HydrationFix />
          <AuthProvider>
            <ClientNavigation>
              <main className="flex-1" suppressHydrationWarning>
                {children}
              </main>
            </ClientNavigation>
          </AuthProvider>
        </body>
      </html>
    );
}