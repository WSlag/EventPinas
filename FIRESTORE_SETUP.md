# Firestore Setup For Manage Console

## 1) Enable Firebase Config
1. Copy `.env.example` to `.env.local`.
2. Set all `VITE_FIREBASE_*` values from Firebase Project Settings.
3. Restart the dev server.

## 2) Deploy Firestore Rules + Indexes
1. Install Firebase CLI (`npm i -g firebase-tools`) if needed.
2. Login: `firebase login`
3. Select project: `firebase use <project-id>`
4. Deploy:
   - `firebase deploy --only firestore:rules`
   - `firebase deploy --only firestore:indexes`

## 3) Data Model Used By Manage Console
- `organizers/{uid}/manage/meta`
- `organizers/{uid}/events/{eventId}`
- `organizers/{uid}/events/{eventId}/guests/data`
- `organizers/{uid}/events/{eventId}/scanOutcomes/data`
- `organizers/{uid}/events/{eventId}/planner/data`
- `organizers/{uid}/events/{eventId}/registration/data`
- `organizers/{uid}/events/{eventId}/onsite/data`
- `organizers/{uid}/events/{eventId}/audit/data`
- `organizers/{uid}/events/{eventId}/staff/data`
- `organizers/{uid}/events/{eventId}/incidents/data`
- `organizers/{uid}/events/{eventId}/waitlist/data`
- `organizers/{uid}/events/{eventId}/checkins/data`

## 4) Runtime Behavior
- When Firebase is configured, manage state runs in `firestore` mode with local fallback.
- Local state is still persisted to `localStorage`.
- Firestore sync is debounced and resilient to sync errors.
- If Firebase is not configured, manage state runs in `localStorage` mode.
