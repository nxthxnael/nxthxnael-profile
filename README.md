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

## Payments (Paystack)

The `/services` page sells fixed-scope packages (priced in KES) and accepts tips, both via [Paystack](https://paystack.com/docs/payments/accept-payments/)'s hosted checkout.

1. Copy `.env.example` to `.env.local`.
2. Add a Paystack secret key (test or live) as `PAYSTACK_SECRET_KEY` — get one from the [Paystack dashboard](https://dashboard.paystack.com/#/settings/developers).
3. Restart the dev server. Without a key, checkout still works end to end but lands on `/services/cancel` with a clear "payments aren't set up yet" message instead of erroring.

Packages, currency, and tip amounts are defined in [`src/content/services.ts`](src/content/services.ts) — pricing there is placeholder/generated and needs review before going live. `src/lib/paystack.ts` wraps Paystack's REST API directly (`/transaction/initialize` and `/transaction/verify`) — no SDK dependency needed. Customers enter their email at checkout, which Paystack requires; on completion they land on `/services/success`, which verifies the transaction status server-side before showing confirmation.

### Webhook + Discord notifications

[`src/app/api/webhooks/paystack/route.ts`](src/app/api/webhooks/paystack/route.ts) receives `charge.success` events directly from Paystack (more reliable than the browser callback alone, since it fires even if the customer closes the tab) and posts a notification to Discord via [`src/lib/discord.ts`](src/lib/discord.ts).

1. Set `DISCORD_WEBHOOK_URL` in `.env.local` (and in Vercel for production) — create one under a Discord channel's *Settings → Integrations → Webhooks*. Optional; the webhook route still verifies and acknowledges Paystack events without it, it just skips the Discord post.
2. In the [Paystack dashboard](https://dashboard.paystack.com/#/settings/developers), set the **Live Webhook URL** (and **Test Webhook URL**, separately, for test mode) to `https://yourdomain.com/api/webhooks/paystack`.

Every request is verified against the `x-paystack-signature` header (HMAC-SHA512 of the raw body using `PAYSTACK_SECRET_KEY`) before anything is processed — requests that don't match are rejected with `401`.

## Deploy

Designed to deploy on [Vercel](https://vercel.com/new). Set `PAYSTACK_SECRET_KEY` (required) and `DISCORD_WEBHOOK_URL` (optional) in the project's environment variables to enable payments and notifications in production.
