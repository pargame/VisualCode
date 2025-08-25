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

// Periodically probe for a network-delivered 'index-latest.html' and replace page if it's newer.
// This is a last-resort client-side cache-buster when Pages/CDN/SW serve stale HTML.
function probeAndReplaceIndexLatest(intervalMs = 10000, attempts = 6) {
  if (typeof window === 'undefined' || !window.fetch) return;
  const tryOnce = () => {
    try {
      fetch('/VisualCode/index-latest.html', { cache: 'no-store', credentials: 'same-origin' })
        .then((res) => {
          if (!res.ok) return;
          return res.text();
        })
        .then((text) => {
          if (!text) return;
          try {
            // detect build marker meta tag
            const hasLatest = /<meta[^>]+name=["']build["'][^>]+content=["']latest["'][^>]*>/i.test(
              text
            );
            const currentMeta = document.querySelector('meta[name="build"]');
            const currentIsLatest = currentMeta && /latest/i.test(currentMeta.content || '');
            if (hasLatest && !currentIsLatest) {
              // replace document with fetched HTML (force newest)
              document.open();
              document.write(text);
              document.close();
            }
          } catch (e) {
            // ignore
          }
        })
        .catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  let tries = 0;
  const id = setInterval(() => {
    if (tries >= attempts) {
      clearInterval(id);
      return;
    }
    tryOnce();
    tries += 1;
  }, intervalMs);
}

// Start probes after a short delay to give initial unload/unregister a chance
// Only run the probe replacement in production builds; during local development
// the probe can accidentally replace the document (blank UI) when a fetch
// returns an unexpected payload.
if (import.meta.env && import.meta.env.PROD) {
  setTimeout(() => probeAndReplaceIndexLatest(10000, 12), 2000);
}
