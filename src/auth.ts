// src/auth.ts
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

// Simple authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated via API key header
  const isAuthenticated = req.headers['x-api-key'] === process.env.API_KEY;

  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  next();
}

// Optional: Add user management
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Simple token validation for access control
export function validateAccessToken(token: string): boolean {
  return token === process.env.ACCESS_TOKEN;
}
