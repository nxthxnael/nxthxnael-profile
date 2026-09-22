# nxthxnael — Portfolio

Personal portfolio site for nxthxnael (developer, designer, entrepreneur): about, work, blog, and payments/services.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, installable as a PWA via [Serwist](https://serwist.pages.dev).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build (also builds the service worker via Serwist)
- `npm run start` — run the production build
- `npm run lint` — lint the project

## PWA / Service Worker

The service worker is defined in [`src/app/sw.ts`](src/app/sw.ts) and served at `/serwist/sw.js` via the route handler in [`src/app/serwist/[path]/route.ts`](src/app/serwist/%5Bpath%5D/route.ts), using [`@serwist/turbopack`](https://serwist.pages.dev/docs/next/turbo).

- Service workers only run against a production build — run `npm run build && npm run start` (not `npm run dev`) to test install/offline behavior.
- The web app manifest is generated from [`src/app/manifest.ts`](src/app/manifest.ts) and served at `/manifest.webmanifest`.
- Offline fallback page: [`src/app/offline/page.tsx`](src/app/offline/page.tsx).
- Icons are currently a placeholder monogram at [`public/icon.svg`](public/icon.svg) — swap in real branded icons (ideally also PNG raster sizes for broader platform support) before shipping.

## Deploy

Designed to deploy on [Vercel](https://vercel.com/new). No environment variables are required yet; Stripe/email provider keys will be documented here once those integrations land.
