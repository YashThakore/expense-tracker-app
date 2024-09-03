import React from 'react';
import { createRoot } from 'react-dom/client'; // Correct import for createRoot
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Get the root element from the HTML
const rootElement = document.getElementById('root');

// Create a root using createRoot from ReactDOM
const root = createRoot(rootElement);

// Render the App component inside the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measuring performance in your app (optional)
reportWebVitals();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
