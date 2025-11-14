import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/ClientNavigation";
import HydrationFix from "@/components/HydrationFix";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Script from "next/script";

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
          <Script
            id="media-protection"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Console warning for developers
                  console.log('%c⚠️ WARNING', 'color: red; font-size: 24px; font-weight: bold;');
                  console.log('%cThis site is protected. Unauthorized access to media sources is prohibited.', 'color: orange; font-size: 14px;');
                  console.log('%cAttempting to extract media files may violate copyright laws.', 'color: orange; font-size: 14px;');

                  // Disable right-click on images and videos
                  document.addEventListener('contextmenu', function(e) {
                    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }, true);

                  // Prevent dragging of images
                  document.addEventListener('dragstart', function(e) {
                    if (e.target.tagName === 'IMG') {
                      e.preventDefault();
                      return false;
                    }
                  });

                  // Disable common dev tools shortcuts (F12, Ctrl+Shift+I, etc.)
                  document.addEventListener('keydown', function(e) {
                    // F12
                    if (e.keyCode === 123) {
                      e.preventDefault();
                      return false;
                    }
                    // Ctrl+Shift+I (Inspect)
                    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                      e.preventDefault();
                      return false;
                    }
                    // Ctrl+Shift+J (Console)
                    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                      e.preventDefault();
                      return false;
                    }
                    // Ctrl+U (View Source)
                    if (e.ctrlKey && e.keyCode === 85) {
                      e.preventDefault();
                      return false;
                    }
                    // Ctrl+Shift+C (Inspect Element)
                    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                      e.preventDefault();
                      return false;
                    }
                  });

                  // Detect devtools and show warning
                  let devtoolsOpen = false;
                  const threshold = 160;

                  setInterval(function() {
                    if (window.outerWidth - window.innerWidth > threshold ||
                        window.outerHeight - window.innerHeight > threshold) {
                      if (!devtoolsOpen) {
                        devtoolsOpen = true;
                        console.clear();
                        console.log('%c⚠️ SECURITY ALERT', 'color: red; font-size: 30px; font-weight: bold;');
                        console.log('%cDeveloper tools detected. Media sources are protected.', 'color: red; font-size: 16px;');
                      }
                    } else {
                      devtoolsOpen = false;
                    }
                  }, 500);
                })();
              `,
            }}
          />
          <Script
            id="iframe-src-protection"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Monitor and protect iframe src attributes
                  setInterval(function() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(function(iframe) {
                      // Make iframe src harder to access
                      try {
                        iframe.setAttribute('data-protected', 'true');

                        // Intercept getAttribute calls
                        const originalGetAttribute = iframe.getAttribute;
                        iframe.getAttribute = function(attr) {
                          if (attr === 'src' || attr === 'data-src') {
                            console.warn('⚠️ Unauthorized access to protected media source');
                            return '';
                          }
                          return originalGetAttribute.call(this, attr);
                        };
                      } catch (e) {
                        // Silently handle errors
                      }
                    });
                  }, 1000);

                  // Prevent opening links in new tabs from iframe
                  document.addEventListener('click', function(e) {
                    const target = e.target;
                    if (target && target.tagName === 'A' && target.href && target.href.includes('youtube.com/watch')) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }, true);
                })();
              `,
            }}
          />
        </head>
        <body className={`${inter.variable} font-display antialiased`} suppressHydrationWarning>
          <HydrationFix />
          <AuthProvider>
            <AdminAuthProvider>
              <ClientNavigation>
                <main className="flex-1" suppressHydrationWarning>
                  {children}
                </main>
              </ClientNavigation>
            </AdminAuthProvider>
          </AuthProvider>
        </body>
      </html>
    );
}