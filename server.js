import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './Routes/authRoutes.js';
import postRoutes from './Routes/postRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Use env variable for prod
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Attach io to app
app.set('io', io);

// API Routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', postRoutes);

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
console.log('📦 Serving frontend from:', path.join(__dirname, 'client/dist'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Start server
const PORT = process.env.PORT || 5000;
const start = () =>{
  try {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("❌ Server failed to start:", err);
}
}
start()

