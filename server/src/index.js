const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Database imports
const { initializeSchema } = require('./db/schema');
const locationRepository = require('./db/locationRepository');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected devices
const connectedDevices = new Map();

// Initialize database schema on startup
initializeSchema().catch((error) => {
  console.error('[Server] Failed to initialize database schema:', error);
  // Continue running even if schema initialization fails
  // This allows the server to start and handle other requests
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New device connected:', socket.id);

  // Handle device registration
  socket.on('register', (deviceInfo) => {
    console.log('Device registered:', { id: socket.id, ...deviceInfo });
    connectedDevices.set(socket.id, {
      id: socket.id,
      ...deviceInfo,
      lastSeen: new Date(),
      status: 'online'
    });
    
    // Broadcast updated device list to admin
    const devicesList = Array.from(connectedDevices.values());
    console.log('Broadcasting devices update:', devicesList);
    io.emit('devicesUpdate', devicesList);
  });

  // Handle device heartbeat
  socket.on('heartbeat', () => {
    const device = connectedDevices.get(socket.id);
    if (device) {
      device.lastSeen = new Date();
      connectedDevices.set(socket.id, device);
      console.log('Device heartbeat:', socket.id);
      io.emit('devicesUpdate', Array.from(connectedDevices.values()));
    }
  });

  // Handle device disconnection
  socket.on('disconnect', () => {
    console.log('Device disconnected:', socket.id);
    connectedDevices.delete(socket.id);
    io.emit('devicesUpdate', Array.from(connectedDevices.values()));
  });

  // Handle mesh network messages
  socket.on('meshMessage', async (data, callback) => {
    try {
      console.log('Mesh message received:', {
        from: socket.id,
        data: data
      });

      // Handle location messages - save to database
      if (data.type === 'location' && data.data) {
        try {
          const location = data.data.location || data.data;
          if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
            const locationData = {
              deviceId: data.sender || socket.id,
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy || null,
              altitude: location.altitude || null,
              heading: location.heading || null,
              speed: location.speed || null,
              timestamp: data.timestamp || new Date().toISOString(),
              metadata: {
                platform: data.deviceInfo?.platform,
                version: data.deviceInfo?.version,
                messageId: data.id,
                sender: data.sender,
              },
            };

            await locationRepository.createLocation(locationData);
            console.log('[Server] Location saved to database:', locationData.deviceId);
          }
        } catch (dbError) {
          console.error('[Server] Error saving location to database:', dbError);
          // Continue processing the message even if database save fails
        }
      }

      // Check if this is a new format message (has type and content)
      if (data.type && data.content) {
        // New mesh message format
        const message = {
          ...data,
          sender: socket.id,
          timestamp: data.timestamp || new Date().toISOString(),
        };

        // If recipient is specified, send to that device only
        if (data.recipient && data.recipient !== socket.id) {
          const recipientSocket = io.sockets.sockets.get(data.recipient);
          if (recipientSocket) {
            console.log(`Sending message to specific device: ${data.recipient}`);
            recipientSocket.emit('meshMessage', message);
          } else {
            console.warn(`Recipient device not found: ${data.recipient}`);
            if (callback) {
              callback(new Error('Recipient device not found'));
            }
            return;
          }
        } else {
          // Broadcast to all devices except sender
          console.log('Broadcasting message to all devices');
          socket.broadcast.emit('meshMessage', message);
        }
      } else {
        // Legacy emergency alert format
        const broadcastData = {
          sender: socket.id,
          data: data
        };
        console.log('Broadcasting emergency alert (legacy format):', broadcastData);
        socket.broadcast.emit('meshMessage', broadcastData);
      }

      // Send acknowledgment back to sender
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Error handling mesh message:', error);
      if (callback) {
        callback(error);
      }
    }
  });
});

// API endpoints

// Get connected devices
app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.values());
  console.log('API: Getting devices list:', devices);
  res.json(devices);
});

// POST /api/locations - Save location from mesh network
app.post('/api/locations', async (req, res) => {
  try {
    const {
      deviceId,
      userId,
      userRole,
      latitude,
      longitude,
      accuracy,
      altitude,
      heading,
      speed,
      timestamp,
      metadata,
    } = req.body;

    // Validate required fields
    if (!deviceId || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'deviceId, latitude, and longitude are required',
      });
    }

    // Validate latitude and longitude ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid latitude or longitude values',
      });
    }

    const locationData = {
      deviceId,
      userId: userId || null,
      userRole: userRole || null,
      latitude,
      longitude,
      accuracy: accuracy || null,
      altitude: altitude || null,
      heading: heading || null,
      speed: speed || null,
      timestamp: timestamp || new Date().toISOString(),
      metadata: metadata || null,
    };

    const location = await locationRepository.createLocation(locationData);
    
    console.log('[API] Location saved:', location.id);
    res.status(201).json(location);
  } catch (error) {
    console.error('[API] Error saving location:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to save location',
    });
  }
});

// GET /api/locations/device/:deviceId - Get locations for a specific device
app.get('/api/locations/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    if (limit > 1000) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Limit cannot exceed 1000',
      });
    }

    const locations = await locationRepository.getLocationsByDevice(deviceId, limit);
    res.json(locations);
  } catch (error) {
    console.error('[API] Error fetching device locations:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch locations',
    });
  }
});

// GET /api/locations/recent - Get recent locations from all devices
app.get('/api/locations/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;

    if (limit > 1000) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Limit cannot exceed 1000',
      });
    }

    const locations = await locationRepository.getRecentLocations(limit);
    res.json(locations);
  } catch (error) {
    console.error('[API] Error fetching recent locations:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch recent locations',
    });
  }
});

// GET /api/locations/civilians - Get civilian locations (for rescue teams)
app.get('/api/locations/civilians', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 1000;
    const latestOnly = req.query.latestOnly === 'true';

    if (limit > 5000) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Limit cannot exceed 5000',
      });
    }

    let locations;
    if (latestOnly) {
      // Get latest location per user (for map markers)
      locations = await locationRepository.getLatestLocationsByUser(limit);
    } else {
      // Get all civilian locations
      locations = await locationRepository.getCivilianLocations(limit);
    }

    res.json(locations);
  } catch (error) {
    console.error('[API] Error fetching civilian locations:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch civilian locations',
    });
  }
});

// Serve admin console
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://92.44.28.45:${PORT}`);
  console.log(`Admin console available at: http://92.44.28.45:${PORT}/admin`);
  console.log(`Static files being served from: ${path.join(__dirname, 'public')}`);
}); 