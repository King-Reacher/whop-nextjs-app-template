# Solon — verified student hostels near FUNAAB

The Week 1 MVP of the Heinrich & Solon Group student housing platform. It lives
in the `app/(site)` route group; the original Whop app template is untouched in
`app/(whop)` and is documented further down.

## What's built

| Route | What it does |
| --- | --- |
| `/` | The feed: listings with area filter (Camp, Oluwo, Isolu), rent and verified badge. |
| `/hostels/[id]` | Video walkthrough, details, "Lock down this room" and an "Ask on WhatsApp" link with a pre-filled message. |
| `/hostels/[id]/lock` | Lock form. Ticking "Apply for a payment plan" collects matric number and guarantor details. |
| `/bookings/[ref]` | Confirmation page. Verifies the payment with Paystack and hands off to WhatsApp. |
| `/rent-index` | Average, lowest and highest rent per area, computed from the listings. |
| `/api/paystack/webhook` | Signed Paystack webhook that marks a booking paid and takes the room off the market. |

Affiliate links work on any page: `/?ref=su_president` stores the tag in a
30-day cookie (see `proxy.ts`) and it is saved on the booking as `affiliate_tag`.

Fees and installment terms are in `lib/config.ts`.

## Running it

```bash
pnpm i
pnpm exec next dev
```

(`pnpm dev` starts the Whop proxy instead, which the hostel site does not need.)

To build or deploy, `WHOP_API_KEY` and `NEXT_PUBLIC_WHOP_APP_ID` must be set
because the Whop template routes are still in the project. Any placeholder
value works if you are not using them:

```bash
WHOP_API_KEY=unused NEXT_PUBLIC_WHOP_APP_ID=unused pnpm build
```

With no other configuration the site shows **sample listings** under a visible
banner, keeps bookings in memory and skips online payment. To go live, copy
`.env.example` to `.env.local` and fill in:

1. **Supabase** — create a project, run `supabase/schema.sql`, set `SUPABASE_URL`
   and `SUPABASE_SERVICE_ROLE_KEY`, then add scouted hostels to the `hostels`
   table (set `verified_at` once a scout has physically visited).
2. **Paystack** — set `PAYSTACK_SECRET_KEY` and add a webhook pointing at
   `https://your-domain/api/paystack/webhook`.
3. **WhatsApp** — set `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g. `2348012345678`).

## Done by hand in Week 1

- Adding listings and videos: straight into the Supabase table.
- Releasing or refunding a lock fee: Paystack dashboard, then update the
  booking's `status` to `released` or `refunded` and the hostel's `is_available`.
- Payment plans: the site only records the request and the KYC details. Nothing
  is lent or charged automatically.
- Affiliate payouts: query `bookings` by `affiliate_tag`.
- Reviews: the table exists and reviews are displayed, but there is no
  submission form yet.

---

This is a template for a whop app built in NextJS. Fork it and keep the parts you need for your app.

# Whop NextJS App Template

To run this project:

1. Install dependencies with: `pnpm i`

2. Create a Whop App on your [whop developer dashboard](https://whop.com/dashboard/developer/), then go to the "Hosting" section and:
	- Ensure the "Base URL" is set to the domain you intend to deploy the site on.
	- Ensure the "App path" is set to `/experiences/[experienceId]`
	- Ensure the "Dashboard path" is set to `/dashboard/[companyId]`
	- Ensure the "Discover path" is set to `/discover`

3. Copy the environment variables from the `.env.development` into a `.env.local`. Ensure to use real values from the whop dashboard.

4. Go to a whop created in the same org as the app you created. Navigate to the tools section and add your app.

5. Run `pnpm dev` to start the dev server. Then in the top right of the window find a translucent settings icon. Select "localhost". The default port 3000 should work.

## Deploying

1. Upload your fork / copy of this template to github.

2. Go to [Vercel](https://vercel.com/new) and link the repository. Deploy your application with the environment variables from your `.env.local`

3. If necessary update you "Base Domain" and webhook callback urls on the app settings page on the whop dashboard.

## Troubleshooting

**App not loading properly?** Make sure to set the "App path" in your Whop developer dashboard. The placeholder text in the UI does not mean it's set - you must explicitly enter `/experiences/[experienceId]` (or your chosen path name)
a

**Make sure to add env.local** Make sure to get the real app environment vairables from your whop dashboard and set them in .env.local


For more info, see our docs at https://dev.whop.com/introduction
