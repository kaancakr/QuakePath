# API and Database Setup Guide

This document describes the API folder and backend setup for storing mesh network location data in PostgreSQL.

## What Was Created

### Frontend API (`/api` folder)

1. **`api/config.ts`** - API configuration and endpoints
2. **`api/types.ts`** - TypeScript type definitions
3. **`api/locationApi.ts`** - API client functions for location data
4. **`api/index.ts`** - Main export file
5. **`api/example-integration.ts`** - Example integration with mesh network
6. **`api/README.md`** - API documentation

### Backend Server (`/server/src` folder)

1. **`server/src/db/connection.js`** - PostgreSQL database connection pool
2. **`server/src/db/schema.js`** - Database schema initialization
3. **`server/src/db/locationRepository.js`** - Database operations for locations
4. **`server/src/index.js`** - Updated with location API endpoints and mesh message handling
5. **`server/package.json`** - Added `pg` (PostgreSQL) dependency
6. **`server/README.md`** - Server documentation

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

This will install the `pg` package for PostgreSQL connectivity.

### 2. Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running, then create the database:

```sql
CREATE DATABASE quakepath;
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
# Create .env file (you may need to manually create this)
```

Add the following configuration:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quakepath
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3000
```

### 4. Start the Server

```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

The server will automatically:
- Connect to PostgreSQL
- Create the database schema (tables and indexes)
- Start listening on port 3000 (or your configured PORT)

### 5. Configure Frontend API URL

In your frontend code, you can set the API URL using environment variables:

- Create a `.env` file in the project root (for Expo)
- Set `EXPO_PUBLIC_API_URL=http://your-server-ip:3000`
- Or modify `api/config.ts` to use your server URL

## How It Works

### Automatic Location Saving

When a mesh network device sends a location message, the server automatically:

1. Receives the message via Socket.IO (`meshMessage` event)
2. Detects if it's a location message (`type === 'location'`)
3. Extracts location data from the message
4. Saves it to PostgreSQL database
5. Continues normal mesh message forwarding

### Manual API Calls

You can also manually send location data from the frontend:

```typescript
import { sendLocationToBackend } from '@/api';

const result = await sendLocationToBackend({
  deviceId: 'device-123',
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10.5,
  timestamp: new Date().toISOString(),
});
```

### Querying Locations

```typescript
import { getDeviceLocations, getRecentLocations } from '@/api';

// Get locations for a specific device
const deviceLocations = await getDeviceLocations('device-123', 50);

// Get recent locations from all devices
const recentLocations = await getRecentLocations(100);
```

## API Endpoints

### POST `/api/locations`

Save location data to database.

**Request:**
```json
{
  "deviceId": "device-123",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5,
  "altitude": 5.2,
  "heading": 90.0,
  "speed": 0.0,
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {}
}
```

### GET `/api/locations/device/:deviceId?limit=50`

Get locations for a specific device.

### GET `/api/locations/recent?limit=100`

Get recent locations from all devices.

## Database Schema

The `user_locations` table stores:

- `id` - Primary key
- `device_id` - Device identifier
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `accuracy` - Location accuracy (meters)
- `altitude` - Altitude (meters)
- `heading` - Direction (degrees)
- `speed` - Speed (m/s)
- `timestamp` - Location timestamp
- `metadata` - Additional JSON data
- `created_at` - Record creation time

Indexes are created on:
- `device_id`
- `timestamp`
- `created_at`
- Composite: `(device_id, timestamp)`

## Integration Example

See `api/example-integration.ts` for a complete example of integrating the API with the mesh network hook.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -l | grep quakepath`

### Schema Creation Issues

- Check server logs for error messages
- Verify database user has CREATE TABLE permissions
- Manually run schema creation if needed

### API Connection Issues

- Verify server is running and accessible
- Check CORS settings if calling from web browser
- Verify API_BASE_URL in frontend configuration

## Next Steps

1. Set up your PostgreSQL database
2. Configure environment variables
3. Start the server
4. Test API endpoints
5. Integrate with your mesh network code
6. Monitor location data in the database

For more details, see:
- `api/README.md` - Frontend API documentation
- `server/README.md` - Backend server documentation
