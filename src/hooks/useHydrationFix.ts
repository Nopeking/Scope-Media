'use client';

import { useEffect } from 'react';

export function useHydrationFix() {
  useEffect(() => {
    // Clean up browser extension attributes that cause hydration mismatches
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked');
      });
    };

    // Run cleanup after hydration
    cleanupExtensionAttributes();

    // Set up a mutation observer to clean up attributes added by extensions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
          const target = mutation.target as Element;
          if (target.hasAttribute('bis_skin_checked')) {
            target.removeAttribute('bis_skin_checked');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['bis_skin_checked'],
      subtree: true
    });

    return () => observer.disconnect();
  }, []);
}
