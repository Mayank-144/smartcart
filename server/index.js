import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import searchRouter from './routes/search.js';
import { getExtractor } from './utils/embeddings.js';

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
const clientDistPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../client/dist'
);
const clientIndexPath = path.join(clientDistPath, 'index.html');

// CORS configuration - allow local Vite dev, Render, and Vercel URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

if (existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));
}

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

if (existsSync(clientIndexPath)) {
  app.get('*', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(clientIndexPath, (err) => {
      if (err) next(err);
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Prevent transient async/network errors from crashing the server process
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err);
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
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    }
  }

  // Pre-warm the embedding model once at startup
  getExtractor().catch((err) => {
    console.error('⚠️  Model pre-warm failed (will retry on first search):', err.message);
  });

  app.listen(PORT, () => {
    console.log(`🚀 SmartCart server is running on http://localhost:${PORT}`);
  });
}

startServer();

