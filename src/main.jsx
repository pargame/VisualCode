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

// Ensure the #root element exists. In some failure modes (service worker, fetched
// index-latest, or other document replacements) the root node can be removed which
// causes the app to disappear; in dev we recreate it and re-render so the UI recovers.
function ensureRoot() {
  let root = document.getElementById('root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
  return root;
}

const rootEl = ensureRoot();
const root = createRoot(rootEl);
root.render(<App />);

// Development-only: watch for the root element being removed/replaced and
// re-insert + re-render once. This helps recover when the document is briefly
// replaced by an index-latest fetch or a page fragment.
if (import.meta.env && import.meta.env.DEV) {
  let recovered = false;
  const mo = new MutationObserver(() => {
    if (recovered) return;
    const current = document.getElementById('root');
    if (!current) {
      // recreate and re-render
      const newRoot = ensureRoot();
      try {
        root.render(<App />);
      } catch (e) {
        // ignore render errors
      }
      recovered = true;
      mo.disconnect();
    }
  });
  mo.observe(document.documentElement || document, { childList: true, subtree: true });
}

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
            // Basic safety checks before performing any replacement:
            // - must contain build meta marker
            // - must contain the app mount or an asset reference
            // - must be of a sensible length
            const hasBuildMeta =
              /<meta[^>]+name=["']build["'][^>]+content=["']latest["'][^>]*>/i.test(text);
            const hasRoot = /<div[^>]+id=["']root["'][^>]*>/i.test(text);
            const hasAssetRef =
              /\/(assets|assets\/)[^"'\s>]+/i.test(text) ||
              /<script[^>]+src=["'][^"']+assets\//i.test(text);
            const minLengthOk = typeof text === 'string' && text.length > 512;

            const currentMeta = document.querySelector('meta[name="build"]');
            const currentIsLatest = currentMeta && /latest/i.test(currentMeta.content || '');

            if (hasBuildMeta && (hasRoot || hasAssetRef) && minLengthOk && !currentIsLatest) {
              // Safe action: don't document.write arbitrary HTML. Instead, force a
              // network reload with a cache-busting query so the browser fetches
              // the latest HTML/assets from the server. This avoids executing
              // unknown inline scripts via document.write.
              try {
                const newUrl =
                  window.location.pathname +
                  (window.location.search ? window.location.search + '&' : '?') +
                  'v=latest-' +
                  Date.now();
                console.info(
                  '[probe] index-latest valid and newer; reloading with cache-buster',
                  newUrl
                );
                // Use replace so history isn't polluted
                window.location.replace(newUrl);
              } catch (e) {
                console.warn('[probe] failed to reload page safely', e);
              }
            } else {
              // Log for diagnostics when probe finds unexpected payloads
              if (!hasBuildMeta) console.warn('[probe] index-latest missing build meta');
              if (!hasRoot && !hasAssetRef)
                console.warn('[probe] index-latest missing root or asset refs');
              if (!minLengthOk)
                console.warn('[probe] index-latest response too short (possible placeholder)');
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
