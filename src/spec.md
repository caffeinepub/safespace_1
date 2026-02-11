# Specification

## Summary
**Goal:** Roll back the application (frontend and backend) to match version 99 behavior by undoing version 100 changes, especially around admin auto-bootstrap/self-promotion.

**Planned changes:**
- Revert frontend main flows to version 99 behavior (login, navigation, dashboard, and admin access gating).
- Remove/disable the version 100 frontend admin auto-bootstrap/auto-claim logic that runs after Internet Identity login.
- Remove/disable the version 100 backend method that allows the current caller to become an admin, restoring version 99 admin authorization behavior.
- Ensure the full app (frontend + backend) builds successfully after rollback.

**User-visible outcome:** After logging in, the app behaves like version 99: normal navigation/dashboard flows work as before, admin access is gated only by existing admin status checks, and the app no longer attempts to automatically claim/admin-bootstrap after login.
