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

## Content

- Blog posts: MDX files under [`content/blog/`](content/blog), rendered via [`next-mdx-remote/rsc`](https://github.com/hashicorp/next-mdx-remote). Each post needs `title`, `date`, `excerpt`, and `tags` frontmatter.
- Projects, about/bio, services/pricing, and contact/social info live in [`src/content/`](src/content) — all currently placeholder data, ready to swap for the real thing.

## Payments (Stripe)

The `/services` page sells fixed-scope packages and accepts tips, both via [Stripe Checkout](https://docs.stripe.com/checkout/quickstart).

1. Copy `.env.example` to `.env.local`.
2. Add a Stripe secret key (test or live) as `STRIPE_SECRET_KEY` — get one from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
3. Restart the dev server. Without a key, checkout still works end to end but lands on `/services/cancel` with a clear "payments aren't set up yet" message instead of erroring.

Packages and tip amounts are defined in [`src/content/services.ts`](src/content/services.ts); pricing is sent to Stripe via `price_data` at checkout time, so there's no need to pre-create Products/Prices in the Stripe dashboard.

## Deploy

Designed to deploy on [Vercel](https://vercel.com/new). Set `STRIPE_SECRET_KEY` in the project's environment variables to enable payments in production.
