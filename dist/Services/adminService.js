"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._adminService = void 0;
const user_1 = require("../Interfaces/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRepository_1 = __importDefault(require("../Repository/userRepository"));
const emailService_1 = __importDefault(require("./emailService"));
dotenv_1.default.config();
class _adminService {
    constructor(_userRepository, _emailService) {
        this._userRepository = _userRepository;
        this._emailService = _emailService;
    }
    async login(email, password) {
        try {
            const admin = await this._userRepository.findUserByEmail(email);
            if (!admin || admin.role !== user_1.userRole.ADMIN) {
                throw new Error("Invalid credentials");
            }
            const passwordMatch = await bcrypt_1.default.compare(password, admin.password);
            if (!passwordMatch) {
                throw new Error("Invalid credentials");
            }
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined");
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error("REFRESH_TOKEN_SECRET is not defined");
            }
            const refreshToken = jsonwebtoken_1.default.sign({ userId: admin._id, role: admin.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            return {
                accessToken,
                refreshToken,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                isActive: admin.is_active ?? true,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getPatients() {
        try {
            const users = await this._userRepository.findAllUsers();
            const patients = users.filter((user) => user.role === "patient");
            return patients;
        }
        catch (error) {
            console.error("Error fetching patients:", error);
            throw error;
        }
    }
    async togglePatientStatus(id, is_active) {
        try {
            const user = await this._userRepository.findUserById(id);
            if (!user) {
                throw new Error("user not found");
            }
            if (user.role !== user_1.userRole.PATIENT) {
                throw new Error("user is not a patient");
            }
            const updatedUser = await this._userRepository.updateUserStatus(id, is_active);
            return updatedUser;
        }
        catch (error) {
            console.error("Error toggling patient status:", error);
            throw error;
        }
    }
    async getVerifyDoctors() {
        try {
            return await this._userRepository.findAllVerifyDoctors();
        }
        catch (error) {
            console.error("Error fetching doctors:", error);
            throw error;
        }
    }
    async getDoctors() {
        try {
            return await this._userRepository.findAllDoctors();
        }
        catch (error) {
            console.error("Error fetching doctor", error);
            throw error;
        }
    }
    async rejectDoctor(id, reason) {
        try {
            const doctor = await this._userRepository.findUserById(id);
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            if (doctor.role !== user_1.userRole.DOCTOR) {
                throw new Error("user is not a doctor");
            }
            // Send rejection email
            await this._emailService.sendRejectionEmail(doctor.email, reason);
            // Remove doctor from the database
            await this._userRepository.removeUser(id);
        }
        catch (error) {
            console.error("Error rejecting doctor:", error);
            throw error;
        }
    }
    async toggleDoctorStatus(id) {
        try {
            const user = await this._userRepository.findUserById(id);
            if (!user) {
                throw new Error("user not found");
            }
            if (user.role !== user_1.userRole.DOCTOR) {
                throw new Error("user is not a doctor");
            }
            const newStatus = !user.is_active;
            return await this._userRepository.updateUserStatus(id, newStatus);
        }
        catch (error) {
            console.error("Error toggling doctor status:", error);
            throw error;
        }
    }
    async verifyDoctor(id) {
        try {
            const user = await this._userRepository.findUserById(id);
            if (!user) {
                throw new Error("user not found");
            }
            if (user.role !== user_1.userRole.DOCTOR) {
                throw new Error("user is not a doctor");
            }
            const is_verified = true; // Always set to true when approving
            const updatedUser = await this._userRepository.updateDoctorVerification(id, is_verified);
            if (updatedUser && is_verified) {
                // Send approval email
                await this._emailService.sendApprovalEmail(updatedUser.email);
            }
            return updatedUser;
        }
        catch (error) {
            console.error("Error verifying doctor:", error);
            throw error;
        }
    }
    async getDashboardMetrics() {
        try {
            const stats = await this._userRepository.getDashboardStats();
            console.log(stats, 'is the stats is comming or not');
            return stats;
        }
        catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }
    async getAppointmentChartStats(timeRange) {
        try {
            return await this._userRepository.getAppointmentChartStats(timeRange);
        }
        catch (error) {
            console.error('Error fetching appointment chart stats:', error);
            throw error;
        }
    }
    async getReviews() {
        try {
            const reviews = await this._userRepository.getAllReviews();
            console.log('review is comming or not ', reviews);
            return reviews;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error fetching reviews');
        }
    }
}
exports._adminService = _adminService;
exports.default = new _adminService(userRepository_1.default, emailService_1.default);
