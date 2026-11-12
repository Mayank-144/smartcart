import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import searchRouter from './routes/search.js';

// Configure reliable DNS servers to ensure Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // fallback to system default if restricted
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// CORS configuration - allow Vite frontend on port 5173
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SmartCart API',
    status: 'online',
    version: '1.0.0',
    endpoints: ['/api/search?q=<query>', '/api/product/:id/related'],
  });
});

// Mount Search & Recommendation Routes
app.use('/api', searchRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Database connection & Server initialization
async function startServer() {
  if (!MONGODB_URI) {
    console.warn(
      '⚠️  MONGODB_URI is not set in server/.env. Please configure your Atlas URI before performing searches.'
    );
  } else {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 SmartCart server is running on http://localhost:${PORT}`);
  });
}

startServer();

