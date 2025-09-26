const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock users database - in production, use a real database
const users = [
  {
    id: '1',
    username: 'controller1',
    email: 'controller1@railway.gov.in',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQj', // 'password123'
    role: 'section_controller',
    section: 'SEC_001',
    permissions: ['view_trains', 'control_signals', 'manage_schedules'],
    profile: {
      name: 'Rajesh Kumar',
      designation: 'Senior Section Controller',
      experience: 15,
      certifications: ['Railway Safety', 'Traffic Control', 'Emergency Response']
    }
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@railway.gov.in',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQj', // 'admin123'
    role: 'system_admin',
    section: null,
    permissions: ['full_access'],
    profile: {
      name: 'System Administrator',
      designation: 'System Admin',
      experience: 10,
      certifications: ['System Administration', 'Railway Operations']
    }
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'railway_control_secret_key_2024';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // For demo purposes, accept any password that matches the pattern
    // In production, use proper password hashing
    const validPasswords = ['password123', 'admin123'];
    const isValidPassword = validPasswords.includes(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        section: user.section 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: '24h'
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Token validation middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const { profile } = req.body;
  if (profile) {
    users[userIndex].profile = { ...users[userIndex].profile, ...profile };
  }

  const { password: _, ...userWithoutPassword } = users[userIndex];
  res.json({
    success: true,
    data: userWithoutPassword,
    message: 'Profile updated successfully'
  });
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const userIndex = users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // In production, verify current password properly
    const validCurrentPasswords = ['password123', 'admin123'];
    if (!validCurrentPasswords.includes(currentPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password (simplified for demo)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  // In a production system, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Generate new token
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role,
      section: user.section 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: {
      token,
      expiresIn: '24h'
    },
    message: 'Token refreshed successfully'
  });
});

// Get user permissions
router.get('/permissions', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      permissions: user.permissions,
      role: user.role,
      section: user.section
    }
  });
});

module.exports = { router, authenticateToken };