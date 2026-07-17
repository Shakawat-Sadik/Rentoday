# Project Rules

## UI Component Libraries Installed

- aceternity & shadcn/ui → import from `@/components/ui/...`
- beui → import from `@/components/motion/...`
- unlumen-ui → import from `@/components/unlumen-ui/...`

## Available Components

### shadcn/ui (components/ui/)

- accordion
- alert-dialog
- alert
- aspect-ratio
- attachment
- avatar
- badge
- breadcrumb
- bubble
- button-group
- button
- calendar
- card
- carousel
- chart
- checkbox
- collapsible
- combobox
- command
- context-menu
- dialog
- direction
- drawer
- dropdown-menu
- empty
- field
- hover-card
- input-group
- input-otp
- input
- item
- kbd
- label
- marker
- menubar
- message-scroller
- message
- native-select
- navigation-menu
- pagination
- popover
- progress
- radio-group
- resizable
- scroll-area
- select
- separator
- sheet
- sidebar
- skeleton
- slider
- sonner
- spinner
- switch
- table
- tabs
- textarea
- toggle-group
- toggle
- tooltip

### beui (components/motion/)

- action-swap
- animated-toast-stack
- button/base
- button/stateful
- checkbox
- file-upload
- infinite-masonry
- loader
- magnetic
- not-found/magnetic
- not-found/shared
- popover
- radio
- select
- shader-background
- smooth-scroll
- table/editable-cell
- table/index
- table/row-handle
- table/skeleton-rows
- table/table-header
- table/table-menu
- tabs
- theme-toggle
- wheel-picker

### unlumen-ui (components/unlumen-ui/)

- motion-navigation-menu

## Use-Case to Component Mapping

