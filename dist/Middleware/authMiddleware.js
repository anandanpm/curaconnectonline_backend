"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.doctorAuth = exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../Model/userModel"));
const auth = (allowedRoles) => {
    return async (req, res, next) => {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            // Check if user has required role
            if (!allowedRoles.includes(decoded.role)) {
                res.status(403).json({ message: 'Access denied: insufficient permissions' });
                return;
            }
            // Get user from database to check current is_active status
            const user = await userModel_1.default.findById(decoded.userId);
            console.log(user, 'the user is coming or not');
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
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
// Create middleware for each role
exports.userAuth = auth(['patient']);
exports.doctorAuth = auth(['doctor']);
exports.adminAuth = auth(['admin']);
