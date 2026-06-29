import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError } from '../utils/errors.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new UnauthorizedError('Authentication token is missing. Please log in first.'));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
    }
    
    // Grant access and store user details on request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid verification token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Your session has expired. Please log in again.'));
    }
    next(error);
  }
};

export const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    // Proceed without adding user details to request
    next();
  }
};

