# PRD: RenToday — Apartment/Room Rental Listing Platform

**Deadline:** July 16, 2026, 10:00 AM
**Stack:** Next.js (App Router) + TypeScript + Next.js API Routes + MongoDB + JWT + Tailwind CSS + Recharts

---

## 1. Concept

A rental listing platform for apartments/rooms in Dhaka. Users browse listings without logging in. Logged-in users ("landlords" in this context — but any authenticated user can list) can add and manage their own property listings. Public visitors can search, filter, sort, and view full property details.

**Domain content (use real, plausible Dhaka data — no lorem ipsum):**
- Areas: Dhanmondi, Gulshan, Banani, Uttara, Mirpur, Bashundhara, Mohammadpur, Badda, Lalmatia, Baridhara
- Property types: Apartment, Studio, Sublet/Room, Bachelor Mess
- Rent range: 8,000 – 80,000 BDT/month
- Bedrooms: 1–5
- Amenities: Gas, Lift, Generator, Parking, Security, Balcony, Furnished/Unfurnished, Water reserve tank

---

## 2. Data Models (MongoDB via Mongoose or native driver)

### User
```ts
{
  _id: ObjectId,
  name: string,
  email: string,       // unique
  password: string,    // hashed with bcrypt
  role: "user" | "admin",
  createdAt: Date
}
```

### Listing
```ts
{
  _id: ObjectId,
  title: string,
  shortDescription: string,
  fullDescription: string,
  rentPerMonth: number,
  location: string,          // one of the Dhaka areas above
  bedrooms: number,
  propertyType: string,      // Apartment | Studio | Room | Mess
  amenities: string[],
  images: string[],          // image URLs
  ownerId: ObjectId,         // ref to User
  ownerEmail: string,
  rating: number,            // 0–5, can be static/seeded
  createdAt: Date
}
```

### Review (optional but required by spec section 5)
```ts
{
  _id: ObjectId,
  listingId: ObjectId,
  userName: string,
  rating: number,
  comment: string,
  createdAt: Date
}
```

---

## 3. Pages & Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/listings` | Public | Explore/search/filter all listings |
| `/listings/[id]` | Public | Listing details page |
| `/login` | Public | Login |
| `/register` | Public | Registration |
| `/items/add` | Protected | Add new listing (redirect to `/login` if not authed) |
| `/items/manage` | Protected | View/manage own listings (view, delete) |
| `/about` | Public | About page |
| `/contact` | Public | Contact page |

Navbar (logged out, min 3 routes): Home, Explore Listings, Login/Register
Navbar (logged in, min 5 routes): Home, Explore Listings, Add Listing, Manage Listings, About, Logout

---

## 4. Landing Page Sections (minimum 7)

