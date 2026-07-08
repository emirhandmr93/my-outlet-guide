# Create Trip Phase 1A Policy

Create Trip Phase 1A is a final, production-backed feature, not a mock planner.

## Persistence

Authenticated users save trips in Firestore at:

```text
userTrips/{userId}/items/{tripId}
```

Each trip stores the authenticated owner, outlet destination, optional visit date, optional notes, creation/update timestamps, and `status: "active"`.

## Authentication

Trip creation, trip listing, and trip deletion require a signed-in Firebase Auth user. Logged-out users are routed to sign-in before they can create or save a trip.

## Scope

Phase 1A intentionally saves the outlet as a trip destination with optional date and notes. It does not generate itineraries, flights, hotels, fake steps, mock trips, or placeholder travel data.

## Security rules

Firestore rules restrict `userTrips/{userId}/items/{tripId}` reads and writes to the authenticated owner and validate the persisted trip shape.
