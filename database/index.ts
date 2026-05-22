/**
 * database/index.ts
 *
 * Central export point for all Mongoose models.
 * Import from here instead of referencing individual model files directly.
 *
 * Usage:
 *   import { Event, Booking } from "@/database";
 */

export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";

// Re-export interfaces so callers can type their variables without a separate import path.
export type { IEvent } from "./event.model";
export type { IBooking } from "./booking.model";
