'use client';

import { useEffect } from 'react';

export function useHydrationFix() {
  useEffect(() => {
    // Clean up browser extension attributes that cause hydration mismatches
    const cleanupExtensionAttributes = () => {
      // Remove bis_skin_checked attributes from all elements
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked');
      });

      // Also check for any other extension-related attributes
      const extensionAttributes = [
        'bis_skin_checked',
        'data-bis_skin_checked',
        'bis_skin_checked_style',
        'data-bis_skin_checked_style'
      ];

      extensionAttributes.forEach(attr => {
        const elementsWithAttr = document.querySelectorAll(`[${attr}]`);
        elementsWithAttr.forEach(element => {
          element.removeAttribute(attr);
        });
      });
    };

    // Run cleanup immediately and repeatedly
    cleanupExtensionAttributes();
    
    // Run cleanup again after a short delay to catch any late additions
    const delayedCleanup = setTimeout(cleanupExtensionAttributes, 100);
    
    // Run cleanup on every frame for the first few seconds
    let frameCount = 0;
    const maxFrames = 60; // ~1 second at 60fps
    
    const frameCleanup = () => {
      if (frameCount < maxFrames) {
        cleanupExtensionAttributes();
        frameCount++;
        requestAnimationFrame(frameCleanup);
      }
    };
    requestAnimationFrame(frameCleanup);

    // Set up a mutation observer to clean up attributes added by extensions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;
          
          // Remove any extension-related attributes
          if (attributeName?.includes('bis_skin_checked') || 
              attributeName?.includes('data-bis_skin_checked')) {
            target.removeAttribute(attributeName);
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked'],
      subtree: true
    });

    return () => {
      clearTimeout(delayedCleanup);
      observer.disconnect();
    };
  }, []);
}
