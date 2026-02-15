# SafeSpace Smoke Test Checklist

This checklist provides repeatable steps to verify that SafeSpace starts up correctly and core navigation works for both guest and Internet Identity users.

## Prerequisites
- Draft or production deployment is running
- Browser with developer console access (for debugging)

## Test 1: Guest Login Flow
1. Open the app in a fresh incognito/private window
2. **Expected:** Login screen appears (not stuck on loading)
3. Click "Continue as Guest"
4. Enter a guest name and optional profession
5. Click "Continue"
6. **Expected:** Dashboard renders with quick actions and empty state messages
7. **Expected:** No infinite loading spinner

## Test 2: Internet Identity Login Flow
1. Open the app in a fresh incognito/private window
2. Click "Login with Internet Identity"
3. Complete Internet Identity authentication
4. If first-time user: Enter name and profession
5. **Expected:** Dashboard renders successfully
6. **Expected:** Header shows user name and profession badge
7. **Expected:** No infinite loading spinner

## Test 3: Navigation to Mood Tracker
1. From dashboard, click "Track Your Mood"
2. **Expected:** Mood Tracker page renders with mood selection grid
3. Click "Back to Dashboard"
4. **Expected:** Returns to dashboard without loading issues

## Test 4: Navigation to Mood History
1. From dashboard, click "View Mood History"
2. **Expected:** Mood History page renders with calendar and charts
3. Click "Back to Dashboard"
4. **Expected:** Returns to dashboard without loading issues

## Test 5: Startup Watchdog (Simulated Delay)
To verify the startup timeout fallback works:
1. Open browser DevTools → Network tab
2. Throttle network to "Slow 3G" or "Offline"
3. Reload the app
4. **Expected:** After ~20 seconds, the "Startup Taking Longer Than Expected" fallback screen appears
5. **Expected:** "Reload" and "Reset & Reload" buttons are functional
6. Restore network and click "Reload"
7. **Expected:** App loads successfully

## Test 6: Startup Error Handling (Simulated Failure)
To verify the startup error state works:
1. Open browser DevTools → Console
2. Temporarily block backend canister requests (e.g., via network filter or by stopping the local replica)
3. Reload the app
4. **Expected:** After query retry attempts, the "Startup Error" screen appears with error details
5. **Expected:** "Retry" button is functional
6. Restore backend connectivity and click "Retry"
7. **Expected:** App loads successfully

## Test 7: Return to Dashboard After Navigation
1. Navigate through multiple views: Dashboard → Mood Tracker → Mood History → Dashboard
2. **Expected:** Each transition is smooth without loading screens
3. **Expected:** Dashboard state is preserved (no re-initialization)

## Success Criteria
- ✅ All tests pass without infinite loading screens
- ✅ Startup timeout fallback appears when startup exceeds 20 seconds
- ✅ Startup error state appears when queries fail, with actionable retry
- ✅ Console logs show error details when startup fails
- ✅ Navigation between views works without getting stuck

## Debugging Tips
- Check browser console for error messages during startup
- Verify backend canister is running and accessible
- Clear browser storage (localStorage/sessionStorage) if issues persist
- Use "Reset & Reload" button in timeout fallback to clear cached state
