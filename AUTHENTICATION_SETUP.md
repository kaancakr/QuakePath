# Firebase Authentication Setup

This document describes the Firebase authentication system with role-based access control for separating rescue teams and civilians.

## Features

- **Firebase Authentication**: Email/password authentication
- **Role-Based Access**: Two user roles - `civilian` and `rescue_team`
- **Login Screen**: Dedicated login/signup screen with role selection
- **Route Protection**: Automatic redirect to login if not authenticated
- **Rescue Team Dashboard**: Shows civilian location points on map
- **User Profile Management**: User info stored in Firestore

## User Roles

### Civilian
- Default role for regular users
- Can send location data via mesh network
- Location data is saved to database
- Can send emergency alerts

### Rescue Team
- Special role for rescue/emergency personnel
- Can view all civilian locations on map
- Sees location points as markers
- Has access to civilian location data via API

## Setup

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `quakepath-3f8e4`
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password** provider
4. Create Firestore Collection:
   - Go to Firestore Database
   - The `users` collection will be created automatically when users sign up

### 2. Database Schema Update

The PostgreSQL database schema has been updated to include:
- `user_id` (VARCHAR) - Firebase UID
- `user_role` (VARCHAR) - 'civilian' or 'rescue_team'

**Note**: When you restart the server, it will automatically add these columns to the existing table.

### 3. API Endpoints

#### New Endpoint for Rescue Teams:
- **GET** `/api/locations/civilians?latestOnly=true&limit=1000`
  - Returns civilian locations only
  - `latestOnly=true` returns one location per user (for map markers)
  - `latestOnly=false` returns all civilian locations

## Usage

### For Civilians:

1. **Sign Up**:
   - Open the app
   - You'll be redirected to login screen
   - Tap "Sign Up"
   - Select "Civilian" role
   - Enter email and password
   - Account created and logged in automatically

2. **Using the App**:
   - Location syncs automatically every 30 minutes
   - Can send emergency alerts
   - Location data is saved to database with user ID

### For Rescue Teams:

1. **Sign Up**:
   - Open the app
   - Tap "Sign Up"
   - Select "Rescue Team" role
   - Enter email and password
   - Account created and logged in automatically

2. **Viewing Civilian Locations**:
   - Open Dashboard
   - See civilian location points on map (blue markers)
   - Info badge shows count of civilians
   - Locations refresh every 5 minutes
   - Click on markers to see details

## File Structure

### Created Files:
- `context/AuthContext.tsx` - Authentication context and hook
- `app/login.tsx` - Login/signup screen

### Updated Files:
- `app/_layout.tsx` - Added AuthProvider
- `app/index.tsx` - Added route protection
- `app/(drawer)/dashboard/index.tsx` - Added civilian location markers for rescue teams
- `app/(drawer)/settings/index.tsx` - Updated to use auth context
- `hooks/useLocationSync.ts` - Added user ID and role to location data
- `api/types.ts` - Added userId and userRole to LocationData
- `api/locationApi.ts` - Added getCivilianLocations function
- `api/config.ts` - Added civilianLocations endpoint
- `server/src/db/schema.js` - Added user_id and user_role columns
- `server/src/db/locationRepository.js` - Added functions for civilian locations
- `server/src/index.js` - Added civilian locations API endpoint

## Authentication Flow

1. **App Start**:
   - Check if user is authenticated
   - If not → Redirect to `/login`
   - If yes → Redirect to `/(drawer)/dashboard`

2. **Login**:
   - User enters email/password
   - Selects role (Civilian or Rescue Team)
   - Firebase authenticates
   - User profile created in Firestore
   - Redirected to dashboard

3. **Location Sync**:
   - Location data includes `userId` and `userRole`
   - Saved to PostgreSQL database
   - Rescue teams can query civilian locations

## Database Schema

### Firestore Collection: `users`
```typescript
{
  uid: string;           // Firebase UID
  email: string;          // User email
  role: 'civilian' | 'rescue_team';
  displayName?: string;
  createdAt: Timestamp;
}
```

### PostgreSQL Table: `user_locations`
```sql
- id (SERIAL PRIMARY KEY)
- device_id (VARCHAR)
- user_id (VARCHAR)        -- NEW: Firebase UID
- user_role (VARCHAR)      -- NEW: 'civilian' or 'rescue_team'
- latitude (DECIMAL)
- longitude (DECIMAL)
- accuracy (DECIMAL)
- altitude (DECIMAL)
- heading (DECIMAL)
- speed (DECIMAL)
- timestamp (TIMESTAMP)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

## Testing

### Test as Civilian:
1. Sign up with email/password, select "Civilian"
2. Location should sync with your user ID
3. Check database: `SELECT * FROM user_locations WHERE user_role = 'civilian';`

### Test as Rescue Team:
1. Sign up with different email, select "Rescue Team"
2. Open dashboard
3. Should see civilian location markers on map
4. Info badge should show count

## Security Notes

- User roles are stored in Firestore and cannot be changed by users
- Only rescue teams can access `/api/locations/civilians` endpoint
- Location data includes user ID for tracking
- Authentication is handled by Firebase (secure)

## Next Steps

1. **Restart your server** to apply database schema changes
2. **Test login/signup** with different roles
3. **Verify** civilian locations appear for rescue teams
4. **Optional**: Add role-based UI restrictions (e.g., hide certain features for civilians)
