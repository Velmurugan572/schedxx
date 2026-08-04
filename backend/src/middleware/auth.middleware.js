// ==========================================
// Authentication Middleware (auth.middleware.js)
// Verifies JWT token and mounts req.user
// ==========================================

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../errors/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extract Bearer Token from Authorization headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please provide an authentication token.', 401));
  }

  // 2. Cryptographically verify access token
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your authentication session has expired. Please refresh your token.', 401));
    }
    return next(new AppError('Invalid authentication token payload.', 401));
  }

  // 3. Confirm user still exists in database
  const user = await UserRepository.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this session token no longer exists.', 401));
  }

  // 4. Attach user context to request
  req.user = user;
  next();
});

export default protect;
