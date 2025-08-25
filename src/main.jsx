import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Ensure any previously-registered service workers are unregistered and caches cleared
// This prevents stale SW from serving old HTML/assets after a deploy
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        regs.forEach((reg) => {
          try {
            reg.unregister();
          } catch (e) {
            /* ignore */
          }
        });
      })
      .catch(() => {});
  } catch (e) {
    // ignore
  }

  // Clear caches if available (best-effort)
  if ('caches' in window) {
    try {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    } catch (e) {
      // ignore
    }
  }
}

createRoot(document.getElementById('root')).render(<App />);
