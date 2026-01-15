# API Module

Frontend API client for communicating with the QuakePath backend server.

## Usage

### Basic Example

```typescript
import { sendLocationToBackend, extractLocationFromMeshMessage } from '@/api';

// Extract location from mesh message
const meshMessage = {
  type: 'location',
  sender: 'device-123',
  data: {
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10.5,
    },
  },
  timestamp: new Date().toISOString(),
};

const locationData = extractLocationFromMeshMessage(meshMessage);
if (locationData) {
  const result = await sendLocationToBackend(locationData);
  if (result.success) {
    console.log('Location saved:', result.data);
  } else {
    console.error('Error:', result.error);
  }
}
```

### Integration with Mesh Network

You can integrate the API with your mesh network hook to automatically send location data:

```typescript
import { useMeshNetwork } from '@/hooks/useMeshNetwork';
import { extractLocationFromMeshMessage, sendLocationToBackend } from '@/api';
import { useEffect } from 'react';

function MyComponent() {
  const { onMessage } = useMeshNetwork();

  useEffect(() => {
    const unsubscribe = onMessage(async (message) => {
      // Check if message is a location message
      if (message.type === 'location') {
        const locationData = extractLocationFromMeshMessage(message);
        if (locationData) {
          // Send to backend
          const result = await sendLocationToBackend(locationData);
          if (result.success) {
            console.log('Location saved to database');
          } else {
            console.error('Failed to save location:', result.error);
          }
        }
      }
    });

    return unsubscribe;
  }, [onMessage]);

  return null;
}
```

## API Functions

### `sendLocationToBackend(locationData: LocationData)`

Sends location data to the backend server to be saved in PostgreSQL.

**Parameters:**
- `locationData`: Location data object with deviceId, latitude, longitude, etc.

**Returns:**
- Promise resolving to `ApiResponse<LocationResponse>`

### `getDeviceLocations(deviceId: string, limit?: number)`

Fetches recent locations for a specific device.

**Parameters:**
- `deviceId`: Device identifier
- `limit`: Maximum number of locations to return (default: 50)

**Returns:**
- Promise resolving to `ApiResponse<LocationResponse[]>`

### `getRecentLocations(limit?: number)`

Fetches recent locations from all devices.

**Parameters:**
- `limit`: Maximum number of locations to return (default: 100)

**Returns:**
- Promise resolving to `ApiResponse<LocationResponse[]>`

### `extractLocationFromMeshMessage(meshMessage: any)`

Helper function to extract location data from a mesh network message.

**Parameters:**
- `meshMessage`: Message object from mesh network

**Returns:**
- `LocationData | null` - Location data if message contains valid location, null otherwise

## Configuration

Set the API base URL using environment variables:

- `EXPO_PUBLIC_API_URL`: Public API URL (for Expo apps)
- `API_URL`: Alternative API URL
- Default: `http://localhost:3000`

## Types

### LocationData

```typescript
interface LocationData {
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
  metadata?: {
    platform?: string;
    version?: string | number;
    messageId?: string;
    sender?: string;
  };
}
```

### LocationResponse

```typescript
interface LocationResponse {
  id: number;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: string;
  createdAt: string;
  metadata: Record<string, any> | null;
}
```
