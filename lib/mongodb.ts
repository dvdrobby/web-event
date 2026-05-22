import mongoose, { type Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Missing environment variable: "MONGODB_URI". ' +
      "Please define it in your .env.local file."
  );
}

/**
 * Shape of the cached connection object stored on the global object.
 * - `conn`    → an active Mongoose Connection, or null if not yet established.
 * - `promise` → the in-flight connection Promise, or null if none is pending.
 *
 * Storing both lets us reuse a connection that is still being set up,
 * avoiding redundant parallel connection attempts.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

/**
 * Extend the Node.js `global` type so TypeScript is aware of our cache key.
 * This is necessary because `global` is typed as `typeof globalThis` which
 * does not include custom properties by default.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Module-level cache reference.
 *
 * In Next.js development mode, hot-module replacement causes module code to
 * re-execute on every file save, which would open a new Mongoose connection
 * each time. By attaching the cache to `globalThis`, it survives HMR reloads
 * and we always reuse the same connection.
 *
 * In production the module is loaded once, so the module-level variable alone
 * would suffice — but using `globalThis` is a safe pattern for both environments.
 */
const cached: MongooseCache = (globalThis.mongooseCache ??= {
  conn: null,
  promise: null,
});

/**
 * Returns a Mongoose `Connection` instance, creating one if necessary.
 *
 * Usage:
 * ```ts
 * import dbConnect from "@/lib/mongodb";
 *
 * export async function GET() {
 *   const db = await dbConnect();
 *   // db is now ready — query via your Mongoose models
 * }
 * ```
 */
export default async function dbConnect(): Promise<Connection> {
  // Return the existing connection immediately if available.
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection attempt is in-flight, start one.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        /**
         * Buffers Mongoose commands until the connection is ready instead of
         * throwing an error immediately. Useful for concurrent requests that
         * arrive before the connection resolves.
         */
        bufferCommands: true,
      })
      .then((m) => m.connection);
  }

  try {
    // Await the in-flight promise (either ours or a prior concurrent call's).
    cached.conn = await cached.promise;
  } catch (error) {
    // On failure, clear the promise so the next call can retry.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
