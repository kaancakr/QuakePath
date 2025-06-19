const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

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
  socket.on('meshMessage', (data, callback) => {
    try {
      // Log the emergency alert
      console.log('Emergency alert received:', {
        from: socket.id,
        data: data
      });

      // Broadcast message to all devices except sender
      const broadcastData = {
        sender: socket.id,
        data: data
      };
      console.log('Broadcasting emergency alert:', broadcastData);
      socket.broadcast.emit('meshMessage', broadcastData);

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
app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.values());
  console.log('API: Getting devices list:', devices);
  res.json(devices);
});

// Serve admin console
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '192.168.68.117', () => {
  console.log(`Server running on http://92.44.28.45:${PORT}`);
  console.log(`Admin console available at: http://92.44.28.45:${PORT}/admin`);
  console.log(`Static files being served from: ${path.join(__dirname, 'public')}`);
}); 