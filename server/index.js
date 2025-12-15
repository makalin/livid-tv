const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map(); // roomId -> Set of socketIds

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    room.add(socket.id);
    
    const otherUsers = Array.from(room).filter(id => id !== socket.id);
    
    if (otherUsers.length > 0) {
      // Notify existing users about new peer
      socket.to(roomId).emit('user-joined', socket.id);
      // Notify new user about existing peers
      socket.emit('existing-users', otherUsers);
    }
    
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.id,
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.id,
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id,
    });
  });

  socket.on('drawing-data', (data) => {
    socket.to(data.roomId).emit('drawing-data', {
      ...data,
      from: socket.id,
    });
  });

  socket.on('chat-message', (data) => {
    socket.to(data.roomId).emit('chat-message', {
      ...data,
      from: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from all rooms
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        
        if (users.size === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
});

