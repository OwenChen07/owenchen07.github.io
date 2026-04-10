
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DarkModeProvider } from './contexts/DarkModeContext';

// Migrate old hash-based URLs (e.g. /#/projects) to clean paths (/projects).
if (window.location.hash.startsWith('#/')) {
  const hashPath = window.location.hash.slice(1);
  window.history.replaceState(null, '', hashPath);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DarkModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DarkModeProvider>
  </React.StrictMode>
);
