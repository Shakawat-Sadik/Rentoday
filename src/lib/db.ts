import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables')
}

// Cache the connection on the global object so Next.js hot reloads in
// development don't open a new connection on every module re-evaluation.
type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend the NodeJS global type to hold our cache
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null }
global.__mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  // Return the existing connection if we already have one
  if (cached.conn) {
    return cached.conn
  }

  // Start a new connection if one isn't already in-flight
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string, {
      dbName: 'rentoday', // explicit DB name so the URI doesn't need it
    })
  }

  // Wait for the connection and cache it
  cached.conn = await cached.promise
  return cached.conn
}