| Use Case                                                   | Library    | Component              | Import Path                                       |
| ---------------------------------------------------------- | ---------- | ---------------------- | ------------------------------------------------- |
| **— Landing Page —** ------------------------------------  | ---------- | ---------------------- | ------------------------------------------------  |
| Hero search bar                                            | aceternity | input                  | `@/components/ui/gooey-input`                     |
| Hero image slider / auto-advance carousel                  | shadcn/ui  | carousel               | `@/components/ui/carousel`                        |
| Hero decorative animated background                        | beui       | shader-background      | `@/components/motion/shader-background`           |
| Featured listing card                                      | shadcn/ui  | card                   | `@/components/ui/card`                            |
| CTA button / "View Details" button / submit button         | shadcn/ui  | button                 | `@/components/motion/button/base`                 |
| Rating display (★ badge)                                  | shadcn/ui  | badge                  | `@/components/ui/badge`                           |
| Area filter chip (Popular Areas)                           | shadcn/ui  | badge                  | `@/components/ui/badge`                           |
| Stat card ("500+ Listings", etc.)                          | shadcn/ui  | card                   | `@/components/ui/card`                            |
| Stats bar chart (Recharts)                                 | shadcn/ui  | chart                  | `@/components/ui/chart`                           |
| Testimonial card                                           | shadcn/ui  | card                   | `@/components/ui/card`                            |
| Testimonial avatar / user photo                            | shadcn/ui  | avatar                 | `@/components/ui/avatar`                          |
| FAQ accordion                                              | shadcn/ui  | accordion              | `@/components/ui/accordion`                       |
| Newsletter email input                                     | shadcn/ui  | input                  | `@/components/ui/input`                           |
| How It Works step indicator                                | aceternity | timeline-demo          | `@/components/timeline-demo`                      |
| Footer                                                     |            |                        |                                                   |
| Social icon links                                          |            |                        |                                                   |
| **— Listings / Explore Page —** -------------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Search bar (title / location text search)                  | unlumen/ui | favicon-search         | `@/components/unlumen-ui/favicon-search`          |
| Location filter dropdown                                   | beui       | select                 | `@/components/motion/select`                      |
| Rent range slider (min / max)                              | shadcn/ui  | slider                 | `@/components/ui/slider`                          |
| Sort dropdown (price / newest)                             | beui       | select                 | `@/components/motion/select`                      |
| Listing card (image, title, rent, location, beds, rating)  | shadcn/ui  | card                   | `@/components/ui/card`                            |
| Skeleton loader (while fetching)                           | shadcn/ui  | skeleton               | `@/components/ui/skeleton`                        |
| Pagination (page-number based)                             | shadcn/ui  | pagination             | `@/components/ui/pagination`                      |
| **— Listing Details Page —** ----------------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Image gallery carousel                                     | shadcn/ui  | carousel               | `@/components/ui/carousel`                        |
| Amenity chip / tag                                         | shadcn/ui  | badge                  | `@/components/ui/badge`                           |
| Section tabs (Overview / Specs / Reviews)                  | beui       | tabs                   | `@/components/motion/tabs`                        |
| Review rating progress bar                                 | shadcn/ui  | progress               | `@/components/ui/progress`                        |
| Related listing card                                       | shadcn/ui  | card                   | `@/components/ui/card`                            |
| Call Owner button (tel: link)                              | beui       | button/base            | `@/components/motion/button/base`                 |
| Propose a Booking Date trigger button                      | beui       | button/base            | `@/components/motion/button/base`                 |
| Propose a Booking Date dialog                              | shadcn/ui  | dialog                 | `@/components/ui/dialog`                          |
| Booking date picker (in dialog)                            | beui       | wheel-picker           | `@/components/motion/wheel-picker`                |
| Submit booking request button (in dialog)                  | beui       | button/stateful        | `@/components/motion/button/stateful`             |
| **— Auth Pages (Login / Register) —** -------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Form text input (name / email / phone / password)          | shadcn/ui  | input                  | `@/components/ui/input`                           |
| Form label                                                 | shadcn/ui  | label                  | `@/components/ui/label`                           |
| Inline validation error message                            | shadcn/ui  | alert                  | `@/components/ui/alert`                           |
| Gender selection (Register)                                | beui       | radio                  | `@/components/motion/radio`                       |
| Date of birth picker (Register)                            | beui       | wheel-picker           | `@/components/motion/wheel-picker`                |
| Demo login button                                          | shadcn/ui  | button                 | `@/components/motion/button/stateful`             |
| Register submit button                                     | beui       | button/stateful        | `@/components/motion/button/stateful`             |
| **— Add Listing Page —** --------------------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Full description textarea                                  | shadcn/ui  | textarea               | `@/components/ui/textarea`                        |
| Location dropdown                                          | beui       | select                 | `@/components/motion/select`                      |
| Property type dropdown                                     | beui       | select                 | `@/components/motion/select`                      |
| Amenities checkbox list                                    | beui       | checkbox               | `@/components/motion/checkbox`                    |
| Image file upload (Cloudinary)                             | beui       | file-upload            | `@/components/motion/file-upload`                 |
| **— Manage Listings Page —** ----------------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Listings table (with View / Delete actions)                | beui       | table/index            | `@/components/motion/table/index`                 |
| Confirm delete dialog                                      | shadcn/ui  | alert-dialog           | `@/components/ui/alert-dialog`                    |
| Empty state (no listings yet)                              | shadcn/ui  | empty                  | `@/components/ui/empty`                           |
| Booking requests list (per owned listing)                  | beui       | table/index            | `@/components/motion/table/index`                 |
| Booking request status badge (pending/accepted/declined)   | shadcn/ui  | badge                  | `@/components/ui/badge`                           |
| Accept / Decline booking request buttons                   | beui       | button/stateful        | `@/components/motion/button/stateful`             |
| **— Profile Page —** ------------------------------------- | ---------- | ---------------------- | ------------------------------------------------- |
| Profile field input (name / phone)                         | shadcn/ui  | input                  | `@/components/ui/input`                           |
| Gender selection (Profile edit)                            | beui       | radio                  | `@/components/motion/radio`                       |
| Date of birth picker (Profile edit)                        | beui       | wheel-picker           | `@/components/motion/wheel-picker`                |
| Save profile button                                        | beui       | button/stateful        | `@/components/motion/button/stateful`             |
| **— My Booking Requests Page —** ------------------------- | ---------- | ---------------------- | ------------------------------------------------- |
| Requests list (sent by current user)                       | beui       | table/index            | `@/components/motion/table/index`                 |
| Request status badge (pending/accepted/declined)           | shadcn/ui  | badge                  | `@/components/ui/badge`                           |
| **— About / Contact Pages —** ---------------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Contact message textarea                                   | shadcn/ui  | textarea               | `@/components/ui/textarea`                        |
| **— App-wide / Global —** -------------------------------  | ---------- | ---------------------- | ------------------------------------------------- |
| Navigation bar                                             | unlumen-ui | motion-navigation-menu | `@/components/unlumen-ui/motion-navigation-menu`  |
| Mobile navigation drawer                                   | shadcn/ui  | sheet                  | `@/components/ui/sheet`                           |
| Toast / success-error notification                         | beui       | animated-toast-stack   | `@/components/motion/animated-toast-stack`        |
| Loading spinner                                            | beui       | loader                 | `@/components/motion/loader`                      |
| Tooltip (amenity icons, info hints)                        | aceternity | tooltip                | `@/components/ui/animated-tooltip`                |
| Theme toggle (light/dark)                                  | beui       | theme-toggle           | `@/components/motion/theme-toggle`                |
| Profile avatar dropdown (hover → Profile / Logout)         | beui       | popover                | `@/components/motion/popover`                     |
| Login page layout (3d-marquee left, form right)            | shadcn/ui  | 3d-marquee             | `@/components/ui/3d-marquee`                      |
| Signup page layout (form left, 3d-marquee right)           | shadcn/ui  | 3d-marquee             | `@/components/ui/3d-marquee`                      |
| Login form — (reference)                                   | aceternity | signup-form-demo       | `@/components/signup-form-demo`                   |
| Signup form — (reference)                                  | aceternity | signup-form-demo       | `@/components/signup-form-demo`                   |

