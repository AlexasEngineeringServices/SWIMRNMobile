# Shared Dashboard Feature

## Overview

This feature provides a public, web-only dashboard that allows non-authenticated users to view device readings and usage history through a shareable link.

## Files Created

### 1. `/app/shared-dashboard.tsx`

- **Purpose**: Public dashboard for viewing all device readings
- **Access**: Web only, no authentication required
- **Features**:
  - Displays all devices and their latest readings
  - Shows device cards with swipe functionality
  - Includes instructional dialog for first-time users
  - "View Only" label to indicate public access

### 2. `/app/shared-usage-history.tsx`

- **Purpose**: Public page for viewing detailed device usage history
- **Access**: Web only, no authentication required
- **Features**:
  - Displays historical data for a specific device
  - Filter by Daily, Weekly, or Monthly views
  - Shows round/slim bottle counts and void counts
  - Pull-to-refresh functionality

### 3. `/components/SharedDeviceCardContainer.tsx`

- **Purpose**: Reusable component for shared device cards
- **Features**:
  - Displays device information
  - Handles swipe gesture to navigate to usage history
  - Uses the same visual design as authenticated version

### 4. `/utils/platform.ts`

- **Purpose**: Platform detection utilities
- **Exports**:
  - `isWeb`: Boolean indicating if running on web
  - `isMobile`: Boolean indicating if running on iOS or Android

## Web Access Control

### Authenticated Pages (Blocked on Web)

The following pages are **blocked from web access** and show a "Web Access Not Available" message:

- `/auth` - Sign in and registration
- `/(tabs)/index` - Main dashboard (authenticated)
- `/(tabs)/devices` - Device management
- `/(tabs)/profile` - User profile
- `/usage-history` - Usage history (authenticated version)

### Pages Available on Web

The following pages remain accessible on web:

- `/shared-dashboard` - Public dashboard (main shareable link)
- `/shared-usage-history` - Public usage history
- `/reset-password` - Password reset (from email links)
- `/verify-email` - Email verification (from email links)

## Usage

### Sharing the Dashboard

To share the dashboard with non-authenticated users:

1. Deploy your app to web
2. Share the URL: `https://your-domain.com/shared-dashboard`
3. Users can view all device readings without signing in
4. Users can swipe device cards right to see detailed history

### Navigation Flow

```
/shared-dashboard
  └─> (swipe device card right)
      └─> /shared-usage-history?deviceId=device-XXX
```

## Implementation Details

### RouteGuard Enhancement

The `RouteGuard` component has been updated to:

- Detect web platform using `Platform.OS === 'web'`
- Display a user-friendly message blocking access on web
- Redirect mobile users to authentication if not signed in

### Platform Detection

All authenticated pages now check for web access:

```typescript
if (Platform.OS === 'web') {
  return <WebBlockedMessage />;
}
```

### Data Fetching

Both shared pages fetch data directly from Azure services:

- No authentication required
- Uses the same `fetchAzureData()` function
- Public read-only access to device readings

## Security Considerations

- Shared dashboard provides **read-only** access
- No user authentication or session management
- No ability to modify device settings or data
- Suitable for public monitoring and transparency

## Future Enhancements

Possible improvements:

- Add device-specific shareable links (e.g., `/shared-dashboard?device=001`)
- Implement link expiration or access tokens
- Add analytics to track shared link views
- Custom branding for shared views
- Export data to CSV/PDF from shared view
