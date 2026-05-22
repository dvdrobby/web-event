import mongoose, { Schema, model, models, type Document } from "mongoose";

/** TypeScript interface for the Event document. */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    // Unique, URL-safe identifier derived from the title (see pre-save hook).
    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Stored as an ISO 8601 date string after normalization (see pre-save hook).
    date: {
      type: String,
      required: [true, "Date is required"],
    },

    // Stored in "HH:MM" 24-hour format after normalization (see pre-save hook).
    time: {
      type: String,
      required: [true, "Time is required"],
    },

    mode: {
      type: String,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: 'Mode must be "online", "offline", or "hybrid"',
      },
      required: [true, "Mode is required"],
    },

    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },

    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },

    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },

    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    // Automatically adds and manages `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

/**
 * Pre-save hook: slug generation, date normalization, time normalization.
 *
 * Runs before every `save()` call so derived/normalized fields stay consistent
 * without requiring the caller to compute them manually.
 */
// Sync middleware: Mongoose catches thrown errors automatically.
// Use `throw` to signal errors and plain `return` to exit early —
// calling `next()` causes TypeScript to pick the wrong overload (SaveOptions).
EventSchema.pre("save", function () {
  // ── Slug generation ──────────────────────────────────────────────────────
  // Only regenerate when title has changed to preserve existing inbound links.
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")   // strip non-word chars (keep hyphens)
      .replace(/\s+/g, "-")       // collapse whitespace → hyphens
      .replace(/-+/g, "-");       // collapse consecutive hyphens
  }

  // ── Date normalization ───────────────────────────────────────────────────
  // Convert the caller-supplied date string to ISO 8601 (YYYY-MM-DD).
  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: "${this.date}"`);
    }
    // Store only the date portion in UTC to avoid timezone drift.
    this.date = parsed.toISOString().split("T")[0];
  }

  // ── Time normalization ───────────────────────────────────────────────────
  // Accept "H:MM", "HH:MM", or "HH:MM:SS" → store as "HH:MM".
  if (this.isModified("time")) {
    const match = this.time.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
      throw new Error(`Invalid time value: "${this.time}". Expected HH:MM`);
    }
    const hours = match[1].padStart(2, "0");
    const minutes = match[2];
    this.time = `${hours}:${minutes}`;
  }
});

/**
 * Use `models.Event` when the model is already compiled (e.g. during HMR in
 * Next.js dev mode) to avoid the "Cannot overwrite model" Mongoose error.
 */
const Event = (models.Event as mongoose.Model<IEvent>) ?? model<IEvent>("Event", EventSchema);

export default Event;
