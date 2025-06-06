const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mealswap-15d15.firebaseio.com"
});

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Listen for authentication
  socket.on('authenticate', (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = Object.keys(connectedUsers).find(key => connectedUsers[key] === socket.id);
    if (userId) {
      delete connectedUsers[userId];
      console.log(`User ${userId} disconnected`);
    }
  });
});

// Firebase Firestore listeners for real-time updates
function setupFirestoreListeners() {
  const db = admin.firestore();
  
  // Listen for new messages
  db.collection('messages').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = change.doc.data();
        notifyUsersAboutMessage(message);
      }
    });
  });
  
  // Listen for new requests
  db.collection('requests').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const request = change.doc.data();
        notifyUsersAboutRequest(request);
      }
    });
  });
  
  // Listen for new listings
  db.collection('listings').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const listing = change.doc.data();
        notifyUsersAboutListing(listing);
      }
    });
  });
}

// Notification helper functions
function notifyUsersAboutMessage(message) {
  const recipientId = message.participants.find(id => id !== message.senderId);
  if (connectedUsers[recipientId]) {
    io.to(connectedUsers[recipientId]).emit('newMessage', {
      senderId: message.senderId,
      text: message.text,
      timestamp: message.timestamp
    });
  }
}

function notifyUsersAboutRequest(request) {
  if (connectedUsers[request.listingOwnerId]) {
    io.to(connectedUsers[request.listingOwnerId]).emit('newRequest', {
      requestId: request.id,
      receiverId: request.receiverId,
      listingId: request.listingId
    });
  }
}

function notifyUsersAboutListing(listing) {
  // For receivers - notify all connected receivers about new listings
  Object.keys(connectedUsers).forEach(userId => {
    // In a real app, you'd check the user's role and location before notifying
    io.to(connectedUsers[userId]).emit('newListing', {
      listingId: listing.id,
      title: listing.title,
      category: listing.category
    });
  });
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setupFirestoreListeners();
});