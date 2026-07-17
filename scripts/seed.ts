/**
 * Seed script — populates MongoDB with realistic Dhaka rental data.
 *
 * Run from the project root:
 *   node --env-file=.env.local --experimental-strip-types scripts/seed.ts
 *
 * WARNING: Clears all existing Users, Listings, Reviews, and BookingRequests
 * before inserting fresh data. Do not run against a production database.
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ─── Environment check ────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set.')
  console.error('    Run: node --env-file=.env.local --experimental-strip-types scripts/seed.ts')
  process.exit(1)
}

// ─── Inline schemas (self-contained so no @/ alias issues) ───────────────────
// These mirror interfaces-types.ts exactly — keep them in sync if models change.

const UserSchema = new mongoose.Schema({
  name:        String,
  email:       { type: String, unique: true },
  password:    String,
  phone:       String,
  gender:      String,
  dateOfBirth: Date,
  role:        { type: String, default: 'user' },
  createdAt:   { type: Date, default: Date.now },
})

const ListingSchema = new mongoose.Schema({
  title:            String,
  shortDescription: String,
  fullDescription:  String,
  rentPerMonth:     Number,
  location:         String,
  bedrooms:         Number,
  propertyType:     String,
  amenities:        [String],
  images:           [String],
  ownerId:          String,
  ownerEmail:       String,
  ownerPhone:       String,
  rating:           Number,
  createdAt:        { type: Date, default: Date.now },
})

const ReviewSchema = new mongoose.Schema({
  listingId: String,
  userName:  String,
  rating:    Number,
  comment:   String,
  createdAt: { type: Date, default: Date.now },
})

const BookingRequestSchema = new mongoose.Schema({
  listingId:     String,
  listingTitle:  String,
  requesterId:   String,
  requesterName: String,
  ownerId:       String,
  proposedDate:  Date,
  message:       String,
  status:        { type: String, default: 'pending' },
  createdAt:     { type: Date, default: Date.now },
})

const User           = mongoose.model('User',           UserSchema)
const Listing        = mongoose.model('Listing',        ListingSchema)
const Review         = mongoose.model('Review',         ReviewSchema)
const BookingRequest = mongoose.model('BookingRequest', BookingRequestSchema)

// ─── Image pools (picsum.photos — consistent per seed string, no API key) ────

const IMAGES = {
  apartment: [
    'https://picsum.photos/seed/apt-dhaka-1/800/600',
    'https://picsum.photos/seed/apt-dhaka-2/800/600',
    'https://picsum.photos/seed/apt-dhaka-3/800/600',
    'https://picsum.photos/seed/apt-dhaka-4/800/600',
  ],
  studio: [
    'https://picsum.photos/seed/studio-dhaka-1/800/600',
    'https://picsum.photos/seed/studio-dhaka-2/800/600',
    'https://picsum.photos/seed/studio-dhaka-3/800/600',
  ],
  room: [
    'https://picsum.photos/seed/room-dhaka-1/800/600',
    'https://picsum.photos/seed/room-dhaka-2/800/600',
    'https://picsum.photos/seed/room-dhaka-3/800/600',
  ],
  mess: [
    'https://picsum.photos/seed/mess-dhaka-1/800/600',
    'https://picsum.photos/seed/mess-dhaka-2/800/600',
  ],
}

// ─── Seed data definitions ────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI as string, { dbName: 'rentoday' })
  console.log('✅ Connected to MongoDB')

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Review.deleteMany({}),
    BookingRequest.deleteMany({}),
  ])
  console.log('🗑️  Cleared existing data')

  // ── Users ──────────────────────────────────────────────────────────────────
  // Passwords hashed with bcrypt (10 salt rounds is the secure default)
  const [demoPass, adminPass, extraPass] = await Promise.all([
    bcrypt.hash('/User1997/',  10),
    bcrypt.hash('/Admin1997/', 10),
    bcrypt.hash('/Sell1234/', 10),
  ])

  const users = await User.insertMany([
    {
      name: 'Abdur Rahman Arif',
      email: 'user@rentoday.com',
      password: demoPass,
      phone: '+8801712345678',
      gender: 'male',
      dateOfBirth: new Date('1990-03-15'),
      role: 'user',
    },
    {
      name: 'Marzia Kabir',
      email: 'admin@rentoday.com',
      password: adminPass,
      phone: '+8801812345678',
      gender: 'female',
      dateOfBirth: new Date('1985-07-22'),
      role: 'admin',
    },
    {
      name: 'Arif Ahmed',
      email: 'arif@example.com',
      password: extraPass,
      phone: '+8801912345678',
      gender: 'male',
      dateOfBirth: new Date('1988-11-30'),
      role: 'user',
    },
    {
      name: 'Fariha Khanam',
      email: 'fariha@example.com',
      password: extraPass,
      phone: '+8801612345678',
      gender: 'female',
      dateOfBirth: new Date('1992-04-20'),
      role: 'user',
    },
    {
      name: 'Abdul Karim Jewel',
      email: 'jewel@example.com',
      password: extraPass,
      phone: '+8801512345678',
      gender: 'male',
      dateOfBirth: new Date('1983-09-05'),
      role: 'user',
    },
  ])

  const [demo, admin, tanvir, fariha, karim] = users
  console.log(`👥 Inserted ${users.length} users`)

  // ── Listings ───────────────────────────────────────────────────────────────

  const listingDefs = [
    // ── Admin's listings (4)
    {
      title: 'Furnished 3-Bedroom Apartment in Dhanmondi 27',
      shortDescription: 'Spacious furnished flat minutes from Dhanmondi Lake with modern amenities and 24/7 security.',
      fullDescription:
        'This well-maintained 3-bedroom apartment in Dhanmondi 27 offers a perfect blend of comfort and convenience. ' +
        'The flat comes fully furnished with quality furniture including beds, wardrobes, sofas, and a dining set. ' +
        'The kitchen is equipped with a gas stove and modern fittings. Located just a 5-minute walk from Dhanmondi Lake and close to ' +
        'Rapa Plaza and Star Kabab, the area is vibrant with cafes, restaurants, and pharmacies. Building has a lift, generator backup, ' +
        'and rooftop terrace. Ideal for a professional family.',
      rentPerMonth: 45000,
      location: 'Dhanmondi',
      bedrooms: 3,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Security', 'Balcony', 'Furnished', 'Water reserve tank'],
      images: [IMAGES.apartment[0], IMAGES.apartment[1], IMAGES.apartment[2]],
      owner: admin,
      rating: 4.6,
      createdAt: new Date('2025-11-10'),
    },
    {
      title: 'Cozy Studio Apartment in Gulshan 2 Near DCC Market',
      shortDescription: 'Compact, well-lit studio ideal for a single professional near Gulshan 2 circle.',
      fullDescription:
        'A beautifully designed studio apartment on the 5th floor of a modern building in Gulshan 2. ' +
        'The space is efficiently laid out with a combined living-sleeping area, a separate kitchenette with gas connection, ' +
        'and a tiled bathroom with geyser. Large east-facing windows flood the room with natural light. ' +
        'Walking distance from DCC Market, Nandan Mega Shop, and multiple banks. Building has CCTV, lift, ' +
        'and a generator for power cuts. Utilities included in rent.',
      rentPerMonth: 22000,
      location: 'Gulshan',
      bedrooms: 1,
      propertyType: 'Studio',
      amenities: ['Gas', 'Lift', 'Generator', 'Security', 'Furnished'],
      images: [IMAGES.studio[0], IMAGES.studio[1]],
      owner: admin,
      rating: 4.2,
      createdAt: new Date('2025-12-01'),
    },
    {
      title: 'Affordable Studio Near Jamuna Future Park, Bashundhara',
      shortDescription: 'Neat studio unit in Bashundhara R/A, walking distance to Jamuna Future Park.',
      fullDescription:
        'This studio apartment in Bashundhara Residential Area offers great value in one of Dhaka\'s fastest-growing neighbourhoods. ' +
        'Located just 10 minutes on foot from Jamuna Future Park, the largest shopping mall in Bangladesh, and close to several ' +
        'international schools and hospitals. The unit has a gas connection, good water supply from a reserve tank, and a rooftop ' +
        'solar panel system that reduces electricity bills. Semi-furnished with a bed frame and wardrobe. ' +
        'Building has lift and security guard.',
      rentPerMonth: 18000,
      location: 'Bashundhara',
      bedrooms: 1,
      propertyType: 'Studio',
      amenities: ['Gas', 'Lift', 'Security', 'Water reserve tank', 'Balcony'],
      images: [IMAGES.studio[1], IMAGES.studio[2]],
      owner: admin,
      rating: 3.9,
      createdAt: new Date('2026-01-15'),
    },
    {
      title: 'Compact Studio in Badda Near Pragati Sarani',
      shortDescription: 'Affordable studio in Badda — great connectivity to Gulshan and Banani via Pragati Sarani.',
      fullDescription:
        'Situated in East Badda with direct access to Pragati Sarani, this studio is ideal for professionals ' +
        'working in Gulshan or Banani who prefer lower rent. The unit is on the 3rd floor of a 6-storey building. ' +
        'It has a kitchenette with gas burner connection, a tiled bathroom, and a small balcony. ' +
        'The area has multiple bus routes and CNGs are readily available. ' +
        'Building has a generator for common areas. Water is supplied from a dedicated rooftop tank. ' +
        'Unfurnished — bring your own furniture.',
      rentPerMonth: 12000,
      location: 'Badda',
      bedrooms: 1,
      propertyType: 'Studio',
      amenities: ['Gas', 'Generator', 'Security', 'Balcony', 'Water reserve tank'],
      images: [IMAGES.studio[0], IMAGES.studio[2]],
      owner: admin,
      rating: 3.5,
      createdAt: new Date('2026-02-10'),
    },

    // ── Tanvir's listings (5)
    {
      title: 'Spacious 2-Bedroom Flat in Banani Block C',
      shortDescription: 'Bright 2-bed flat in one of Banani\'s most sought-after blocks, ready to move in.',
      fullDescription:
        'Located in Banani Block C, this 2-bedroom flat sits on the 7th floor of a well-maintained building. ' +
        'Both bedrooms are airy with built-in wardrobes. The open-plan living and dining area is perfect for entertaining. ' +
        'Semi-furnished with beds and a sofa set. The building has a 24-hour generator, covered parking for one car, ' +
        'CCTV surveillance, and an efficient lift. Close to Banani Club, Kamal Ataturk Avenue, and numerous restaurants. ' +
        'Owner lives on the same floor so maintenance issues are resolved quickly.',
      rentPerMonth: 38000,
      location: 'Banani',
      bedrooms: 2,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Parking', 'Security', 'Water reserve tank'],
      images: [IMAGES.apartment[1], IMAGES.apartment[3], IMAGES.apartment[0]],
      owner: tanvir,
      rating: 4.4,
      createdAt: new Date('2025-10-22'),
    },
    {
      title: 'Modern 4-Bedroom Family Apartment in Uttara Sector 11',
      shortDescription: 'Large family apartment in Uttara — near Shahjalal Airport and Uttara Club.',
      fullDescription:
        'A prime 4-bedroom apartment in Uttara Sector 11, ideal for families wanting a safe and well-connected neighbourhood. ' +
        'The flat covers 2,200 sq ft with a spacious living room, formal dining area, a large kitchen with gas connection, ' +
        'and four en-suite bedrooms. The building has two lifts, three-phase generator backup, underground parking for two cars, ' +
        'rooftop water reserve tank, and a dedicated security team. ' +
        'Close to Uttara Model Town, Aarong, and Shahjalal International Airport (15 min). ' +
        'The flat is unfurnished so you can decorate to your taste. Suitable for an expat family or senior executive.',
      rentPerMonth: 55000,
      location: 'Uttara',
      bedrooms: 4,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Parking', 'Security', 'Balcony', 'Water reserve tank'],
      images: [IMAGES.apartment[2], IMAGES.apartment[0], IMAGES.apartment[3]],
      owner: tanvir,
      rating: 4.7,
      createdAt: new Date('2025-09-05'),
    },
    {
      title: 'Well-Ventilated 3-Bedroom Flat in Lalmatia Block J',
      shortDescription: 'Classic Lalmatia flat in a quiet lane, close to Lalmatia Housing Society fields.',
      fullDescription:
        'This 3-bedroom apartment in Lalmatia Block J is situated in one of the calmest lanes of this well-established neighbourhood. ' +
        'The flat has a large, breezy living room, a separate dining area, and a kitchen with a gas line. ' +
        'Two of the three bedrooms face a small inner garden. The building has a rooftop water reserve tank ensuring ' +
        'uninterrupted water supply even during WASA cuts. Generator covers the entire building. ' +
        'One dedicated parking space included. Schools, supermarkets, and Lalmatia Housing Society park all within 5 minutes. ' +
        'Semi-furnished — beds in all rooms. Ideal for a family relocating from outside Dhaka.',
      rentPerMonth: 42000,
      location: 'Lalmatia',
      bedrooms: 3,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Generator', 'Parking', 'Security', 'Water reserve tank'],
      images: [IMAGES.apartment[3], IMAGES.apartment[1]],
      owner: tanvir,
      rating: 4.3,
      createdAt: new Date('2025-11-28'),
    },
    {
      title: 'Fully Furnished 3-Bedroom Near Dhanmondi Lake (Road 6)',
      shortDescription: 'Premium furnished flat just 200m from Dhanmondi Lake — ideal for a family.',
      fullDescription:
        'This premium 3-bedroom apartment on Road 6, Dhanmondi is situated just 200 metres from the lake\'s walking path. ' +
        'Completely furnished to a high standard: king beds, 43" smart TVs, air conditioning in all rooms, modular kitchen with ' +
        'refrigerator, microwave and gas stove. The living area has a sectional sofa and a large dining table for 8. ' +
        'Balcony offers a partial lake view. Building is 8 years old, well-maintained with a 1,000-litre reserve tank on each floor, ' +
        'generator backup, lift, and 24/7 concierge. Grocery stores and Star Kabab are a 3-minute walk.',
      rentPerMonth: 48000,
      location: 'Dhanmondi',
      bedrooms: 3,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Security', 'Balcony', 'Furnished', 'Water reserve tank'],
      images: [IMAGES.apartment[0], IMAGES.apartment[2], IMAGES.apartment[3]],
      owner: tanvir,
      rating: 4.8,
      createdAt: new Date('2025-08-14'),
    },
    {
      title: 'Budget Sublet Room Near North South University, Badda',
      shortDescription: 'Affordable sublet for students in Badda — 10-minute walk to NSU campus.',
      fullDescription:
        'A clean, single-occupancy sublet room in a flat shared with two other working professionals in East Badda. ' +
        'The room is furnished with a single bed, study table, and wardrobe. Shared kitchen (gas connection), two bathrooms, ' +
        'and a common living area with a TV. Wi-Fi is available on a shared bill basis. ' +
        'Located 10 minutes on foot from North South University and near multiple local restaurants serving set meals for under BDT 100. ' +
        'Ideal for NSU students or junior executives. No couples or smokers, please.',
      rentPerMonth: 8500,
      location: 'Badda',
      bedrooms: 1,
      propertyType: 'Sublet/Room',
      amenities: ['Gas', 'Security'],
      images: [IMAGES.room[0], IMAGES.room[1]],
      owner: tanvir,
      rating: 3.7,
      createdAt: new Date('2026-02-20'),
    },

    // ── Fariha's listings (4)
    {
      title: 'Bachelor Mess Room in Mirpur 10 Circle Area',
      shortDescription: 'Well-managed bachelor mess near Mirpur 10 Metro Station — utilities included.',
      fullDescription:
        'A well-run bachelor mess on Road 2, Mirpur 10 accepting male tenants only. The room is for single occupancy ' +
        'with a bed, fan, and study table provided. Shared kitchen with gas, two clean bathrooms, and a rooftop space for laundry. ' +
        'Very close to Mirpur 10 Metro Station (Line 6) making commute to Motijheel, Farmgate, or Mohakhali under 20 minutes. ' +
        'Plenty of local food options (bhat-ghor) within 50 metres for budget meals. ' +
        'Utility bills (electricity, water, gas) included in rent. Monthly advance 2 months. ' +
        'House rules: no guests after 10 PM, no smoking inside.',
      rentPerMonth: 8000,
      location: 'Mirpur',
      bedrooms: 1,
      propertyType: 'Bachelor Mess',
      amenities: ['Gas', 'Security', 'Water reserve tank'],
      images: [IMAGES.mess[0], IMAGES.mess[1]],
      owner: fariha,
      rating: 3.8,
      createdAt: new Date('2026-01-08'),
    },
    {
      title: 'Semi-Furnished 2-Bedroom in Bashundhara R/A Block B',
      shortDescription: 'Quiet residential flat in Bashundhara R/A — perfect for a small family.',
      fullDescription:
        'Located on Block B of Bashundhara Residential Area, this 2-bedroom apartment offers a peaceful living environment ' +
        'away from the noise of the main city. The flat has a spacious living room, an open dining area, and a well-sized kitchen ' +
        'with a gas connection and extra counter space. Both bedrooms have built-in wardrobes. ' +
        'Semi-furnished with beds and a dining table. Building has a CCTV-monitored entrance, a generator for emergency use, ' +
        'and a rooftop water reserve tank. Walking distance from the Eastern Housing Society park, a pharmacy, and a daily market. ' +
        'Major roads connect you to Pragati Sarani and Gulshan within 20 minutes.',
      rentPerMonth: 32000,
      location: 'Bashundhara',
      bedrooms: 2,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Security', 'Water reserve tank'],
      images: [IMAGES.apartment[2], IMAGES.apartment[0]],
      owner: fariha,
      rating: 4.1,
      createdAt: new Date('2025-12-18'),
    },
    {
      title: 'Premium 2-Bedroom Apartment in Baridhara Diplomatic Zone',
      shortDescription: 'High-end flat in Baridhara — furnished, secure, close to embassies and NSU.',
      fullDescription:
        'An exceptional 2-bedroom apartment in Baridhara J Block, the heart of Dhaka\'s diplomatic zone. ' +
        'The property is tastefully furnished with imported furniture, double-glazed windows, and tiled marble floors. ' +
        'The kitchen has a full-size refrigerator, microwave, gas hob, and built-in cabinets. ' +
        'Both bedrooms have split ACs and attached bathrooms with hot-water geysers. ' +
        'The building has 24-hour armed security, covered parking for two cars, a backup generator, and a rooftop pool (shared). ' +
        'Ideal for diplomats, senior executives, or expat families. Within 5 minutes of various embassies and international schools.',
      rentPerMonth: 65000,
      location: 'Baridhara',
      bedrooms: 2,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Parking', 'Security', 'Balcony', 'Furnished', 'Water reserve tank'],
      images: [IMAGES.apartment[1], IMAGES.apartment[3], IMAGES.apartment[0]],
      owner: fariha,
      rating: 4.9,
      createdAt: new Date('2025-07-30'),
    },
    {
      title: 'Sublet Room in Mohammadpur Jahangirnagar Housing',
      shortDescription: 'Affordable sublet in Mohammadpur — close to Dhaka College and City College.',
      fullDescription:
        'A clean sublet room in a 3-bedroom flat in Mohammadpur Jahangirnagar Housing Society. ' +
        'The room is furnished with a bed and a study table. Shared kitchen with gas line and two bathrooms. ' +
        'The common areas are cleaned daily. Located near Dhaka City College, Mohammadpur Town Hall Bus Stand, ' +
        'and Krishi Market for fresh groceries. ' +
        'Female tenants preferred. No smoking. Advance 2 months.',
      rentPerMonth: 11000,
      location: 'Mohammadpur',
      bedrooms: 1,
      propertyType: 'Sublet/Room',
      amenities: ['Gas', 'Security', 'Water reserve tank'],
      images: [IMAGES.room[1], IMAGES.room[2]],
      owner: fariha,
      rating: 3.6,
      createdAt: new Date('2026-01-25'),
    },

    // ── Abdul Karim's listings (5)
    {
      title: 'Sublet Room in Mohammadpur Town Hall (Ground Floor)',
      shortDescription: 'Ground-floor sublet ideal for someone who prefers no stairs and easy street access.',
      fullDescription:
        'A bright ground-floor sublet room in a residential flat near Mohammadpur Town Hall. ' +
        'The room is semi-furnished with a bed and ceiling fan. Shared kitchen, bathroom, and a small veranda. ' +
        'The landlord family is on the same floor — very secure and family-friendly environment. ' +
        'Close to Mohammadpur Bus Stand, Noor Jahan Road market, and multiple schools. ' +
        'Elderly tenants or single females preferred. Utilities billed separately.',
      rentPerMonth: 9500,
      location: 'Mohammadpur',
      bedrooms: 1,
      propertyType: 'Sublet/Room',
      amenities: ['Gas', 'Security'],
      images: [IMAGES.room[0], IMAGES.room[2]],
      owner: karim,
      rating: 3.4,
      createdAt: new Date('2026-02-28'),
    },
    {
      title: 'Luxurious 5-Bedroom Penthouse in Gulshan 1',
      shortDescription: 'Rare full-floor penthouse in prime Gulshan 1 — panoramic city views.',
      fullDescription:
        'A truly rare opportunity to live in a full-floor penthouse on the 12th floor of a premium building in Gulshan 1. ' +
        'The 5-bedroom unit comes with a massive wraparound balcony offering unobstructed views of the Gulshan lake and city skyline. ' +
        'Fully furnished to a five-star standard: chef\'s kitchen with imported appliances, two living rooms, a home office, ' +
        'and a private rooftop garden. Building amenities include concierge service, valet parking, gym, and 24/7 armed security. ' +
        'Dedicated generator and triple-redundant water supply. Suitable for a C-level executive household or high-value corporate stay. ' +
        'Monthly rent negotiable for a minimum 12-month lease.',
      rentPerMonth: 78000,
      location: 'Gulshan',
      bedrooms: 5,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Parking', 'Security', 'Balcony', 'Furnished', 'Water reserve tank'],
      images: [IMAGES.apartment[3], IMAGES.apartment[0], IMAGES.apartment[2]],
      owner: karim,
      rating: 4.9,
      createdAt: new Date('2025-06-01'),
    },
    {
      title: 'Shared Bachelor Mess in Mirpur 1 Near Metro Line',
      shortDescription: 'Budget-friendly bachelor mess in Mirpur 1 — 5 minutes from Mirpur 1 Metro Station.',
      fullDescription:
        'A well-maintained bachelor mess in Mirpur Section 1 catering to working males. ' +
        'Three beds available in single-occupancy rooms. Each room has a fan, tube light, and lockable door. ' +
        'Shared kitchen with gas stove and cooking utensils provided. Two bathrooms for the floor, kept clean. ' +
        'Rooftop access for laundry drying. Walking distance to Mirpur 1 Metro Station, local bazaar, and dozens of ' +
        'affordable restaurants. The mess manager lives on the premises ensuring quick issue resolution. ' +
        'Advance: 2 months. All utilities included in rent.',
      rentPerMonth: 7500,
      location: 'Mirpur',
      bedrooms: 1,
      propertyType: 'Bachelor Mess',
      amenities: ['Gas', 'Security', 'Water reserve tank'],
      images: [IMAGES.mess[0], IMAGES.mess[1]],
      owner: karim,
      rating: 3.3,
      createdAt: new Date('2026-03-05'),
    },
    {
      title: 'New 2-Bedroom Apartment in Uttara Sector 3',
      shortDescription: 'Brand-new flat in Uttara Sector 3 — first tenant, never lived in before.',
      fullDescription:
        'Just completed in January 2026, this 2-bedroom apartment in Uttara Sector 3 is being rented for the first time. ' +
        'Everything is brand new: tiles, fixtures, electrical wiring, and plumbing. ' +
        'The kitchen has a granite countertop, gas line, and built-in cabinets. Both bedrooms are sizeable with space for a ' +
        'double bed, wardrobe, and study table. Unfurnished so you can set it up your way. ' +
        'The building is 8 storeys with a dedicated lift, generator covering all floors, rooftop water reserve tank, ' +
        'and a boundary wall with guard. Close to Uttara RAJUK Model Town Cantonment market and Sector 3 school.',
      rentPerMonth: 28000,
      location: 'Uttara',
      bedrooms: 2,
      propertyType: 'Apartment',
      amenities: ['Gas', 'Lift', 'Generator', 'Security', 'Balcony', 'Water reserve tank'],
      images: [IMAGES.apartment[1], IMAGES.apartment[3]],
      owner: karim,
      rating: 4.0,
      createdAt: new Date('2026-01-30'),
    },
    {
      title: 'Fully Furnished Studio in Banani DOHS Near Main Gate',
      shortDescription: 'Premium studio inside Banani DOHS — secure, modern, close to main commercial hub.',
      fullDescription:
        'A beautifully furnished studio inside Banani DOHS (Defence Officers Housing Society) near the main gate. ' +
        'The unit is on the 4th floor and features a comfortable queen bed, a large study desk, a 40" LED TV, ' +
        'split AC, mini refrigerator, microwave, and an electric kettle. The attached bathroom has a hot-water geyser. ' +
        'The area is exceptionally secure with DOHS boundary wall, guards at every entry point, and CCTV throughout. ' +
        'Close to Banani DOHS market, Khilgaon Flyover, and a short CNG ride to Gulshan. ' +
        'Utilities (electricity, gas, water) billed separately at actuals. No sub-letting allowed.',
      rentPerMonth: 28000,
      location: 'Banani',
      bedrooms: 1,
      propertyType: 'Studio',
      amenities: ['Gas', 'Lift', 'Generator', 'Security', 'Furnished', 'Water reserve tank'],
      images: [IMAGES.studio[2], IMAGES.studio[0]],
      owner: karim,
      rating: 4.5,
      createdAt: new Date('2025-10-01'),
    },
  ]

  // Build Mongoose documents with ownerId, ownerEmail, ownerPhone from user
  const listingDocs = listingDefs.map(({ owner, ...rest }) => ({
    ...rest,
    ownerId:    String(owner._id),
    ownerEmail: owner.email as string,
    ownerPhone: owner.phone as string,
  }))

  const listings = await Listing.insertMany(listingDocs)
  console.log(`🏠 Inserted ${listings.length} listings`)

  // ── Reviews ────────────────────────────────────────────────────────────────

  // Reviewer names (realistic Bangladeshi names)
  const REVIEWERS = [
    'Rina Khatun', 'Sabbir Hossain', 'Nusrat Jahan', 'Rafiqul Islam',
    'Tahmina Akter', 'Mahfuzur Rahman', 'Sharmin Sultana', 'Jahirul Karim',
    'Monira Begum', 'Ashraful Haque',
  ]

  const REVIEW_TEMPLATES = [
    { r: 5, c: 'Excellent place — exactly as described. The landlord was very responsive and helpful.' },
    { r: 5, c: 'Loved living here. Clean, well-maintained, and the location is perfect for commuting.' },
    { r: 4, c: 'Very comfortable apartment. Minor issue with water pressure occasionally but overall great value.' },
    { r: 4, c: 'Nice flat in a good area. The building security is top-notch. Highly recommend.' },
    { r: 4, c: 'Good size rooms and plenty of natural light. The gas supply is consistent, which is a big plus.' },
    { r: 3, c: 'Decent place for the price. A few things needed fixing when I moved in but landlord sorted them out.' },
    { r: 3, c: 'Okay location, fine apartment. Noise from the street can be an issue on weekday mornings.' },
    { r: 5, c: 'Stunning views and great amenities. The building management is professional and responsive.' },
    { r: 4, c: 'Spacious rooms and friendly neighbours. Power cuts are rare thanks to the generator.' },
    { r: 5, c: 'Absolutely loved this apartment. Would re-rent without hesitation if I move back to Dhaka.' },
  ]

  const reviewDocs = []
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i]
    // Each listing gets 2–3 reviews
    const count = (i % 3 === 0) ? 3 : 2
    for (let j = 0; j < count; j++) {
      const template = REVIEW_TEMPLATES[(i * 2 + j) % REVIEW_TEMPLATES.length]
      reviewDocs.push({
        listingId: String(listing._id),
        userName:  REVIEWERS[(i + j) % REVIEWERS.length],
        rating:    template.r,
        comment:   template.c,
        createdAt: new Date(Date.now() - (i * 7 + j * 2) * 24 * 60 * 60 * 1000), // stagger dates
      })
    }
  }

  await Review.insertMany(reviewDocs)
  console.log(`⭐ Inserted ${reviewDocs.length} reviews`)

  // ── Booking Requests ───────────────────────────────────────────────────────
  // Goal:
  //   • Demo user (Arif) has 3 requests on his /requests page (pending, accepted, declined)
  //   • Admin (Sumaiya) has 2 pending requests on her /items/manage booking section
  //   • Ensures both demo roles show something useful on first login

  // listings by admin: indices 0-3 (admin's 4 listings)
  // listings by tanvir: indices 4-8
  // listings by fariha: indices 9-12
  // listings by karim: indices 13-17

  const [
    adminL1, adminL2, , ,
    tanvirL1, , , tanvirL4, ,
    farihaL1, farihaL2,
  ] = listings

  await BookingRequest.insertMany([
    // Demo user books tanvir's listing (Banani) — status: pending
    {
      listingId:     String(tanvirL1._id),
      listingTitle:  tanvirL1.title as string,
      requesterId:   String(demo._id),
      requesterName: demo.name as string,
      ownerId:       String(tanvir._id),
      proposedDate:  new Date('2026-08-01'),
      message:       'Hi, I am interested in viewing the flat this weekend. Is Saturday morning possible?',
      status:        'pending',
      createdAt:     new Date('2026-07-10'),
    },
    // Demo user books tanvir's listing (Dhanmondi furnished) — status: accepted
    {
      listingId:     String(tanvirL4._id),
      listingTitle:  tanvirL4.title as string,
      requesterId:   String(demo._id),
      requesterName: demo.name as string,
      ownerId:       String(tanvir._id),
      proposedDate:  new Date('2026-07-25'),
      message:       'I would like to visit and discuss terms. Please confirm.',
      status:        'accepted',
      createdAt:     new Date('2026-07-05'),
    },
    // Demo user books fariha's listing (Bashundhara) — status: declined
    {
      listingId:     String(farihaL2._id),
      listingTitle:  farihaL2.title as string,
      requesterId:   String(demo._id),
      requesterName: demo.name as string,
      ownerId:       String(fariha._id),
      proposedDate:  new Date('2026-07-20'),
      message:       'Can I visit on a weekday evening?',
      status:        'declined',
      createdAt:     new Date('2026-07-01'),
    },
    // Fariha books admin's Dhanmondi listing — pending (admin sees this in Manage Listings)
    {
      listingId:     String(adminL1._id),
      listingTitle:  adminL1.title as string,
      requesterId:   String(fariha._id),
      requesterName: fariha.name as string,
      ownerId:       String(admin._id),
      proposedDate:  new Date('2026-08-05'),
      message:       'Looking for long-term rental. Can we schedule a visit?',
      status:        'pending',
      createdAt:     new Date('2026-07-12'),
    },
    // Karim books admin's Gulshan studio — pending (admin sees this in Manage Listings)
    {
      listingId:     String(adminL2._id),
      listingTitle:  adminL2.title as string,
      requesterId:   String(karim._id),
      requesterName: karim.name as string,
      ownerId:       String(admin._id),
      proposedDate:  new Date('2026-07-30'),
      message:       'I am relocating from Chittagong next month. Available for viewing anytime.',
      status:        'pending',
      createdAt:     new Date('2026-07-14'),
    },
    // Fariha books admin's Bashundhara studio (already accepted — for variety)
    {
      listingId:     String(farihaL1._id),
      listingTitle:  farihaL1.title as string,
      requesterId:   String(demo._id),
      requesterName: demo.name as string,
      ownerId:       String(fariha._id),
      proposedDate:  new Date('2026-07-18'),
      message:       'I am a single professional. When can I visit?',
      status:        'accepted',
      createdAt:     new Date('2026-07-08'),
    },
  ])
  console.log('📅 Inserted 6 booking requests')

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!')
  console.log('   User  → user@rentoday.com  / /User1997/')
  console.log('   Admin → admin@rentoday.com / /Admin1997/')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
