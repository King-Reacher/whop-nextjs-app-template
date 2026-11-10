# Heinrich & Solon Residences

Verified student hostels near FUNAAB, by Heinrich & Solon Group. The site lives
in the `app/(site)` route group; the original Whop app template is untouched in
`app/(whop)` and is documented further down.

## Brand and look

- The name, descriptor ("Residences") and short name ("H&S") are set in `BRAND`
  in `lib/config.ts`.
- Colours, the button gradient and the shared styles (`.panel`, `.btn`,
  `.field`, `.chip`) are in `app/(site)/site.css`. The theme is near-black with
  a violet to fuchsia accent.
- Headings and the wordmark use Cormorant Garamond, self-hosted through
  `next/font`. Everything else uses the phone's system font to stay light.
- On phones the main navigation is a tab bar pinned to the bottom of the screen.
- Three themes, picked with the colour dots in the header: Obsidian (black and
  violet, the default), Pearl (white) and Amethyst (deep purple). The choice is
  remembered in a cookie. Each theme is just a block of variables in
  `site.css`, and the list of themes is in `lib/theme.ts`.

## What's built

| Route | What it does |
| --- | --- |
| `/` | The feed. Filter by area, room type, rent, walk time and amenities, and switch between a list and a map with price pins. |
| `/hostels/[id]` | Video walkthrough, photo gallery, details, "Lock down this room", "Save room" and an "Ask on WhatsApp" link with a pre-filled message. |
| `/hostels/[id]/lock` | Lock form. Ticking "Apply for a payment plan" collects matric number and guarantor details. |
| `/bookings/[ref]` | Confirmation page. Verifies the payment with Paystack and hands off to WhatsApp. |
| `/sign-in` | Sign in with a phone number and a 6-digit code sent by text. No passwords. Only needed to save rooms. |
| `/saved` | A signed-in student's saved rooms and their bookings. |
| `/app` | "Get the app": install button and step-by-step instructions for Android and iPhone. |
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

1. **Supabase**: create a project, run `supabase/schema.sql`, set `SUPABASE_URL`
   and `SUPABASE_SERVICE_ROLE_KEY`, then add scouted hostels to the `hostels`
   table. Set `verified_at` once a scout has physically visited, `lat` and `lng`
   to put the room on the map, and `photos` to a list of image URLs.
2. **Paystack**: set `PAYSTACK_SECRET_KEY` and add a webhook pointing at
   `https://your-domain/api/paystack/webhook`.
3. **WhatsApp**: set `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g. `2348012345678`).
4. **Sign-in**: set `SESSION_SECRET` (`openssl rand -hex 32`) and a Termii key
   (`TERMII_API_KEY`) so codes are sent by text. Without Termii, codes are shown
   on screen in development and in the sample-data demo only. Once Supabase is
   connected in production, sign-in stays off until both are set.

## The app

The site is a full installable web app, so there is one codebase for the
website, the phone app and (optionally) the Play Store listing.

- **Install**: students see a "Get the app" card on the home page. On Android
  it installs in one tap; on iPhone it explains Share, then Add to Home Screen.
  `/app` has the same steps on one page for sharing in WhatsApp groups.
- **Works on weak networks**: a service worker (`public/sw.js`) keeps fonts,
  styles and scripts on the phone, and keeps a copy of public pages a student
  has opened. Those still open with no signal; anything else shows `/offline`.
  Pages with personal details (saved rooms, bookings, sign-in, the lock form)
  are never stored on the phone.
- **Feels like an app**: bottom tab bar, full screen with no browser bar, icon
  shortcuts (Map, Saved, Rent index), a loading bar on tapped links, and a
  Share button on each room that opens the phone's share sheet.
- The service worker only runs in production builds (`pnpm build`, then
  `pnpm exec next start`), never in `next dev`. Bump `VERSION` at the top of
  `public/sw.js` to make every phone drop its stored copies.

### Putting it on the Play Store

The same app can be listed on Google Play as an Android app, with no rewrite:

1. Deploy the site to its real domain over HTTPS.
2. Go to [PWABuilder](https://www.pwabuilder.com), enter the domain and
   generate the Android package. It gives you an app bundle to upload, a
   package name and a SHA-256 fingerprint.
3. Set `ANDROID_PACKAGE_NAME` and `ANDROID_SHA256_FINGERPRINTS` on the
   deployment. The site then serves `/.well-known/assetlinks.json`, which is
   what lets the Android app open full screen without a browser bar.
4. Upload the bundle in the Google Play Console. This needs a Google Play
   developer account, which has a one-time fee, and new personal accounts must
   run a closed test before going public.

The iPhone App Store does not accept this kind of package. iPhone users install
from Safari, or you build a separate native app later.

The map uses OpenStreetMap's public tile server, which is fine for a pilot. If
traffic grows, switch the tile URL in `components/hostel-map.tsx` to a paid
provider.

## Done by hand in Week 1

- Adding listings, videos, photos and map coordinates: straight into the
  Supabase table.
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
