# SMM Vault Panel

![SMM Vault social preview](public/images/og-image.svg)

The production preview route is `https://website.com/home`; Vercel rewrites it to the main frontend entry point while keeping `/index.html` available for local Express development.

Vanilla HTML/CSS/JavaScript frontend with an Express/PostgreSQL backend. The SMM Vault API key is server-only.

## Setup

1. Install Node.js 18+ and PostgreSQL.
2. Run `npm install`.
3. Create a database named `smm_panel` and run `psql "$env:DATABASE_URL" -f database/schema.sql` (or use your PostgreSQL client).
4. Copy `.env.example` to `.env`, set `DATABASE_URL` and a strong `JWT_SECRET`, then add `SMMVAULT_API_KEY` for live mode.
5. Run `npm run dev`.
6. Open `http://localhost:5000`.

Without an API key, `DEMO_MODE=true` supplies local sample services and accepts orders locally; no fake provider response is used when a real key is configured. Create the first admin by registering, then update that user's role to `admin` in PostgreSQL.

Razorpay endpoints are prepared but intentionally do not credit wallets from browser success. Add signature verification and order creation credentials before enabling live payments.
