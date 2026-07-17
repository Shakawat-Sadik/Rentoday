# Cloudinary Setup — RenToday

**Project: RenToday (Dhaka Rental Listings)**
Stack: Next.js API Routes (App Router) · MongoDB · TypeScript

Used only for one thing: letting a logged-in user upload real photos on `/items/add` instead of pasting an image URL.

**Approach: unsigned upload preset, client-direct.** The browser uploads the file straight to Cloudinary's REST endpoint — no `/api/upload` route, no API secret anywhere near this app. This is the simplest option Cloudinary offers and matches the PRD's "no unnecessary abstraction" rule: there's nothing to build server-side for uploads at all.

Tradeoff worth knowing: because the preset is unsigned, anyone who discovers the preset name could technically POST an image to your Cloudinary account directly, not just users logged into RenToday. For a graded class project that's an acceptable tradeoff for the simplicity gained — Cloudinary's free tier has usage caps that would limit real damage. If that ever becomes a concern, the fix is switching to a signed server-side route (more code, real auth check) — not in scope now.

---

## Architecture

```
Add Listing form (client component)
  → user picks file(s)
  → client POSTs FormData directly to
    https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
    (fields: file, upload_preset)
  → Cloudinary returns { secure_url, public_id, ... }
  → client pushes secure_url into the images[] state array
  → on form submit, images[] is sent along with the rest of the listing to POST /api/listings
```

No server involvement, no `lib/cloudinary.ts`, no Cloudinary npm package needed for this flow — it's a plain `fetch`. (The `cloudinary` package is already installed but goes unused unless a signed server-side operation gets added later — safe to leave it, no harm keeping it in `package.json`.)

---

## Step 1 — Cloudinary Dashboard: create the unsigned preset

1. Log in to https://cloudinary.com/console.
2. Go to **Settings → Upload → Upload presets → Add upload preset**.
3. Set **Signing Mode: Unsigned**.
4. Name it `rentoday_room` (already referenced in `.env.local`) — or whatever you set `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to.
5. Optionally set a folder (e.g. `rentoday/listings`) so uploads land in a predictable place in the Cloudinary media library.
6. Save.

---

## Step 2 — Environment variables (`.env.local`)

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=sadik-store
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=rentoday_room
```

Both need the `NEXT_PUBLIC_` prefix — the browser builds the upload URL and preset field itself, so these values ship in the client bundle. That's expected and safe for an *unsigned* preset (that's the whole point of unsigned presets: no secret required to use them). Never put `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` behind a `NEXT_PUBLIC_` prefix if they're ever added later — those must stay server-only.

---

## Step 3 — `next.config.ts`

Add the Cloudinary image domain so `next/image` can render the returned URLs:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "**" },
    ],
  },
};

export default nextConfig;
```

---

## Step 4 — Usage in the Add Listing form

```tsx
"use client";
import { useState } from "react";

export default function AddListingForm() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset!);

    // Goes straight to Cloudinary, not to our own API — no auth header needed
    // here because RenToday's own auth already gated the /items/add page itself.
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (res.ok) setImages((prev) => [...prev, data.secure_url]);
    setUploading(false);
  };

  // images[] gets included in the payload sent to POST /api/listings on submit
}
```

---

## Vercel Deployment

Add both vars to the RenToday Vercel project — they're `NEXT_PUBLIC_`, so they get baked into the client build automatically:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `sadik-store` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `rentoday_room` |

---

## File Map

| File | Purpose |
|---|---|
| `.env.local` | Holds the two public Cloudinary vars (gitignored, but safe to be public anyway) |
| `next.config.ts` | Allows `res.cloudinary.com` in `next/image` |
| Add Listing form component | Calls Cloudinary directly via `fetch` — no new backend file needed |
