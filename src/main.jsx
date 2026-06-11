import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics and Speed Insights
inject();
injectSpeedInsights();

// Simple error handler to prevent blank screens
const handleError = (error) => {
  console.error('Caught error:', error);
  
  // Render a basic error message if the app fails to load
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #0B1221; min-height: 100vh;">
        <h1>Something went wrong</h1>
        <p>The application failed to load. Please refresh the page or try again later.</p>
        <pre style="margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.1); overflow: auto; max-height: 200px; border-radius: 5px;">
          ${error?.message || 'Unknown error'}\n${error?.stack || ''}
        </pre>
        <button 
          onclick="window.location.reload()" 
          style="margin-top: 20px; padding: 10px 20px; background: #00FFD1; color: #0B1221; border: none; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
};

// Wrap the app rendering in a try-catch
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
} catch (error) {
  handleError(error);
}

// Add global error handler
window.addEventListener('error', (event) => {
  handleError(event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason);
});


