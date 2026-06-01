import type { NextRequest } from 'next/server';

import { Event } from '@/database';
import dbConnect from '@/lib/mongodb';

// ── Type for the dynamic route context ────────────────────────────────────────
// In Next.js 15+, `params` is a Promise — it must be awaited before use.
type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/events/[slug]
 *
 * Returns the full details of a single event identified by its URL slug.
 *
 * Response shapes:
 *   200  { message, event }           – event found
 *   400  { message }                  – slug is missing or contains only whitespace
 *   404  { message }                  – no event matches the given slug
 *   500  { message, error? }          – unexpected server / database error
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<Response> {
  // ── 1. Extract and validate the route parameter ──────────────────────────
  // `params` is a Promise in Next.js 15 — await before destructuring.
  const { slug } = await params;

  if (!slug || slug.trim() === '') {
    return Response.json(
      { message: 'Slug is required and must not be empty.' },
      { status: 400 },
    );
  }

  // Basic sanity check: slugs contain only lowercase letters, digits, and hyphens.
  const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!SLUG_PATTERN.test(slug)) {
    return Response.json(
      { message: `Invalid slug format: "${slug}".` },
      { status: 400 },
    );
  }

  try {
    // ── 2. Establish / reuse the database connection ─────────────────────
    await dbConnect();

    // ── 3. Query for the event ───────────────────────────────────────────
    // `lean()` returns a plain JS object instead of a Mongoose Document,
    // which is lighter and serialises cleanly to JSON.
    const event = await Event.findOne({ slug }).lean();

    // ── 4. Handle not-found ──────────────────────────────────────────────
    if (!event) {
      return Response.json(
        { message: `No event found with slug: "${slug}".` },
        { status: 404 },
      );
    }

    // ── 5. Return the event ──────────────────────────────────────────────
    return Response.json(
      { message: 'Event fetched successfully.', event },
      { status: 200 },
    );
  } catch (error) {
    // ── 6. Handle unexpected errors ──────────────────────────────────────
    console.error('[GET /api/events/[slug]] Unexpected error:', error);

    return Response.json(
      {
        message: 'An unexpected error occurred while fetching the event.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
