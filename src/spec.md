# Specification

## Summary
**Goal:** Fix Mood History loading errors for both Internet Identity and guest users, and redesign Mood History views (user-facing and admin drilldown) to add calendar-based navigation plus clearer weekly/monthly/overall trend charts.

**Planned changes:**
- Fix the user-facing Mood History data loading flow so entries load correctly for Internet Identity and guest users, with a retryable error state when the backend is unavailable.
- Update backend authorization/routing so guest users can fetch their own mood history without admin privileges, while keeping admin analytics/user-record endpoints admin-only and preserving existing stored data.
- Redesign the user-facing Mood History UI to keep the existing overall layout while adding a clickable calendar (dates with entries open the existing view/edit flow) and improving weekly chart readability (Mon–Sun labels, mood level color coding, and a trend line).
- Add monthly and overall mood trend charts to Mood History using the already-fetched mood history data, including clear empty states.
- Redesign the admin user drilldown Mood History section to mirror the same calendar + weekly improvements + monthly/overall trend charts while keeping the existing admin drilldown structure and styling conventions.

**User-visible outcome:** Mood History loads reliably in both guest mode and Internet Identity; users and admins can navigate entries via a calendar and see clearer weekly charts plus additional monthly and overall trend summaries, with graceful empty/error states and a working Retry action when needed.
