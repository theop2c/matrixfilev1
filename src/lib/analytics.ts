import { logger } from './logger';

// Initialize Google Analytics
export function initializeAnalytics() {
  try {
    const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
    
    if (!measurementId) {
      throw new Error('Missing Google Analytics Measurement ID');
    }

    // Add Google Analytics Script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());

    // Enable debug mode
    gtag('config', measurementId, {
      'debug_mode': true
    });

    logger.info('Google Analytics initialized with debug mode');
  } catch (error) {
    logger.error('Failed to initialize Google Analytics:', error);
  }
}