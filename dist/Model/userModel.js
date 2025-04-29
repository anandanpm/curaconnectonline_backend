"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const user_1 = require("../Interfaces/user");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, default: null },
    password: { type: String, required: false },
    age: { type: String, default: null },
    profile_pic: { type: String, default: null },
    is_active: { type: Boolean, default: false },
    gender: { type: String, default: null },
    address: { type: String, default: null },
    role: { type: String, enum: Object.values(user_1.UserRole), default: user_1.UserRole.PATIENT },
    location: { type: String, default: null },
    clinic_name: { type: String, default: null },
    about: { type: String, default: null },
    verified: { type: Boolean, default: false },
    education: { type: String, default: null },
    experience: { type: String, default: null },
    medical_license: { type: String, default: null },
    department: { type: String, default: null },
    certification: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    otp: { type: String || null },
    otp_expiration: { type: Date || null },
});
const UserModel = mongoose_1.default.model('User', userSchema);
exports.default = UserModel;
