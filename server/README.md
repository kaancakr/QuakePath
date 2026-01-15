# Mesh Network Server

Backend server for QuakePath mesh network application with PostgreSQL database support.

## Features

- Socket.IO server for real-time mesh network communication
- PostgreSQL database for storing user locations from mesh network
- REST API endpoints for location data
- Admin console for monitoring connected devices

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Make sure PostgreSQL is installed and running. Then create a database:

```sql
CREATE DATABASE quakepath;
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quakepath
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
```

### 4. Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will automatically create the database schema on startup.

## API Endpoints

### POST /api/locations

Save location data from mesh network device.

**Request Body:**
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
  "metadata": {
    "platform": "android",
    "version": "13"
  }
}
```

**Response:**
```json
{
  "id": 1,
  "device_id": "device-123",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "accuracy": "10.5",
  "altitude": "5.2",
  "heading": "90.0",
  "speed": "0.0",
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {...},
  "created_at": "2024-01-01T12:00:00Z"
}
```

### GET /api/locations/device/:deviceId

Get locations for a specific device.

**Query Parameters:**
- `limit` (optional): Maximum number of records (default: 50, max: 1000)

**Example:**
```
GET /api/locations/device/device-123?limit=100
```

### GET /api/locations/recent

Get recent locations from all devices.

**Query Parameters:**
- `limit` (optional): Maximum number of records (default: 100, max: 1000)

**Example:**
```
GET /api/locations/recent?limit=200
```

## Database Schema

The `user_locations` table stores location data with the following structure:

- `id`: Primary key (SERIAL)
- `device_id`: Device identifier (VARCHAR)
- `latitude`: Latitude (DECIMAL)
- `longitude`: Longitude (DECIMAL)
- `accuracy`: Location accuracy in meters (DECIMAL, nullable)
- `altitude`: Altitude in meters (DECIMAL, nullable)
- `heading`: Heading in degrees (DECIMAL, nullable)
- `speed`: Speed in m/s (DECIMAL, nullable)
- `timestamp`: Location timestamp (TIMESTAMP WITH TIME ZONE)
- `metadata`: Additional metadata as JSON (JSONB, nullable)
- `created_at`: Record creation timestamp (TIMESTAMP WITH TIME ZONE)

Indexes are created on:
- `device_id`
- `timestamp`
- `created_at`
- Composite index on `(device_id, timestamp)`

## Socket.IO Events

### Client → Server

- `register`: Register device with server
- `heartbeat`: Send heartbeat to keep connection alive
- `meshMessage`: Send mesh network message (location data is automatically saved)

### Server → Client

- `devicesUpdate`: Broadcast updated device list
- `meshMessage`: Broadcast mesh network message

## Admin Console

Access the admin console at: `http://localhost:3000/admin`

The admin console shows:
- Connected devices
- Device status
- Real-time mesh network activity
