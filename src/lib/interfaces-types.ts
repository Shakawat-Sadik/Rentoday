import mongoose, { Schema } from 'mongoose'

// ─── TypeScript Interfaces ────────────────────────────────────────────────────
// These mirror the MongoDB documents 1-to-1. _id is typed as string because
// JSON serialization (API responses) turns ObjectId into a plain string.

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  phone: string
  gender: 'male' | 'female' | 'prefer not to say'
  dateOfBirth: Date
  role: 'user' | 'admin'
  createdAt: Date
}

export interface IListing {
  _id: string
  title: string
  shortDescription: string
  fullDescription: string
  rentPerMonth: number
  location: string          // one of the 10 Dhaka areas
  bedrooms: number
  propertyType: 'Apartment' | 'Studio' | 'Sublet/Room' | 'Bachelor Mess'
  amenities: string[]
  images: string[]          // Cloudinary secure_url values
  ownerId: string
  ownerEmail: string
  ownerPhone: string        // denormalized from User.phone at listing creation time
  rating: number            // 0–5, seeded/static
  createdAt: Date
}

export interface IReview {
  _id: string
  listingId: string
  userName: string
  rating: number            // 1–5
  comment: string
  createdAt: Date
}

export interface IBookingRequest {
  _id: string
  listingId: string
  listingTitle: string      // denormalized so "My Requests" page needs no join
  requesterId: string
  requesterName: string
  ownerId: string           // denormalized so owner/admin checks need no join
  proposedDate: Date
  message: string           // optional note from the requester
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

// ─── Mongoose Schemas ─────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },
  phone:       { type: String, required: true },
  gender:      { type: String, enum: ['male', 'female', 'prefer not to say'], required: true },
  dateOfBirth: { type: Date, required: true },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt:   { type: Date, default: Date.now },
})

const ListingSchema = new Schema<IListing>({
  title:            { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription:  { type: String, required: true },
  rentPerMonth:     { type: Number, required: true },
  location:         { type: String, required: true },
  bedrooms:         { type: Number, required: true },
  propertyType:     { type: String, required: true },
  amenities:        { type: [String], default: [] },
  images:           { type: [String], default: [] },
  // Stored as String (not ObjectId) so the TypeScript interface can use plain
  // string IDs — easier to work with in API responses without .toString() calls
  ownerId:          { type: String, required: true },
  ownerEmail:       { type: String, required: true },
  ownerPhone:       { type: String, required: true },
  rating:           { type: Number, default: 0 },
  createdAt:        { type: Date, default: Date.now },
})

const ReviewSchema = new Schema<IReview>({
  listingId: { type: String, required: true },
  userName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const BookingRequestSchema = new Schema<IBookingRequest>({
  listingId:     { type: String, required: true },
  listingTitle:  { type: String, required: true },
  requesterId:   { type: String, required: true },
  requesterName: { type: String, required: true },
  ownerId:       { type: String, required: true },
  proposedDate:  { type: Date, required: true },
  message:       { type: String, default: '' },
  status:        { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt:     { type: Date, default: Date.now },
})

// ─── Mongoose Models ──────────────────────────────────────────────────────────
// The `mongoose.models.X ||` check prevents "OverwriteModelError" when Next.js
// hot-reloads this module in development — the model is already registered, so
// we reuse it instead of calling mongoose.model() a second time.

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema)

export const Listing =
  (mongoose.models.Listing as mongoose.Model<IListing>) ||
  mongoose.model<IListing>('Listing', ListingSchema)

export const Review =
  (mongoose.models.Review as mongoose.Model<IReview>) ||
  mongoose.model<IReview>('Review', ReviewSchema)

export const BookingRequest =
  (mongoose.models.BookingRequest as mongoose.Model<IBookingRequest>) ||
  mongoose.model<IBookingRequest>('BookingRequest', BookingRequestSchema)
