# RenToday — Dhaka Apartment & Room Rental Platform

RenToday is a full-stack rental listing web application built for the Dhaka, Bangladesh market. It lets the public browse, search, and filter apartments and rooms for rent across Dhaka's major neighbourhoods — and lets registered users list their own properties, manage bookings, and track visit requests.

---

## Purpose

Finding a rental in Dhaka traditionally involves brokers, fake photos, and opaque fees. RenToday cuts out the middlemen by connecting tenants directly with property owners through honest listings, real contact numbers, and a simple visit-booking workflow — all in one place, all for free.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| Language | TypeScript 5 |
| Database | MongoDB via [Mongoose 9](https://mongoosejs.com) |
| Auth | JWT (`jsonwebtoken`) stored as an `httpOnly` cookie |
| Password hashing | bcryptjs |
| Image uploads | [Cloudinary](https://cloudinary.com) — unsigned browser-to-cloud upload |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion / Motion (via beui component library) |
| UI components | shadcn/ui (aceternity) · beui · unlumen-ui |
| Fonts | Outfit (body) · Montserrat (headings) via `next/font/google` |
| Package manager | pnpm |
| Deployment target | Vercel |

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Demo user | `demo@rentoday.com` | `demo1234` |
| Admin | `admin@rentoday.com` | `admin1234` |

The **Demo Login** button on the login page pre-fills the demo user credentials automatically.

The admin account sees **all** listings and booking requests across every user (not just their own) in the Manage Listings dashboard.

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB — get a free cluster at mongodb.com/atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rentoday

# JWT — any long random string
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary — from your Cloudinary dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=rentoday_room
```

### 3. Seed the database

Populates MongoDB with 20 realistic Dhaka listings, one demo user, one admin user, and several seeded booking requests so the dashboard is never empty on first load.

```bash
pnpm seed
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

### Public (no login required)

#### Browse & Search Listings
On `/listings`, anyone can browse all available rentals with:
- **Text search** — searches listing title and location simultaneously.
- **Location filter** — narrow results to a specific Dhaka neighbourhood (Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Mohammadpur, Bashundhara, Wari, Baridhara, Badda).
- **Rent range slider** — drag a dual-handle slider to set minimum and maximum monthly rent.
- **Sort** — Newest First, Price Low–High, or Price High–Low.
- **Pagination** — 12 listings per page with numbered page navigation.
- **Skeleton loaders** — shimmer placeholder cards appear instantly while the API fetches results.

All filters and the current page are reflected in the URL (`?query=&location=&minRent=&maxRent=&sort=&page=`), so filtered results are bookmarkable and work with the browser back button.

#### Listing Detail Page
On `/listings/[id]`, the full property detail page shows:
- **Image carousel** — scrollable gallery of all uploaded photos with previous/next arrows.
- **Overview tab** — full description and quick-spec summary (rent, location, bedrooms, property type).
- **Specs & Amenities tab** — full amenity list (Gas, Lift, Generator, Parking, Security, Balcony, Furnished, Water Reserve Tank, etc.).
- **Reviews tab** — all tenant reviews with star ratings, a per-star breakdown progress bar, and average rating.
- **Call Owner button** — a `tel:` link that opens the device dialler with the owner's phone number. Visible to everyone, no login required.
- **Propose a Booking Date button** — opens a date-picker dialog (protected: redirects to `/login` if not logged in). See *Booking Requests* below.
- **Related Listings** — 3–4 cards of other properties in the same neighbourhood.

#### Landing Page
The home page (`/`) has nine sections:
1. **Hero** — animated background image carousel with a search bar that jumps to `/listings?query=...`.
2. **Featured Listings** — live card grid of the 8 most recent listings from the database.
3. **How It Works** — 3-step guide: Search → Contact → Move In.
4. **Popular Areas** — clickable area chips linking directly to filtered listing searches.
5. **Stats** — platform highlights (500+ listings, 30+ neighbourhoods, 1,200+ tenants, 4.8★ rating).
6. **Testimonials** — 3 quotes from tenants and a property owner.
7. **FAQ** — collapsible accordion covering the 6 most common renter questions.
8. **CTA Banner** — "List Your Property" call-to-action with links to register and explore.
9. **Footer** — quick-links, popular areas, contact info, and social media links.

#### About Page
`/about` explains the platform's mission, tells the founding story through a visual timeline, and lists the four core values (Trust & Transparency, Speed & Simplicity, Tenant-First Design, Community-Driven).

#### Contact Page
`/contact` provides a contact form (name, email, subject, message) with a stateful submit button that shows loading → success states. Also shows email, phone, and address cards with office hours.

---

### Authenticated Features (login required)

#### Add a Listing
`/items/add` — a multi-field form that lets any logged-in user publish a rental:
- Title, short description, full description.
- Rent per month, location (dropdown), bedrooms, property type (Apartment / Studio / Sublet-Room / Bachelor Mess).
- Amenity checkboxes.
- **Photo upload** — images are uploaded directly from the browser to Cloudinary via an unsigned upload preset (no server round-trip). Each file shows an individual upload progress/success/error status. Failed files can be retried individually.
- On submit: creates the listing via `POST /api/listings`, then redirects to Manage Listings.

The page performs a **server-side auth guard** — the server component checks the JWT cookie before rendering; if the cookie is absent or invalid the user is redirected to `/login` without any client-side JavaScript running.

#### Manage Listings
`/items/manage` — the owner dashboard has two sections:

**My Listings table:**
- Lists all listings owned by the current user (admins see every listing from every user).
- Columns: Title, Location, Rent, Beds, Actions.
- **View** — links to the public listing detail page.
- **Delete** — opens a confirmation dialog before calling `DELETE /api/listings/[id]`. The row is removed from the table immediately on success without a page reload. Admins can delete any listing; regular users can only delete their own.
- Empty state with a link to Add Listing when the user has no listings yet.

**Booking Requests table:**
- Lists every booking request sent to the current user's listings (admins see all requests across the platform).
- Columns: Listing, Requester name, Proposed Date, Message, Status badge, Actions.
- **Accept / Decline buttons** — each button shows its own loading spinner independently (clicking Accept on row 3 doesn't affect rows 1 and 2). Only enabled when `status === "pending"`. Calls `PATCH /api/booking-requests/[id]` and updates the status badge in-place.
- Status badges: Pending (outline) · Accepted (primary) · Declined (destructive).

#### My Booking Requests
`/requests` — a read-only table of every booking request the current user has *sent* (as a prospective tenant):
- Columns: Listing (links to the detail page), Proposed Date, Message, Status badge, Submitted date.
- The tenant can see whether the owner has accepted, declined, or not yet responded.
- No action buttons — the requester cannot change the status of their own request.

#### Profile
`/profile` — view and edit your own account details:
- **Read-only:** email address (identity, cannot be changed here).
- **Editable:** full name, phone number, gender (radio group: Male / Female / Prefer not to say), date of birth (three side-by-side scroll-wheels for day / month / year).
- Saves via `PATCH /api/users/me`. The save button shows loading → success → error states.

---

### Auth Pages

#### Login (`/login`)
- Email + password form with inline validation errors.
- **Demo Login button** — one click pre-fills the demo user credentials so you can try the platform without registering.
- On success: JWT is written as an `httpOnly` cookie and the user is redirected to the home page.

#### Register (`/register`)
- Fields: full name, email, phone number (Bangladesh format validated), gender (radio), date of birth (three wheel-pickers), password.
- All fields are validated on both client and server.
- On success: account is created, JWT cookie is set, user is redirected home.

---

## Page Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing page with 9 sections |
| `/listings` | Public | Search, filter, sort, and paginate all listings |
| `/listings/[id]` | Public | Full property detail — gallery, specs, reviews, booking, related |
| `/login` | Public | Email + password login with Demo Login shortcut |
| `/register` | Public | New account registration |
| `/items/add` | Protected | Publish a new rental listing with Cloudinary photo upload |
| `/items/manage` | Protected | Manage own listings (delete) + respond to booking requests (accept/decline) |
| `/profile` | Protected | View and edit account info |
| `/requests` | Protected | Read-only view of booking requests the user has sent |
| `/about` | Public | Platform story, mission, values |
| `/contact` | Public | Contact form + contact info |

---

## API Routes

All API routes live under `/app/api/`. Protected routes read the JWT from the `token` `httpOnly` cookie. Requests without a valid token receive `401 Unauthorized`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create a new user account. Validates phone format, gender enum, DOB in the past. Hashes password with bcrypt. Returns JWT cookie. |
| `POST` | `/api/auth/login` | — | Verify email + password. Returns JWT cookie on success. |
| `POST` | `/api/auth/logout` | — | Clears the JWT cookie by setting `maxAge: 0`. |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Required | Returns the current user's profile (from the JWT). Used by the navbar to determine login state. |
| `PATCH` | `/api/users/me` | Required | Updates name, phone, gender, and/or date of birth for the current user. |

### Listings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/listings` | — | Returns paginated listings. Query params: `query` (text search on title/location), `location`, `minRent`, `maxRent`, `sort` (`newest` \| `price-asc` \| `price-desc`), `page`. Response: `{ listings, total, page, totalPages }`. |
| `POST` | `/api/listings` | Required | Creates a new listing. Denormalizes `ownerPhone` from the current user at write time so the Call Owner button always has the correct number. |
| `GET` | `/api/listings/[id]` | — | Returns a single listing by ID. Returns `404` if not found. |
| `DELETE` | `/api/listings/[id]` | Required | Deletes a listing. Allowed only if `listing.ownerId === auth.userId` or `auth.role === "admin"`. Returns `403` otherwise. |
| `GET` | `/api/listings/mine` | Required | Returns listings owned by the current user. Admins receive all listings. |
| `GET` | `/api/listings/[id]/reviews` | — | Returns all reviews for a listing, sorted newest-first. |
| `POST` | `/api/listings/[id]/booking-requests` | Required | Creates a booking request (visit proposal) for the listing. Validates that the proposed date is in the future. |

### Booking Requests

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/booking-requests/me` | Required | Returns all booking requests sent *by* the current user (tenant view). |
| `GET` | `/api/booking-requests/owner` | Required | Returns all booking requests for the current user's listings (owner view). Admins receive all requests across the platform. |
| `PATCH` | `/api/booking-requests/[id]` | Required | Sets `status` to `"accepted"` or `"declined"`. Only the listing owner or an admin may change the status. |

---

## Data Models

### User
```ts
{
  name: string
  email: string          // unique, lowercase
  password: string       // bcrypt hash
  phone: string          // shown as "Call Owner" on listings they create
  gender: "male" | "female" | "prefer not to say"
  dateOfBirth: Date
  role: "user" | "admin"
  createdAt: Date
}
```

### Listing
```ts
{
  title: string
  shortDescription: string
  fullDescription: string
  rentPerMonth: number
  location: string        // Dhaka neighbourhood
  bedrooms: number
  propertyType: "Apartment" | "Studio" | "Sublet/Room" | "Bachelor Mess"
  amenities: string[]     // e.g. ["Gas", "Lift", "Furnished"]
  images: string[]        // Cloudinary secure_url values
  ownerId: string         // reference to User._id (stored as String for easy serialisation)
  ownerEmail: string      // denormalised at creation time
  ownerPhone: string      // denormalised at creation time — powers the Call Owner button
  rating: number          // 0–5, seeded/static
  createdAt: Date
}
```

### Review
```ts
{
  listingId: string
  userName: string
  rating: number          // 1–5
  comment: string
  createdAt: Date
}
```

### BookingRequest
```ts
{
  listingId: string
  listingTitle: string    // denormalised — avoids a join on the My Requests page
  requesterId: string     // who sent the request
  requesterName: string
  ownerId: string         // denormalised — avoids a join on the owner dashboard
  proposedDate: Date
  message: string         // optional note from requester
  status: "pending" | "accepted" | "declined"
  createdAt: Date
}
```

---

## Project Structure

```
src/
├── app/
│   ├── api/                         # Next.js API route handlers
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── register/route.ts
│   │   ├── listings/
│   │   │   ├── route.ts             # GET (list+filter) / POST (create)
│   │   │   ├── mine/route.ts        # GET own listings (admin: all)
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET / DELETE
│   │   │       ├── reviews/route.ts
│   │   │       └── booking-requests/route.ts
│   │   ├── booking-requests/
│   │   │   ├── me/route.ts          # GET requests sent by current user
│   │   │   ├── owner/route.ts       # GET requests for current user's listings
│   │   │   └── [id]/route.ts        # PATCH (accept/decline)
│   │   └── users/
│   │       └── me/route.ts          # GET / PATCH
│   │
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── items/
│   │   ├── add/page.tsx             # server auth guard → add-listing-form.tsx
│   │   └── manage/page.tsx          # server auth guard → manage-content.tsx
│   ├── listings/
│   │   ├── page.tsx                 # explore/search page
│   │   └── [id]/page.tsx            # listing detail page
│   ├── login/page.tsx
│   ├── profile/page.tsx             # server auth guard → profile-form.tsx
│   ├── register/page.tsx
│   ├── requests/page.tsx            # server auth guard → requests-content.tsx
│   ├── layout.tsx                   # global layout: Navbar + Footer + ThemeProvider
│   ├── not-found.tsx                # custom 404 page
│   ├── page.tsx                     # landing page
│   └── providers.tsx                # ThemeProvider wrapper
│
├── components/
│   ├── motion/          # beui animated components
│   ├── ui/              # shadcn/ui + aceternity components
│   ├── unlumen-ui/      # unlumen-ui (MotionNavigationMenu)
│   ├── navbar.tsx       # global sticky navbar
│   └── footer.tsx       # global footer
│
├── lib/
│   ├── auth.ts          # JWT helpers: getUserFromCookies / getUserFromRequest
│   ├── db.ts            # MongoDB connection (singleton pattern)
│   └── interfaces-types.ts  # TypeScript interfaces + Mongoose schemas/models
│
scripts/
└── seed.ts              # Populates DB with demo listings, users, and requests
```

---

## Auth Architecture

- **Storage:** JWT is issued on login/register and set as an `httpOnly` cookie named `token`. It is never accessible from JavaScript, which prevents XSS token theft.
- **Server-side guards:** Protected *pages* (`/items/add`, `/items/manage`, `/profile`, `/requests`) use `getUserFromCookies()` in a Server Component to read and verify the JWT **before** any HTML is sent to the browser. If the cookie is missing or invalid the user is redirected to `/login` via `next/navigation`'s `redirect()`. This cannot be bypassed by disabling JavaScript.
- **API route guards:** Protected API routes call `getUserFromRequest(request)` which reads the cookie from the incoming request headers and verifies the JWT. Returns `401` if absent or invalid.
- **Admin checks:** The `DELETE /api/listings/[id]` and `PATCH /api/booking-requests/[id]` routes additionally verify `auth.role === "admin"` or ownership before proceeding.

---

## Cloudinary Image Upload

Images are uploaded **directly from the browser** to Cloudinary using an unsigned upload preset — no backend route is involved in the upload itself.

1. User selects files in the Add Listing form.
2. Each file is immediately uploaded to `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload` with the preset `rentoday_room`.
3. On success, Cloudinary returns a `secure_url`. These URLs are collected into an array.
4. On form submit, the array of `secure_url` values is sent in `images[]` to `POST /api/listings`.

To configure: create an unsigned upload preset named `rentoday_room` in your Cloudinary dashboard (Settings → Upload → Upload Presets).

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the following environment variables in the Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
4. Deploy. Vercel detects Next.js automatically.
5. Run the seed script once against the production database by setting the env vars locally and running `pnpm seed`.
