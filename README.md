# WeCare 2.0 – Web App

## Files
| File | Purpose |
|------|---------|
| `index.html` | Main app — all 37 pages |
| `app.css` | Styles — mobile-first, portrait-optimised |
| `app.js` | Navigation, swipe-back, tabs |
| `sw.js` | Service worker — full offline support |
| `manifest.json` | PWA manifest — Add to Home Screen |
| `icon-192.png` | App icon 192×192 (Android) |
| `icon-512.png` | App icon 512×512 (splash screen) |
| `apple-touch-icon.png` | App icon 180×180 (iOS) |
| `favicon.png` | Browser favicon 32×32 |
| `icon.svg` | Vector icon (modern browsers) |

## Hosting (static — no server code needed)

### Netlify (recommended — free)
1. Go to netlify.com → "Add new site" → "Deploy manually"
2. Drag the entire `wecare-app/` folder onto the deploy zone
3. Done. You get a URL like `https://wecare-abc123.netlify.app`

### Vercel
```bash
npx vercel deploy --prod
```

### GitHub Pages
Push to a repo → Settings → Pages → Deploy from branch → `main` / `root`

### Any nginx / Apache server
Point the document root at this folder. No rewrite rules needed.

### Local testing
```bash
# Python 3 built-in server (needed for service worker to register)
python3 -m http.server 8080
# Then open http://localhost:8080
```
> **Note:** Open via `http://localhost` not by double-clicking the file —
> service workers require a server context.

## Access
There is no login — the app opens directly on the WeCare 2.0 wheel.

## Offline / PWA
On first visit the service worker caches all files (fonts are bundled locally).
After that the app works with **no internet connection** — ideal for use at sea.
When online, pages, styles and scripts are always fetched fresh first, so
users see updates on their next visit; the cache is only used as an offline fallback.

## Add to Home Screen
- **iOS Safari:** tap Share → "Add to Home Screen" → the WeCare logo appears
- **Android Chrome:** tap the menu → "Add to Home Screen" / "Install app"

The app then opens full-screen in portrait mode, indistinguishable from a native app.

## Swipe navigation
Swipe right from the left edge of the screen to go back — works alongside the back button.

## Updating the app
Bump the version string in `sw.js` (`CACHE_NAME = 'wecare-v9'`) whenever files
change. This refreshes the offline copy and deletes old caches on users' devices.
