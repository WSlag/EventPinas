# Firebase Setup Plan (EventPinas)

This setup plan is based on the current codebase and your current Firebase project status (no app registered yet in `eventpinas`).

## 1. Preflight
1. Confirm CLI + project binding:
   - `firebase login`
   - `firebase projects:list`
   - `firebase use eventpinas`
2. Confirm local alias file:
   - `.firebaserc` default should remain `eventpinas`.

## 2. Register The Web App (Required First)
1. In Firebase Console -> Project Settings -> General -> Your apps, click Web (`</>`).
2. App nickname suggestion: `eventpinas-web`.
3. After registration, copy the Web SDK config values.
4. Create `.env.local` from `.env.example` and populate:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (optional for current app behavior)
   - `VITE_FIREBASE_APPCHECK_SITE_KEY` (required to enable App Check tokens from web app)
   - `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` (optional for local dev; set `true` or a specific debug token)
5. Restart dev server after setting env vars.

Notes:
- App only enables Firebase mode when required keys exist (`apiKey`, `authDomain`, `projectId`, `appId`).
- Without complete config, app falls back to local mode.

## 3. Enable Firebase Products Used By The App
1. Authentication:
   - Enable `Email/Password` sign-in provider.
2. Firestore Database:
   - Create Firestore in Production mode.
   - Recommended region for PH users: `asia-southeast1` (cannot be changed later).
3. Storage:
   - Create default Storage bucket.
4. App Check:
   - Register the web app in App Check and select `reCAPTCHA v3`.
   - Copy the site key into `VITE_FIREBASE_APPCHECK_SITE_KEY`.
   - Keep Firestore in `Monitoring` until verified requests are stable, then move to `Enforced`.

## 4. Repo Config Alignment (Important)
1. Ensure `firebase.json` includes Firestore config (add if missing):

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

2. Keep these files as source of truth:
   - `firestore.rules`
   - `firestore.indexes.json`
   - `storage.rules`

## 5. Deploy Security Rules + Indexes
1. Deploy Firestore rules:
   - `firebase deploy --only firestore:rules`
2. Deploy Firestore indexes:
   - `firebase deploy --only firestore:indexes`
3. Deploy Storage rules:
   - `firebase deploy --only storage`

## 6. Data/Access Model Expected By Current Code
Collections and paths currently used:
- User + role:
  - `users/{uid}`
  - Role values drive permissions (`admin`, `organizer`, etc.).
- Manage console:
  - `organizers/{uid}/manage/meta`
  - `organizers/{uid}/events/{eventId}`
  - Subdocs under each event:
    - `guests/data`
    - `scanOutcomes/data`
    - `planner/data`
    - `registration/data`
    - `onsite/data`
    - `audit/data`
    - `staff/data`
    - `incidents/data`
    - `waitlist/data`
    - `checkins/data`
- Public marketplace:
  - `marketplaceEvents/{eventId}`
- Profiles:
  - `supplierProfiles/{profileId}`
  - `organizerProfiles/{profileId}`
- Storage uploads:
  - `marketplaceProfiles/{profileType}/{profileId}/{ownerUid}/{purpose}/{filename}`

## 7. Role Bootstrap Plan
1. Register at least one organizer account through app UI (creates `users/{uid}` profile).
2. Create one admin user for moderation/backfill flows:
   - Set `users/{uid}.role = "admin"` in Firestore for the chosen admin UID.
   - This must be done through privileged tooling (Firebase Console/Admin SDK/script).
   - Client app writes are intentionally blocked from self-assigning `admin` role.
3. Organizer publish rules require:
   - `users/{uid}.role = "organizer"`
   - `ownerUid == request.auth.uid` in `marketplaceEvents` writes.

## 8. Optional Backfill For Public Events
Use the provided script:
- `npm run backfill:marketplace-events`

Backfill prerequisites:
1. Env vars loaded in shell (`VITE_FIREBASE_*`).
2. Signed-in user represented by rules as admin (recommended), because backfill writes `marketplaceEvents` in bulk.

## 9. Verification Checklist
1. Auth:
   - Register and login with Email/Password.
   - Confirm `users/{uid}` document is created.
2. Organizer flows:
   - Create/manage an event.
   - Toggle publish/public state and verify mirror in `marketplaceEvents`.
3. Marketplace queries:
   - `/events` list loads from Firestore.
   - Featured filter behaves via `isFeatured`, `featureStatus`, `featuredRank`.
4. Profile uploads:
   - Upload supplier/organizer image and confirm object path + access rules.
5. Security:
   - Non-owner cannot edit another organizer event/profile.
   - Public read still works for allowed marketplace/profile documents.
6. Automated smoke script:
   - Run `npm run firebase:smoke` after backend deploy.
   - Runs read-only checks for public marketplace/profile queries and private-path denial checks.
   - If indexes are still provisioning, script reports `PENDING` (not failure); re-run after index status is `Enabled`.
7. App Check:
   - In Firebase Console -> App Check, confirm Firestore verified requests are increasing (not stuck at `0%`).
   - Enforce App Check for Firestore only after monitoring looks healthy and web runtime includes site key.

## 10. Deployment Sequence (Recommended)
1. `npm run build`
2. `firebase deploy --only firestore:rules,firestore:indexes,storage`
3. `firebase deploy --only hosting`
4. `npm run firebase:verify:all`
5. In Firebase Auth settings, add hosting domain to Authorized domains if needed.
6. Review App Check metrics; switch Firestore to `Enforced` when verified traffic is healthy.