1. **Hero** — headline ("Find your next home in Dhaka"), search bar CTA, background image slider (2–3 rotating Dhaka apartment/skyline images, auto-advance with fade/slide transition), height ~65vh
2. **Featured Listings** — card grid, 4/row desktop, pulls top-rated or newest listings
3. **How It Works** — 3-step process (Search → Contact → Move in)
4. **Popular Areas** — clickable chips/cards for Dhanmondi, Gulshan, Banani, Uttara, etc. (links to filtered `/listings?location=X`)
5. **Stats/Highlights** — e.g. "500+ Listings", "10 Areas Covered", "1,200+ Happy Tenants" (Recharts bar or simple stat cards)
6. **Testimonials** — 3–4 tenant/landlord quotes
7. **FAQ** — accordion, 5–6 common rental questions
8. **Newsletter/CTA** — email signup or "List Your Property" CTA banner
9. **Footer** — working links only (spec requires this, no `href="#"` placeholders): internal nav links + real contact info + social icons linking to actual platform homepages (e.g. facebook.com, instagram.com — doesn't need to be a real RenToday account, just a working URL)

---

## 5. Explore/Listings Page (`/listings`)

- Search bar (searches title/location by text)
- Filters (minimum 2): **Location** (dropdown) + **Rent range** (min/max or slider) — optionally add Bedrooms as a 3rd
- Sort: Price (low-high, high-low), Newest first
- Pagination (simple page-number based, 8–12 per page) — simpler than infinite scroll, acceptable per spec ("Pagination OR infinite scroll")
- Skeleton loader while fetching
- Cards: same size/radius, image, title, rent, location, bed count, rating (★ badge), "View Details" button

---

## 6. Details Page (`/listings/[id]`)

- Image gallery (multiple images, simple carousel or grid)
- Title, rent, location, bedroom count
- Description / Overview section
- Key Info / Specifications (property type, amenities list)
- Reviews section (list of reviews + average rating; static/seeded is fine)
- Related Listings (3–4 cards, same location or similar rent range)

---

## 7. Authentication

- Register: name, email, password → hash with bcrypt → store in MongoDB
- Login: email + password → verify → issue JWT → set as an `httpOnly` cookie (not localStorage — simpler and more secure, avoids manual token handling in the frontend)
- Logout: `POST /api/auth/logout` clears the JWT cookie
- **Demo login button**: pre-fills a seeded demo user's credentials into the login form
- Validation: required fields, email format, password min length, show inline errors
- Helper (e.g. `lib/auth.ts`) reads the cookie server-side to identify the current user
- Protected pages (`/items/add`, `/items/manage`) check auth **server-side** (in the page itself), not just client-side — redirect to `/login` if missing/invalid so it can't be bypassed by disabling JS
- Protected API routes check the same helper and return `401` if missing/invalid
- Delete route additionally checks `listing.ownerId === userId || user.role === "admin"` before allowing deletion
- Skip social login (marked optional in spec — don't burn time on it)

---

## 8. Add Listing (`/items/add`) — Protected

Form fields: Title, Short description, Full description, Rent/month, Location (dropdown), Bedrooms, Property type, Amenities (checkboxes), Image URL(s)
Submit → POST to API → save with `ownerId` = current user → redirect to `/items/manage`

## 9. Manage Listings (`/items/manage`) — Protected

- Table/grid of listings where `ownerId === current user` (**admin role sees every listing from every user** — this is the one place the admin role does something, giving the demo admin login a visible purpose)
- Actions per row: **View** (link to details page), **Delete** (DELETE API call, confirm dialog) — admins may delete any listing, regular users only their own
- Empty state if user has no listings yet

---

## 10. Additional Pages (minimum 2)

- `/about` — short platform description
- `/contact` — contact form (can be non-functional submit, just styled) + contact info

---

## 11. API Routes (Next.js App Router — `app/api/.../route.ts`)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout           (clears the JWT cookie)
GET    /api/listings              (supports ?query=&location=&minRent=&maxRent=&sort=&page=)
POST   /api/listings              (protected — create)
GET    /api/listings/[id]
DELETE /api/listings/[id]         (protected — owner or admin only)
GET    /api/listings/[id]/reviews
GET    /api/users/me              (protected — return current user from JWT)
```

---

## 12. Design Rules

- 3 primary colors max (suggest: deep blue `#1E40AF`, warm orange accent `#F97316`, neutral gray `#F3F4F6`) + white/black text
- Tailwind CSS utility classes throughout, consistent `rounded-xl`, consistent card padding
- Fully responsive: mobile (1 card/row), tablet (2/row), desktop (4/row)
- No lorem ipsum anywhere — use the Dhaka domain content above

---

## 13. Final Submission Checklist

- [ ] Live URL (deploy on Vercel)
- [ ] GitHub repo link (single Next.js repo covers both frontend and backend, since API routes serve as the backend)
- [ ] Demo user credentials: `demo@rentoday.com` / `demo1234` (role: `user`) — works with "Demo Login" button
- [ ] Demo admin credentials: `admin@rentoday.com` / `admin1234` (role: `admin`)
- [ ] Seed script or seeded DB with real-looking listings (min 15–20 so pagination/filtering actually demonstrates something)

---

## 14. CODING APPROACH — Instructions for Claude Code

**Read this before writing any code.**

The developer (me) is a beginner in TypeScript. Please follow these rules strictly:

1. **Keep types simple and explicit.** Use basic `interface` or `type` declarations for each data model (User, Listing, Review) in a single `types.ts` file. Avoid generics, advanced utility types (`Partial<Omit<...>>` chains), or clever type gymnastics unless there's no simpler way. Prefer clarity over cleverness.

2. **Comment every non-obvious block.** Especially: JWT verification logic, MongoDB connection setup, and any middleware/auth-guard code. A one-line comment explaining *why*, not just *what*.

3. **One file, one responsibility.** Don't merge unrelated logic into a single giant file. Keep API route handlers short — extract DB logic into a `lib/db.ts` or similar helper if it gets long, but don't over-engineer folder structure either. Simple and flat beats "enterprise architecture" here.

4. **Avoid advanced React patterns.** No custom hooks unless clearly necessary (e.g. one `useAuth()` hook is fine). No context providers beyond auth state. Prefer `useState`/`useEffect` directly in components over abstractions the developer hasn't learned yet.

5. **Explain any TypeScript error fixes in plain language** as a code comment when you fix a type error — e.g. `// fixed: rentPerMonth was string from form input, converted to number`.

6. **Use plain fetch or a single shared `apiClient.ts` helper** — not a heavy data-fetching library (no React Query/SWR) unless truly needed, to keep the mental model simple.

7. **Seed data first.** Before building UI, write a `scripts/seed.ts` that populates MongoDB with realistic Dhaka listings, a demo user, and an admin user. This unblocks "no placeholder content" and testing immediately.

8. **Build order** (so partial completion is still demoable if time runs out):
   1. MongoDB connection + models/types
   2. Seed script
   3. Auth (register/login/JWT) + demo login button
   4. Listings API (GET list with filters, GET single, POST, DELETE)
   5. Explore page + cards + skeleton loader
   6. Details page
   7. Add/Manage pages (protected)
   8. Landing page sections (fastest to fake convincingly once data exists)
   9. About/Contact pages
   10. Polish: responsive check, color consistency pass

9. **Do not silently skip spec requirements.** If something in this PRD can't be finished in time, leave a clear `// TODO: not implemented — [reason]` comment rather than a broken or fake implementation.
