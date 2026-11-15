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
3. For the monthly care plans, create a monthly Plan per tier in Paystack (Products → Plans) with the same price as `src/content/services.ts`, and add its code as `PAYSTACK_PLAN_CARE` / `PAYSTACK_PLAN_GROW`. Checkout passes the plan code, so Paystack creates the subscription and charges renewals itself.
4. Restart the dev server. Without a key, checkout still works end to end but lands on `/services/cancel` with a clear "payments aren't set up yet" message instead of erroring.

Packages, currency, and tip amounts are defined in [`src/content/services.ts`](src/content/services.ts) — Web Development & SEO prices are founding-client rates; Design and Business pricing is still placeholder. `src/lib/paystack.ts` wraps Paystack's REST API directly (`/transaction/initialize` and `/transaction/verify`) — no SDK dependency needed. Customers enter their email at checkout, which Paystack requires; on completion they land on `/services/success`, which verifies the transaction status server-side before showing confirmation.

### Webhook + Discord notifications

[`src/app/api/webhooks/paystack/route.ts`](src/app/api/webhooks/paystack/route.ts) receives `charge.success` events directly from Paystack (more reliable than the browser callback alone, since it fires even if the customer closes the tab) and posts a notification to Discord via [`src/lib/discord.ts`](src/lib/discord.ts).

1. Set `DISCORD_WEBHOOK_URL` in `.env.local` (and in Vercel for production) — create one under a Discord channel's *Settings → Integrations → Webhooks*. Optional; the webhook route still verifies and acknowledges Paystack events without it, it just skips the Discord post.
2. In the [Paystack dashboard](https://dashboard.paystack.com/#/settings/developers), set the **Live Webhook URL** (and **Test Webhook URL**, separately, for test mode) to `https://yourdomain.com/api/webhooks/paystack`.

Every request is verified against the `x-paystack-signature` header (HMAC-SHA512 of the raw body using `PAYSTACK_SECRET_KEY`) before anything is processed — requests that don't match are rejected with `401`.

### Rate limiting & abuse protection

[`src/lib/rate-limit.ts`](src/lib/rate-limit.ts) rate limits `/api/checkout` (10 requests/60s per IP) and `/api/webhooks/paystack` (30/60s per IP) using [Upstash](https://upstash.com) Redis, and deduplicates webhook retries/replays by `reference`. `/api/checkout` also rejects cross-site form submissions (an `Origin`/`Referer` that doesn't match the site's own host).

1. Create a free Redis database at [console.upstash.com](https://console.upstash.com).
2. Copy its REST URL and token (Database → REST API) into `.env.local` as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (and into Vercel for production).

Both env vars are optional — without them, rate limiting and replay-dedup fail **open** (requests are allowed, a `console.warn` is logged) rather than breaking checkout before you've set this up.

## Client area

Project pages stay public. A project with `clientArea: true` in [`src/content/projects.ts`](src/content/projects.ts) also gets a **Client access** link to `/work/<slug>/client`. There, a client signs in with a one-time email link and sees that project's private links and files.

- **Who sees what** lives in Supabase (`supabase/migrations/`): `project_members` lists the emails allowed on each project slug, and `project_resources` lists the links and files they see. Row level security enforces it in the database, so a client only ever reads their own projects.
- **Files** go in the private `client-files` storage bucket under `<slug>/...`; the page hands out download links that expire after 5 minutes.
- **Sign-in links** are only emailed to addresses on the project's member list, checked on the server with the secret key, and the form answers the same way either way.
- **Passwords never go here.** Share credentials through a password manager.

Setup:

1. Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` (see `.env.example`) locally and in Vercel.
2. In Supabase → Authentication → URL Configuration, set the Site URL to `https://nxthxnael.dev` and add `https://nxthxnael.dev/auth/callback` and `http://localhost:3000/auth/callback` as redirect URLs.
3. Add a custom SMTP sender (for example Resend) under Authentication → SMTP. Supabase's built-in email only reaches members of your Supabase organisation, so clients won't get links without it.
4. For each client: add a row to `project_members` (lowercase email), add rows to `project_resources`, upload files under `client-files/<slug>/`, and set `clientArea: true` on the project.

## Deploy

Designed to deploy on [Vercel](https://vercel.com/new). Required: `PAYSTACK_SECRET_KEY`, plus `PAYSTACK_PLAN_CARE` and `PAYSTACK_PLAN_GROW` for the Care and Grow plans to be purchasable (without them those checkouts show a "not set up" message). Optional but recommended: `DISCORD_WEBHOOK_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
