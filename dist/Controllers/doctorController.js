"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorController = void 0;
const doctorService_1 = require("../Services/doctorService");
const userRepository_1 = require("../Repository/userRepository");
const slotRepository_1 = require("../Repository/slotRepository");
const otpService_1 = require("../Services/otpService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class DoctorController {
    constructor(DoctorService) {
        this.DoctorService = DoctorService;
    }
    async getOtp(req, res) {
        try {
            const userData = req.body;
            const result = await this.DoctorService.signup(userData);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Signup Error:", error);
            res.status(400).json({ message: error.message });
        }
    }
    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await this.DoctorService.verifyOtp(email, otp);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("OTP Verification Error:", error);
            res.status(400).json({ message: error.message });
        }
    }
    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }
            const result = await this.DoctorService.resendOtp(email);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Resend OTP Error:", error);
            res.status(400).json({ message: error.message });
        }
    }
    async login(req, res) {
        try {
            const { Email, password } = req.body;
            const { accessToken, refreshToken, username, email, isActive, role, profile_pic, age, phone, certification, experience, department, medical_license, address, clinic_name, about, education, gender, _id } = await this.DoctorService.login(Email, password);
            res.cookie('accessToken', accessToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 60 * 60 * 1000,
                path: '/'
            });
            res.cookie('refreshToken', refreshToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });
            res.json({ message: 'Login successful', username, email: Email, role, isActive, profile_pic, age, phone, certification, experience, department, medical_license, address, clinic_name, about, gender, education, _id });
        }
        catch (error) {
            console.error("Login Error:", error);
            res.status(401).json({ message: error.message });
        }
    }
    async logout(req, res) {
        try {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.json({ message: 'Logout successfully' });
        }
        catch (error) {
            console.error('Logout Error:', error);
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'An unknown error occurred' });
            }
        }
    }
    async googleAuth(req, res) {
        try {
            const { token } = req.body;
            const result = await this.DoctorService.googleAuth(token);
            res.cookie('accessToken', result.accessToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 60 * 60 * 1000,
                path: '/'
            });
            res.cookie('refreshToken', result.refreshToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });
            res.status(200).json({
                message: 'Google authentication successful',
                username: result.username,
                email: result.email,
                role: result.role,
                isActive: result.isActive,
                profile_pic: result.profile_pic,
                phone: result.phone,
                age: result.age,
                gender: result.gender,
                address: result.address,
                _id: result._id,
                experience: result.experience,
                certification: result.certification,
                department: result.department,
                medical_license: result.medical_license,
                clinic_name: result.clinic_name,
                about: result.about,
                education: result.education
            });
        }
        catch (error) {
            console.error("Google Auth Error:", error);
            res.status(400).json({ message: error.message });
        }
    }
    async updateProfile(req, res) {
        try {
            const docDetails = req.body;
            console.log('Incoming profile update request:', docDetails);
            const updatedDoc = await this.DoctorService.profile(docDetails);
            console.log(updatedDoc, 'the updated one is comming or not');
            res.status(200).json({ message: 'Profile updated successfully', updatedDoc });
        }
        catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async addSlots(req, res) {
        try {
            const slotData = req.body.slots;
            console.log('Incoming slot request:', req.body);
            const result = await this.DoctorService.addSlots(slotData);
            res.status(200).json({ message: 'slot added successfully', result });
        }
        catch (error) {
            console.error('Error adding slots:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getSlots(req, res) {
        try {
            const { doctorId } = req.params;
            console.log(doctorId);
            const result = await this.DoctorService.getSlots(doctorId);
            res.status(200).json(result);
        }
        catch (error) {
        }
    }
    async getAppointment(req, res) {
        try {
            const { doctorId } = req.params;
            console.log(doctorId, 'the doctor id is coming');
            const appointments = await this.DoctorService.getDoctorAppointments(doctorId);
            res.status(200).json(appointments);
        }
        catch (error) {
            console.error('Error fetching appointments:', error);
            res.status(500).json({ message: 'Failed to fetch appointments' });
        }
    }
    async checkAppointmentTime(req, res) {
        try {
            const { appointmentId } = req.params;
            console.log(`Checking appointment time for appointment: ${appointmentId}`);
            if (!appointmentId) {
                res.status(400).json({
                    allowed: false,
                    message: 'Appointment ID is required'
                });
                return;
            }
            const isValidTime = await this.DoctorService.checkAppointmentValidity(appointmentId);
            console.log(isValidTime, 'is this is comming or not');
            res.status(200).json({
                allowed: isValidTime,
                message: isValidTime ? 'Appointment time is valid' : 'You time is not reached'
            });
        }
        catch (error) {
            console.error('Error checking appointment time:', error);
            res.status(500).json({
                allowed: false,
                message: 'Failed to check appointment time'
            });
        }
    }
    async resetPassword(req, res) {
        try {
            console.log(req.body);
            const { doctorId, oldPassword, newPassword } = req.body;
            const result = await this.DoctorService.resetPassword(doctorId, oldPassword, newPassword);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }
    async sendForgottenpassword(req, res) {
        try {
            const { email } = req.body;
            let result = await this.DoctorService.sendForgottenpassword(email);
            res.status(200).json(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }
    async verifyForgottenpassword(req, res) {
        try {
            console.log(req.body);
            const { email, otpString } = req.body;
            let result = await this.DoctorService.verifyForgottenpassword(email, otpString);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json(error);
        }
    }
    async resetForgottenpassword(req, res) {
        try {
            const { email, password } = req.body;
            console.log(req.body);
            let result = await this.DoctorService.resetForgottenpassword(email, password);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json(error);
        }
    }
    async prescription(req, res) {
        try {
            const prescriptionData = req.body;
            console.log('Incoming prescription request:', prescriptionData);
            const result = await this.DoctorService.prescription(prescriptionData);
            console.log(result, 'the prescription is added successfully');
            res.status(200).json({ message: 'prescription added successfully', result });
        }
        catch (error) {
            res.status(500).json(error);
        }
    }
    async completeAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const result = await this.DoctorService.completeAppointment(appointmentId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error completing appointment:', error);
            res.status(500).json({ message: 'Failed to complete appointment' });
        }
    }
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log('Refresh token from cookies:', refreshToken);
            // Check if refresh token exists
            if (!refreshToken) {
                console.log('Refresh token not found in cookies');
                // Send a special status code to identify missing refresh token
                res.status(403).json({
                    message: 'Refresh token not found in cookies',
                    tokenState: 'MISSING_REFRESH_TOKEN'
                });
                return;
            }
            // Verify the token
            try {
                if (!process.env.REFRESH_TOKEN_SECRET) {
                    throw new Error('JWT_REFRESH_SECRET is not defined');
                }
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                console.log(decoded, 'is the decoded is coming or not');
                // Generate new tokens
                const userId = decoded.userId;
                const role = decoded.role;
                console.log(userId, 'the userid is comming or not');
                const newAccessToken = jsonwebtoken_1.default.sign({ userId: userId, role: role }, process.env.JWT_SECRET || '', { expiresIn: '15m' });
                const newRefreshToken = jsonwebtoken_1.default.sign({ userId: userId, role: role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                // Set the new tokens as cookies
                res.cookie('accessToken', newAccessToken, {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    path: '/',
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });
                res.cookie('refreshToken', newRefreshToken, {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                res.status(200).json({
                    message: 'Token refreshed successfully',
                    accessToken: newAccessToken
                });
                return;
            }
            catch (error) {
                console.error('Token verification error:', error);
                res.status(403).json({
                    message: 'Invalid refresh token',
                    tokenState: 'INVALID_REFRESH_TOKEN'
                });
                return;
            }
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getDetailsDashboard(req, res) {
        try {
            const { doctorId } = req.params;
            console.log(doctorId, 'the doctor id is coming');
            const details = await this.DoctorService.getDetailsDashboard(doctorId);
            res.status(200).json(details);
        }
        catch (error) {
            console.error('Error fetching details:', error);
            res.status(500).json({ message: 'Failed to fetch details' });
        }
    }
    async deleteSlot(req, res) {
        try {
            const { slotId } = req.params;
            console.log(slotId, 'the slot id is coming');
            const result = await this.DoctorService.deleteSlot(slotId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error deleting slot:', error);
            res.status(500).json({ message: 'Failed to delete slot' });
        }
    }
}
exports.doctorController = new DoctorController(new doctorService_1.DoctorService(userRepository_1.userRepository, slotRepository_1.slotRepository, otpService_1.otpService));
