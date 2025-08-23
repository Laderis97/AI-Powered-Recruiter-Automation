// src/auth.ts
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

// Simple authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated (you can implement your own logic here)
  const isAuthenticated = req.session?.user || req.headers['x-api-key'] === process.env.API_KEY;
  
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

// Optional: Add session management
export function createSession(req: Request, user: User) {
  req.session = req.session || {};
  req.session.user = user;
}

export function destroySession(req: Request) {
  if (req.session) {
    req.session.destroy(() => {});
  }
}
