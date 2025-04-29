"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class OtpService {
    generateOTP() {
        return crypto_1.default.randomInt(1000, 9999).toString();
    }
    generateOtpExpiration() {
        return new Date(Date.now() + 10 * 60 * 1000); // Changed to 10 minutes to match email text
    }
    async sendOTPEmail(email, otp) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Curra_Connect: OTP for Secure Signup',
                text: `
            Dear User
            
            Thank you for choosing Curra_Connect, your trusted partner for online consultations and appointments.
            
            Your One-Time Password (OTP) for completing the signup process is: ${otp}. 
            Please use this OTP to verify your account. Note that the OTP will expire in 10 minutes for your security.
            
            If you did not initiate this request, please ignore this email or contact our support team at support@curra_connect.com.
            
            We're excited to have you on board and look forward to serving your healthcare needs.
            
            Best regards,
            The Curra_Connect Team
        `,
            };
            await transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            console.error('OTP Email Error:', error);
            return false;
        }
    }
    validateOTP(storedOtp, storedExpiration, userProvidedOtp) {
        if (storedOtp !== userProvidedOtp) {
            return false;
        }
        if (new Date() > storedExpiration) {
            return false;
        }
        return true;
    }
}
exports.otpService = new OtpService();
