import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { NotFoundError } from './utils/errors.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Environment Configurations
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Bootstrap Websockets
initSocket(server);

// Security and Logs Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows static uploads to be served to external frontend domains
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to general api endpoints
app.use('/api', apiLimiter);

// Serve uploads folder as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api', messageRoutes); // mount conversation endpoints under /api/conversations (routed in messageRoutes)
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Fallback 404 handler
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
