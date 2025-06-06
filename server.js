const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mealswap-15d15.firebaseio.com"
});

const app = express();

// Configure CORS for Express (REST endpoints)
const allowedOrigins = [
  'https://mealswap.netlify.app',  // Production
  'http://localhost:3000',        // React/Vite dev server
  'http://127.0.0.1:5500'         // Live Server (static HTML)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  credentials: true
}));

const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']  // Fallback options
  },
  allowEIO3: true  // Legacy Socket.io client support
});

// Store connected users
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  // Authenticate user
  socket.on('authenticate', (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`Authenticated: ${userId} → ${socket.id}`);
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(connectedUsers).find(key => connectedUsers[key] === socket.id);
    if (userId) {
      delete connectedUsers[userId];
      console.log(`Disconnected: ${userId}`);
    }
  });
});

// Firebase listeners (unchanged)
function setupFirestoreListeners() {
  const db = admin.firestore();
  
  db.collection('messages').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = change.doc.data();
        const recipientId = message.participants.find(id => id !== message.senderId);
        if (connectedUsers[recipientId]) {
          io.to(connectedUsers[recipientId]).emit('newMessage', message);
        }
      }
    });
  });

  // Listings listener
  db.collection('listings').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        const listing = change.doc.data();
        // Notify interested users or the listing owner
        if (listing.userId && connectedUsers[listing.userId]) {
          io.to(connectedUsers[listing.userId]).emit('listingUpdate', listing);
        }
      }
    });
  });

  // Requests listener
  db.collection('requests').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const request = change.doc.data();
        // Notify the listing owner about new requests
        if (request.listingOwnerId && connectedUsers[request.listingOwnerId]) {
          io.to(connectedUsers[request.listingOwnerId]).emit('newRequest', request);
        }
      }
    });
  });
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setupFirestoreListeners();
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
