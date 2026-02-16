# Specification

## Summary
**Goal:** Update SafeSpace UI styling to an aurora-themed background, a glassmorphism login card, and an authenticated-only header that matches the provided visual spec while keeping header nav items as non-functional placeholders.

**Planned changes:**
- Show the top header only when the user is authenticated via Internet Identity; hide it on the unauthenticated login screen and in guest mode.
- Restyle the authenticated header to a solid white strip with: left SafeSpace logo + wordmark, center placeholder nav (Home pill + other icon+label items), and right-side profile/alien icons plus an outlined Logout button.
- Ensure header center nav items are visual placeholders only and do not change route/page when clicked.
- Implement the SafeSpace aurora background using CSS gradients/effects with subtle animation (no static/generated background image).
- Update the unauthenticated login screen to a centered frosted/glass card with glow, specified logo/title/subtitle, primary gradient “Login with Internet Identity” button (with sparkle icon), OR divider, secondary guest button with glowing purple outline, and a Terms/Privacy checkbox gating II login with corrected English phrasing.
- Add a decorative bottom-left partially visible translucent purple circle with a user silhouette on the login screen (non-interactive).
- Use existing SafeSpace logo image assets via the BrandLogo component from `/assets/generated/safespace-logo.dim_64x64.png` and `/assets/generated/safespace-logo.dim_256x256.png` (static frontend assets only).

**User-visible outcome:** Unauthenticated users see an aurora background with a glass login card (and no header); guest users browse without any header; authenticated users see a sticky white SafeSpace header matching the provided design, with placeholder nav items that do not navigate and a working Logout.
