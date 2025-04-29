
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../Model/userModel'; 

interface JwtPayload {
  role: string;
  _id: string; 
  [key: string]: any;
}

const auth = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }
    
    console.log('Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      res.status(401).json({ message: 'Please login to continue' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      console.log('Decoded token:', decoded);
      
      // Check if user has required role
      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({ message: 'Access denied: insufficient permissions' });
        return;
      }
      
      // Get user from database to check current is_active status
      const user = await UserModel.findById(decoded.userId);
      console.log(user,'the user is coming or not')
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Check if user is active in the database
      if (!user.is_active) {
        res.status(403).json({ message: 'Your account has been blocked' });
        return;
      }
      
      // Attach user info to the request for use in route handlers
      req.user = decoded;
      
      next();
      
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ 
          message: 'Token expired',
          tokenExpired: true 
        });
        return;
      }
      
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

// Add TypeScript extension to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Create middleware for each role
export const userAuth = auth(['patient']);
export const doctorAuth = auth(['doctor']);
export const adminAuth = auth(['admin']);