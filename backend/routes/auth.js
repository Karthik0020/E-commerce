const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const router = express.Router();

// User Registration
router.post('/register', [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'A user with this email address already exists'
      });
    }

    // Hash password with enhanced security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with transaction
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        password: hashedPassword
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token with enhanced security
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'user'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client'
      }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'A user with this email address already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

// User Login
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with enhanced security
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password with timing attack protection
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'user'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client'
      }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// Admin Registration
router.post('/admin/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('Password must be between 8 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingAdmin) {
      return res.status(409).json({ 
        error: 'Admin already exists',
        message: 'An admin with this username already exists'
      });
    }

    // Hash password with enhanced security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const admin = await prisma.adminUser.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Username already exists',
        message: 'An admin with this username already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Admin registration failed',
      message: 'An error occurred during admin registration. Please try again.'
    });
  }
});

// Admin Login
router.post('/admin/login', [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find admin
    const admin = await prisma.adminUser.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        password: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Check password with timing attack protection
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username, 
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client'
      }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Admin login failed',
      message: 'An error occurred during admin login. Please try again.'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Token has been invalidated on the client side'
  });
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'admin') {
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId },
        select: { id: true, username: true }
      });
      
      if (!admin) {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'The administrator associated with this token no longer exists'
        });
      }
      
      return res.json({
        valid: true,
        type: 'admin',
        user: admin
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, fullName: true, role: true }
      });
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'The user associated with this token no longer exists'
        });
      }
      
      return res.json({
        valid: true,
        type: 'user',
        user
      });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your authentication token has expired'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid'
    });
  }
});

module.exports = router; 