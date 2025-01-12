import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeAnalytics } from './lib/analytics';
import App from './App';
import './index.css';
import { logger } from './lib/logger';

logger.info('Application starting...');

// Initialize Google Analytics with debug mode
initializeAnalytics();

const root = document.getElementById('root');

if (!root) {
  logger.error('Root element not found');
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);