# Shared Dashboard Feature

## Overview

This feature provides a public, web-only dashboard that allows non-authenticated users to view device readings and usage history through a secure, time-limited shareable link. The link contains an encrypted JWT token that identifies the user's devices and expires after 7 days for security.

## Files Created

### 1. `/app/shared-dashboard/index.tsx`

- **Purpose**: Public dashboard for viewing all device readings
- **Access**: Web only, no authentication required
- **URL Format**: `/shared-dashboard?token={encrypted-jwt-token}`
- **Features**:
  - Decrypts JWT token to identify user and validate expiration
  - Displays all devices belonging to the user
  - Shows device cards with swipe functionality
  - Includes instructional dialog for first-time users
  - "View Only" label to indicate public access
  - Shows error message if link has expired (> 7 days)

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

- `/shared-dashboard?token={jwt}` - Public dashboard (main shareable link with encrypted token)
- `/shared-usage-history?deviceId={id}&userId={jwt}` - Public usage history
- `/reset-password` - Password reset (from email links)
- `/verify-email` - Email verification (from email links)

## Usage

### Sharing the Dashboard

To share the dashboard with non-authenticated users:

1. Deploy your app to web
2. In the mobile app, tap the share icon on the main dashboard
3. This generates a secure URL: `https://your-domain.com/shared-dashboard?token={encrypted-jwt}`
4. Share this URL via email, SMS, or any messaging platform
5. Recipients can view all your device readings without signing in
6. Links expire after 7 days for security
7. Users can swipe device cards right to see detailed history

### Navigation Flow

```
/shared-dashboard?token={jwt}
  └─> (swipe device card right)
      └─> /shared-usage-history?deviceId=device-XXX&userId={jwt}
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
- Uses JWT token to identify which user's devices to display
- Uses the same `fetchAzureData()` function with user ID filter
- Public read-only access to device readings
- Token validation happens on client-side (JWT expiration check)

## Security Considerations

- Shared dashboard provides **read-only** access
- Uses JWT encryption with 7-day expiration
- Links automatically expire after 7 days
- Encrypted token prevents tampering with user IDs
- No user authentication or session management
- No ability to modify device settings or data
- Users can only see devices belonging to the token owner
- Suitable for temporary monitoring and transparency

### Security Implementation

- **JWT Token**: Contains user ID encrypted with HS256 algorithm
- **Expiration**: Tokens expire after 7 days (`exp` claim)
- **Secret Key**: Uses `EXPO_PUBLIC_WEB_SECRET_KEY` from environment variables
- **Validation**: Client-side JWT validation before fetching data
- **Error Handling**: Shows user-friendly message when links expire

## Future Enhancements

Possible improvements:

- ✅ ~~Implement link expiration or access tokens~~ (Implemented with JWT)
- Add device-specific shareable links with device filtering in token
- Server-side token validation for enhanced security
- Add analytics to track shared link views
- Allow users to revoke/regenerate links
- Customizable link expiration time (1 day, 7 days, 30 days)
- Custom branding for shared views
- Export data to CSV/PDF from shared view
- Rate limiting to prevent abuse
