<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the DevEvent Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`** (new): Initializes PostHog client-side using the `instrumentation-client` pattern recommended for Next.js 15.3+. Enables autocapture, session replay, error tracking (`capture_exceptions`), and routes all events through a local reverse proxy at `/ingest`.
- **`next.config.ts`** (updated): Added reverse proxy rewrites routing `/ingest/*` to PostHog's US ingestion servers, plus `skipTrailingSlashRedirect: true` to support PostHog's trailing-slash API requests.
- **`components/ExploreBtn.tsx`** (updated): Added `posthog.capture("explore_events_clicked")` in the existing `onClick` handler.
- **`components/EventCard.tsx`** (updated): Converted to a client component (`"use client"`) and added `posthog.capture("event_card_clicked", { title, slug, location, date })` on link click.
- **`.env.local`** (created): Stores `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` as environment variables.

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" CTA button on the homepage to scroll to featured events | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view details; captures `title`, `slug`, `location`, and `date` properties | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1601783)
- [Explore Events Button Clicks](/insights/rARaZ2tn) — daily trend of CTA button clicks
- [Event Card Clicks Over Time](/insights/vIKD6SfG) — daily trend of event card interactions
- [Explore to Event Click Funnel](/insights/6iewXwcq) — conversion funnel from Explore button → event card click
- [Most Clicked Events](/insights/kzOwFNwa) — bar chart of event card clicks broken down by event title
- [Unique Visitors Per Day](/insights/DoolkIgc) — daily active users across both tracked events

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
