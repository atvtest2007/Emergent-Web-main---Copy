import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

export function usePlatform() {
  const [platform, setPlatform] = useState('web'); // 'web', 'mobile', 'tv'

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const ua = navigator.userAgent.toLowerCase();
    
    // Simple heuristic for Android TV (often has 'tv' or 'smart-tv' in UA, or runs on Leanback)
    const isTVUserAgent = ua.includes('tv') || ua.includes('smart-tv') || ua.includes('leanback');
    
    if (isNative) {
      if (isTVUserAgent) {
        setPlatform('tv');
      } else {
        setPlatform('mobile');
      }
    } else {
      // In web, you might want to simulate TV or Mobile based on window size for testing
      // but defaulting to 'web' is safe.
      const isMobileSize = window.innerWidth <= 768;
      
      // We can use a query param or localStorage to force a platform for testing in browser
      const forcedPlatform = new URLSearchParams(window.location.search).get('platform');
      
      if (forcedPlatform === 'tv') setPlatform('tv');
      else if (forcedPlatform === 'mobile') setPlatform('mobile');
      else setPlatform('web'); // Keep web as default
    }
  }, []);

  return { platform };
}
