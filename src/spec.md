# Specification

## Summary
**Goal:** Restore the full legacy SafeSpace backend API and state durability, and reconnect the frontend so the real application UI works again (including admin-gated areas).

**Planned changes:**
- Restore the legacy backend API surface in `backend/main.mo` for mood tracking, group and private chat, AI companion sessions, user profiles and ID mapping, activity logging, analytics/session tracking, daily/weekly mood analysis and weekly insights, app market flows/metadata/analytics/subscriptions, admin-only operations, and presentation/PDF (blob) storage endpoints used by the Presentation Viewer.
- Add upgrade-safe durable state preservation for all restored backend data using Motoko upgrade hooks/stable storage patterns so data survives canister upgrades.
- Update `runSmokeTest()` in `backend/main.mo` to perform a meaningful end-to-end readiness check across key restored APIs (mood/chat/profile/analytics) for new/empty users.
- Reconnect the frontend by removing the blocking “Backend Restoration Required” screen in `frontend/src/App.tsx` and routing/rendering the existing SafeSpace UI pages (dashboard, mood tracker/history, chats, AI companion, weekly insights, admin analytics dashboard, app market settings, presentation viewer).
- Restore/implement the React Query hooks and backend type bindings needed by existing frontend components (including updates to `frontend/src/hooks/useQueries.ts` and related hook files), ensuring stable query keys, correct types, and hooks disabled until the backend actor is ready.

**User-visible outcome:** The app loads into the normal SafeSpace experience (for guests and Internet Identity users) with working mood tracking/history, chats, AI sessions, weekly insights, and restored admin-only pages that enforce access control; previously created data persists across upgrades.
