import mongoose, { Schema, model, models, type Document, type Types } from "mongoose";

/** TypeScript interface for the Booking document. */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    // Reference to the Event collection; indexed for efficient lookups.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        // RFC 5322-inspired regex — catches the most common malformed inputs.
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props: { value: string }) =>
          `"${props.value}" is not a valid email address`,
      },
    },
  },
  {
    // Automatically adds and manages `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

/**
 * Pre-save hook: verify the referenced Event exists before persisting.
 *
 * Prevents orphaned bookings from accumulating when a caller passes a
 * non-existent or stale eventId.  We only run this check on insert (isNew)
 * or when eventId has been explicitly changed to avoid an extra DB round-trip
 * on every field update.
 */
// Async middleware: Mongoose resolves the promise automatically.
// Use `throw` to signal errors and plain `return` to exit early —
// calling `next()` in an async hook causes TypeScript to pick the
// wrong overload (SaveOptions instead of the callback type).
BookingSchema.pre("save", async function () {
  if (!this.isNew && !this.isModified("eventId")) {
    return;
  }

  // Lazy-require to avoid a circular dependency between model files.
  const Event = models.Event ?? (await import("./event.model")).default;

  const eventExists = await Event.exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error(
      `Event with id "${this.eventId.toString()}" does not exist`
    );
  }
});

/**
 * Use `models.Booking` when the model is already compiled (e.g. during HMR in
 * Next.js dev mode) to avoid the "Cannot overwrite model" Mongoose error.
 */
const Booking =
  (models.Booking as mongoose.Model<IBooking>) ??
  model<IBooking>("Booking", BookingSchema);

export default Booking;
