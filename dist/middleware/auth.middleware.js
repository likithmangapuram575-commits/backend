"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.requireFaculty = exports.requireAdmin = exports.requireSuperAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access Denied: No Token Provided' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123', (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Invalid Token' });
            return;
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const requireSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SuperAdmin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Access Denied: Requires Super Admin Role' });
    }
};
exports.requireSuperAdmin = requireSuperAdmin;
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'HOD')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Access Denied: Requires Admin Role' });
    }
};
exports.requireAdmin = requireAdmin;
const requireFaculty = (req, res, next) => {
    if (req.user && (req.user.role === 'Faculty' || req.user.role === 'HOD' || req.user.role === 'SuperAdmin')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Access Denied: Requires Faculty Role' });
    }
};
exports.requireFaculty = requireFaculty;
const authorize = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403).json({ message: `Access Denied: Requires one of [${roles.join(', ')}] roles` });
        }
    };
};
exports.authorize = authorize;
