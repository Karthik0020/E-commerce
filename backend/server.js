const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import database connection
const prisma = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Enhanced logging middleware
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => console.log(message.trim())
  }
}));

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // Skip health check
});

app.use('/api/', limiter);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.29.3:8000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

// Body parsing middleware with enhanced limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation middleware
app.use((req, res, next) => {
  // Add request ID for tracking
  req.id = Math.random().toString(36).substr(2, 9);
  
  // Log request details in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📥 ${req.method} ${req.path} - ID: ${req.id}`);
  }
  
  next();
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'OK', 
      message: 'E-commerce API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes with error handling
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(`❌ Error [${req.id}]:`, err);
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Record not found',
      message: 'The requested record was not found'
    });
  }
  
  if (err.code === 'P2003') {
    return res.status(400).json({ 
      error: 'Foreign key constraint',
      message: 'Cannot perform this operation due to data relationships'
    });
  }
  
  if (err.code === 'P2014') {
    return res.status(400).json({ 
      error: 'Invalid ID',
      message: 'The provided ID is invalid'
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong';
  
  res.status(statusCode).json({ 
    error: 'Internal server error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/products',
      '/api/cart',
      '/api/wishlist',
      '/api/orders'
    ]
  });
});

// Enhanced server startup
const startServer = async () => {
  try {
    // Test database connection before starting server
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`📊 Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes`);
      console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
    });
    
    // Enhanced graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🔄 ${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        try {
          await prisma.$disconnect();
          console.log('✅ Database disconnected');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; 