**Skip these, use alternative components** ----------------  | --------- | --------------- |-----------------------------------|
| Use Case                                                   | Library   | Component       | Import Path                       |
| ---------------------------------------------------------- | --------- | --------------- | --------------------------------- |
| Demo login button                                          | shadcn/ui | button          | `@/components/ui/button`          |
| CTA button / "View Details" button / submit button         | shadcn/ui | button          | `@/components/ui/button`          |
| Hero search bar                                            | shadcn/ui | input           | `@/components/ui/input`           |
| Search bar (title / location text search)                  | shadcn/ui | input           | `@/components/ui/input`           |
| Section tabs (Overview / Specs / Reviews)                  | shadcn/ui | tabs            | `@/components/ui/tabs`            |
| Location dropdown                                          | shadcn/ui | select          | `@/components/ui/select`          |
| Location filter dropdown                                   | shadcn/ui | select          | `@/components/ui/select`          |
| Sort dropdown (price / newest)                             | shadcn/ui | select          | `@/components/ui/select`          |
| Property type dropdown                                     | shadcn/ui | select          | `@/components/ui/select`          |
| Amenities checkbox list                                    | shadcn/ui | checkbox        | `@/components/ui/checkbox`        |
| Listings table (with View / Delete actions)                | shadcn/ui | table           | `@/components/ui/table`           |
| Navigation bar                                             | shadcn/ui | navigation-menu | `@/components/ui/navigation-menu` |
| Toast / success-error notification                         | shadcn/ui | sonner          | `@/components/ui/sonner`          |
| Loading spinner                                            | shadcn/ui | spinner         | `@/components/ui/spinner`         |
| Tooltip (amenity icons, info hints)                        | shadcn/ui | tooltip         | `@/components/ui/tooltip`         |
## Workflow

### Build Order (follow strictly, do not skip ahead)

1. MongoDB connection + types/models in `types.ts` (User, Listing, Review, BookingRequest)
2. Seed script (15-20 listings + demo user + admin user + a few seeded BookingRequests so Manage Listings / My Requests aren't empty on first load)
3. Auth API routes (register/login/logout/users-me + `PATCH /api/users/me`) + JWT helper (`lib/auth.ts`)
4. Login + Signup pages (3d-marquee layout, demo login button, register now includes phone/gender/date-of-birth, per Auth Pages mapping)
5. Listings API routes (GET list/filters/sort/pagination, GET single, POST, DELETE)
6. Explore/Listings page
7. Listing Details page (incl. Call Owner button + Propose Booking Date dialog → `POST /api/listings/[id]/booking-requests`)
8. Add Listing page (protected form + Cloudinary upload)
9. Manage Listings page (protected table + delete + empty state + Booking Requests section with Accept/Decline)
10. Profile page (`/profile`) — view/edit name, phone, gender, date of birth
11. My Booking Requests page (`/requests`) — read-only list of requests the current user has sent, with status
12. Landing page (all 9 sections per PRD section 4)
13. About + Contact pages
14. Polish: responsive check, color consistency, final QA

### Execution Rules

- Complete each step FULLY before moving to the next
- After finishing a step, STOP and show me what was done. Wait for my "next" before continuing
- If a step depends on a previous step's work, verify the previous step works before proceeding
- If I say "continue", move to the next step in order
- If I give a specific step number (e.g. "do step 5"), jump to that step only
- Do NOT silently skip any step. If something can't be done, leave a `// TODO: not implemented — [reason]` comment
- If a step requires a component that is not in the mapping above, STOP and ask me for guidance before proceeding

## Strict UI Rules

- NEVER create custom UI components from scratch, unless absolutely necessary
- ALWAYS check the mapping above before writing any UI code
- If no mapping exists for a use-case, STOP and ask the user
- Use shadcn/ui as the default, beui for animation/motion needs, unlumen-ui for complex/data-heavy components
- Login page: 3d-marquee on the LEFT, login form on the RIGHT
- Signup page: signup form on the LEFT, 3d-marquee on the RIGHT
- Both forms are based on `/components/signup-form-demo` — adapt it, don't rebuild from scratch
- 3d-marquee images for Login and Signup will be taken from `./public` folder
- If 3d marquee is used anywhere else then they must come from actual user-posted listing photos (fetched dynamically), not static/placeholder images
- Components with a `-demo.tsx` suffix (e.g. `signup-form-demo.tsx`) are reference components — they are good to use but MUST be adapted for this project: remove the `-demo` suffix, adjust imports, and integrate properly into the actual page/route. Do NOT use them as-is with the demo name.
- **Button choice rule:** a button that _starts a process_ (login, register, demo login, add listing, propose booking date, accept/decline a request, save profile) uses `button/stateful` — it needs to show its own loading/success/error state. A button that _just changes UI state or navigates_ (View Details, opening a dialog, navbar toggle, mobile drawer) uses `button/base`. When in doubt: if the click triggers an API call, it's `stateful`; if it only triggers local UI state or routing, it's `base`.
