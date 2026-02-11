# Specification

## Summary
**Goal:** Restore admin dashboard access after redeploys by allowing the currently logged-in Internet Identity principal to bootstrap itself into the admin allowlist when no admins are configured.

**Planned changes:**
- Add a backend shared update method (e.g., `bootstrapAdmin` / `claimAdminForCaller`) that adds `caller` to the admin allowlist used by `isCallerAdmin()`, but only if there are zero admins configured (or if `caller` is already an admin); otherwise return a clear error/trap message.
- Add a frontend bootstrap flow that, after a successful Internet Identity login, calls the new backend method when the user is not (or not yet known to be) an admin, then invalidates/refetches the `['isCallerAdmin']` query so admin-gated UI updates immediately.
- Show an English, user-friendly message when the bootstrap attempt fails because an admin already exists, explaining that an existing admin must grant access.

**User-visible outcome:** After logging in with Internet Identity, the first user to access the app after a redeploy can automatically become admin (when no admins exist) and immediately access the admin dashboard without a manual refresh; non-admin users see a clear message if an admin already exists.
