# Specification

## Summary
**Goal:** Fix the guest login flow so submitting the “Welcome, Guest” name form reliably enters the authenticated app (dashboard) and the guest session persists.

**Planned changes:**
- Fix guest name submission flow so a valid (non-empty) guest name transitions from login UI to the dashboard without bouncing back to the main login page.
- Ensure guest session state updates propagate immediately across all components using the guest auth hook (including immediate updates on guest login and logout).
- Ensure guest session persistence so a browser refresh after guest login keeps the user in the app.

**User-visible outcome:** Users can choose “Continue as guest,” enter a name on the “Welcome, Guest” screen, and consistently land in the dashboard; the app stays logged in as a guest on refresh and returns to the login screen immediately on guest logout.
