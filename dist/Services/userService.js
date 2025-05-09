"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._userService = void 0;
const user_1 = require("../Interfaces/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
const stripe_1 = __importDefault(require("stripe"));
const slotModel_1 = __importDefault(require("../Model/slotModel"));
const lockModel_1 = __importDefault(require("../Model/lockModel"));
dotenv_1.default.config();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
});
class _userService {
    constructor(_userRepository, _slotRepository, _otpService) {
        this._userRepository = _userRepository;
        this._slotRepository = _slotRepository;
        this._otpService = _otpService;
    }
    async findUserById(userId) {
        try {
            const user = await this._userRepository.findUserById(userId);
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async signup(username, email, password) {
        const existingUser = await this._userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('Email is already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const otp = this._otpService.generateOTP();
        console.log(otp, 'the otp is comming for the user');
        const otpExpiration = this._otpService.generateOtpExpiration();
        const newUser = { username, email, password: hashedPassword, otp, otp_expiration: otpExpiration, role: user_1.userRole.PATIENT };
        let createdUser = await this._userRepository.createUser(newUser);
        if (!createdUser) {
            throw new Error('user not created');
        }
        const emailSent = await this._otpService.sendOTPEmail(email, otp);
        if (!emailSent) {
            createdUser = await this._userRepository.updateUser({ ...createdUser, otp: null, otp_expiration: null });
            throw new Error('Failed to send OTP email');
        }
        return { message: "Otp send successfully", userId: createdUser._id, username: createdUser.username, email: createdUser.email, role: createdUser.role };
    }
    async verifyOtp(email, otp) {
        const user = await this._userRepository.findUserByEmail(email);
        if (!user || !user.otp || !user.otp_expiration) {
            throw new Error('Invalid OTP or user not found');
        }
        if (this._otpService.validateOTP(user.otp, user.otp_expiration, otp)) {
            user.is_active = true;
            user.otp = null;
            user.otp_expiration = null;
            await this._userRepository.updateUser(user);
            return { message: 'Signup successful' };
        }
        else {
            throw new Error('Invalid or expired OTP');
        }
    }
    async login(email, password) {
        try {
            const user = await this._userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('Email is incorrect');
            }
            if (user.is_active === false) {
                throw new Error('user is Blocked');
            }
            if (user.role !== user_1.userRole.PATIENT) {
                throw new Error('Only patient can login here');
            }
            const passwordMatch = await bcrypt_1.default.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error('Password is incorrect');
            }
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error('REFRESH_TOKEN_SECRET is not defined');
            }
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: '7d',
            });
            return { accessToken, refreshToken, username: user.username, email: user.email, isActive: user.is_active, role: user.role, _id: user._id, gender: user.gender, profile_pic: user.profile_pic, phone: user.phone, age: user.age, address: user.address };
        }
        catch (error) {
            throw error;
        }
    }
    async resendOtp(email) {
        try {
            const user = await this._userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('user not found');
            }
            if (user.is_active) {
                return { message: 'user is already verified' };
            }
            const otp = this._otpService.generateOTP();
            const otpExpiration = this._otpService.generateOtpExpiration();
            user.otp = otp;
            user.otp_expiration = otpExpiration;
            const updatedUser = await this._userRepository.updateUser(user);
            if (!updatedUser)
                throw new Error("user not updated");
            const emailSent = await this._otpService.sendOTPEmail(email, otp);
            if (!emailSent) {
                user.otp = null;
                user.otp_expiration = null;
                await this._userRepository.updateUser(user);
                throw new Error('Failed to send OTP email');
            }
            return { message: 'New OTP sent successfully' };
        }
        catch (error) {
            throw error;
        }
    }
    async googleAuth(token) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: "608044793656-ijtreinvo4rrlavpjbrmjsf01n7rg5fr.apps.googleusercontent.com"
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new Error('Invalid Google token');
            }
            let user = await this._userRepository.findUserByEmail(payload.email);
            if (!user) {
                // Create a new user if they don't exist
                const newUser = {
                    username: payload.name || '',
                    email: payload.email,
                    password: undefined,
                    role: user_1.userRole.PATIENT,
                    is_active: true // 
                };
                user = await this._userRepository.createUser(newUser);
            }
            if (user.role !== user_1.userRole.PATIENT) {
                throw new Error('Only patient can login here');
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '15m' });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret', { expiresIn: '7d' });
            return {
                accessToken,
                refreshToken,
                username: user.username,
                email: user.email,
                isActive: user.is_active,
                role: user.role,
                profile_pic: user.profile_pic,
                phone: user.phone,
                age: user.age,
                gender: user.gender,
                address: user.address,
                _id: user._id
            };
        }
        catch (error) {
            throw error;
        }
    }
    async profile(userdetails) {
        try {
            const { _id, ...updateData } = userdetails;
            if (!_id) {
                throw new Error('Email is required for profile update');
            }
            // Remove keys with undefined or empty string values
            Object.keys(updateData).forEach((key) => {
                const typedKey = key;
                if (updateData[typedKey] === undefined || updateData[typedKey] === '') {
                    delete updateData[typedKey];
                }
            });
            const updatedUser = await this._userRepository.updateUserProfile(_id.toString(), updateData);
            if (!updatedUser) {
                throw new Error('user not found or update failed');
            }
            return updatedUser;
        }
        catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }
    async getDoctors(page = 1, limit = 6, search = "", department = "") {
        try {
            return await this._userRepository.findVerifiedDoctorsWithFilters(page, limit, search, department);
        }
        catch (error) {
            console.error('Error fetching doctors with filters:', error);
            throw error;
        }
    }
    async getDoctorSlots(doctorId) {
        try {
            const doctor = await this._userRepository.findUserById(doctorId);
            if (!doctor || doctor.role !== user_1.userRole.DOCTOR) {
                throw new Error("Doctor not found");
            }
            const currentDate = new Date();
            // await this._slotRepository.deletePastSlots(doctorId,currentDate)
            return this._slotRepository.getSlotsByDoctorId(doctorId);
        }
        catch (error) {
            console.error("Error fetching doctor slots:", error);
            throw error;
        }
    }
    async createPaymentIntent(amount) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency: "usd",
                payment_method_types: ["card"],
            });
            return paymentIntent.client_secret;
        }
        catch (error) {
            console.error("Error creating payment intent:", error);
            throw new Error("Failed to create payment intent");
        }
    }
    async lockSlot(slotId, userId, expiresAt) {
        try {
            // Acquire a database-level lock first
            const dbLockAcquired = await this._slotRepository.acquireDatabaseLock('slot', slotId);
            if (!dbLockAcquired) {
                return {
                    success: false,
                    message: "Unable to process your request. Please try again."
                };
            }
            try {
                // Check if slot is available
                const isAvailable = await this._slotRepository.isSlotAvailable(slotId);
                if (!isAvailable) {
                    // Get the slot to determine why it's not available
                    const slot = await this._slotRepository.getSlotsById(slotId);
                    if (!slot) {
                        return {
                            success: false,
                            message: "Slot not found"
                        };
                    }
                    if (slot.status !== 'available') {
                        return {
                            success: false,
                            message: "This slot is already booked"
                        };
                    }
                    else {
                        return {
                            success: false,
                            message: "This slot is temporarily reserved by another user"
                        };
                    }
                }
                // If available, create a user lock
                const lock = await this._slotRepository.lockSlot(slotId, userId, expiresAt);
                return {
                    success: true,
                    message: "Slot locked successfully",
                    lockId: lock._id?.toString(),
                    expiresAt: lock.expires_at
                };
            }
            finally {
                // Always release the database lock
                await this._slotRepository.releaseDatabaseLock('slot', slotId);
            }
        }
        catch (error) {
            return {
                success: false,
                message: (error instanceof Error ? error.message : "An unknown error occurred") || "Failed to lock slot"
            };
        }
    }
    // async createAppointment(appointmentData: {
    //   slot_id: string
    //   user_id: string
    //   amount: number
    //   payment_id: string
    //   status: string
    // }): Promise<appointmentResponse> {
    //   try {
    //     const appointment = await this._userRepository.createAppointment(appointmentData)
    //     const updatedSlot = await this._slotRepository.updateSlotStatus(appointmentData.slot_id, "booked")
    //     const slot = await this._slotRepository.getSlotsById(appointmentData.slot_id)
    //     if (!slot) {
    //       throw new Error("Slot not found")
    //     }
    //     const doctor = await this._userRepository.findDoctorById(slot.doctor_id.toString())
    //     if (!doctor) {
    //       throw new Error("Doctor not found")
    //     }
    //     if (!updatedSlot) {
    //       throw new Error("Failed to update slot status")
    //     }
    //     const patient = await this._userRepository.findUserById(appointmentData.user_id)
    //     if (!patient || !patient.email) {
    //       throw new Error("Patient information not found")
    //     }
    //     // Prepare appointment details for email
    //     const appointmentDetails = {
    //       doctorName: doctor.username,
    //       clinicName: doctor.clinic_name || "Not specified",
    //       department: doctor.department || "Not specified",
    //       day: slot.day,
    //       startTime: slot.start_time,
    //       endTime: slot.end_time,
    //       amount: appointmentData.amount,
    //       status: appointmentData.status,
    //     }
    //     const emailSent = await _emailService.sendAppointmentConfirmation(
    //       patient.email,
    //       appointmentDetails
    //     )
    //     if (!emailSent) {
    //       console.warn("Failed to send appointment confirmation email")
    //     }
    //     return {
    //       message: "Appointment created successfully and slot updated",
    //       appointment: {
    //         ...appointment,
    //         _id: appointment._id instanceof Object ? appointment._id.toString() : appointment._id, // Convert _id to string
    //       },
    //       updatedSlot: {
    //         ...updatedSlot,
    //         _id: updatedSlot._id instanceof Object ? updatedSlot._id.toString() : updatedSlot._id, // Convert _id to string
    //       },
    //     };
    //   } catch (error) {
    //     throw error
    //   }
    // }
    async createAppointment(appointmentData) {
        // Verify the lock if a lockId is provided
        if (appointmentData.lockId) {
            const lock = await lockModel_1.default.findById(appointmentData.lockId);
            if (!lock) {
                throw new Error("Lock not found or has expired");
            }
            if (lock.user_id !== appointmentData.user_id) {
                throw new Error("This slot is locked by another user");
            }
            if (lock.expires_at < new Date()) {
                throw new Error("Lock has expired. Please try booking again");
            }
        }
        // Acquire a database lock for the actual booking operation
        const dbLockAcquired = await this._slotRepository.acquireDatabaseLock('slot', appointmentData.slot_id);
        if (!dbLockAcquired) {
            throw new Error("Unable to process your booking at this time. Please try again.");
        }
        try {
            // Check if slot is still available
            const slot = await this._slotRepository.getSlotsById(appointmentData.slot_id);
            if (!slot) {
                throw new Error("Slot not found");
            }
            if (slot.status !== 'available') {
                throw new Error("This slot is already booked");
            }
            // Proceed with booking
            const appointment = await this._userRepository.createAppointment({
                slot_id: appointmentData.slot_id,
                user_id: appointmentData.user_id,
                amount: appointmentData.amount,
                payment_id: appointmentData.payment_id,
                status: appointmentData.status
            });
            // Update the slot status
            const updatedSlot = await this._slotRepository.updateSlotStatus(appointmentData.slot_id, "booked");
            if (!updatedSlot) {
                throw new Error("Failed to update slot status");
            }
            // Get doctor information
            const doctor = await this._userRepository.findDoctorById(slot.doctor_id.toString());
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            // Get patient information
            const patient = await this._userRepository.findUserById(appointmentData.user_id);
            if (!patient || !patient.email) {
                throw new Error("Patient information not found");
            }
            // Prepare appointment details for email
            const appointmentDetails = {
                doctorName: doctor.username,
                clinicName: doctor.clinic_name || "Not specified",
                department: doctor.department || "Not specified",
                day: slot.day,
                startTime: slot.start_time,
                endTime: slot.end_time,
                amount: appointmentData.amount,
                status: appointmentData.status,
            };
            // Send confirmation email
            const emailSent = await this._emailService.sendAppointmentConfirmation(patient.email, appointmentDetails);
            if (!emailSent) {
                console.warn("Failed to send appointment confirmation email");
            }
            // Remove the lock if it exists
            if (appointmentData.lockId) {
                await this._slotRepository.unlockSlot(appointmentData.lockId);
            }
            // Prepare and return the result
            const appointmentResult = this.formatAppointment(appointment);
            const slotResult = this.formatSlot(updatedSlot);
            return {
                message: "Appointment created successfully and slot updated",
                appointment: appointmentResult,
                updatedSlot: slotResult
            };
        }
        catch (error) {
            throw error;
        }
        finally {
            // Always release the database lock
            await this._slotRepository.releaseDatabaseLock('slot', appointmentData.slot_id);
        }
    }
    // Helper method to format appointment data
    formatAppointment(appointment) {
        return {
            ...appointment,
            _id: appointment._id instanceof Object ? appointment._id.toString() : appointment._id,
        };
    }
    // Helper method to format slot data
    formatSlot(slot) {
        return {
            ...slot,
            _id: slot._id instanceof Object ? slot._id.toString() : slot._id,
        };
    }
    async getStatus(userId) {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user.is_active ?? false;
        }
        catch (error) {
            console.error("Error fetching user status:", error);
            throw error;
        }
    }
    async getAppointmentDetails(userId, page = 1, pageSize = 3) {
        try {
            const { appointments: appointmentDetails, totalCount } = await this._userRepository.findPendingAppointmentsByUserId(userId, page, pageSize);
            // Calculate total pages
            const totalPages = Math.ceil(totalCount / pageSize);
            // If no appointments, return empty result with pagination metadata
            if (!appointmentDetails || appointmentDetails.length === 0) {
                return {
                    appointments: [],
                    totalCount: 0,
                    totalPages: 1,
                    currentPage: page
                };
            }
            const mappedAppointments = appointmentDetails.map(appointment => ({
                date: appointment.slot_id?.day ? new Date(appointment.slot_id.day) : new Date(),
                _id: appointment._id?.toString() || '',
                user_id: appointment.user_id?._id?.toString() || '',
                slot_id: appointment.slot_id?._id?.toString() || '',
                doctorName: appointment.slot_id?.doctor_id?.username || 'Unknown Doctor',
                doctorId: appointment.slot_id?.doctor_id?._id?.toString() || '',
                patientId: appointment.user_id?._id?.toString() || '',
                doctorDepartment: appointment.slot_id?.doctor_id?.department || 'Not Specified',
                patientName: appointment.user_id?.username || 'Unknown Patient',
                startTime: appointment.slot_id?.start_time || '',
                endTime: appointment.slot_id?.end_time || '',
                appointmentDate: appointment.slot_id?.day || '',
                status: appointment.status || 'pending',
                appointmentId: appointment._id?.toString() || '',
                amount: appointment.amount?.toString() || '',
                refund: appointment.refund || 0
            }));
            return {
                appointments: mappedAppointments,
                totalCount,
                totalPages,
                currentPage: page
            };
        }
        catch (error) {
            console.error("Error fetching appointment details:", error);
            throw error;
        }
    }
    async refundPayment(appointmentId) {
        try {
            const appointment = await this._userRepository.findAppointmentById(appointmentId);
            if (!appointment) {
                throw new Error('Appointment not found');
            }
            if (appointment.status === 'cancelled') {
                throw new Error('Appointment is already cancelled');
            }
            // Calculate 50% refund amount
            const refundAmount = Math.floor(appointment.amount - 25);
            const refund = await stripe.refunds.create({
                payment_intent: appointment.payment_id,
                amount: refundAmount
            });
            if (refund.status === 'succeeded') {
                appointment.status = 'cancelled';
                appointment.refund = refundAmount;
                await appointment.save();
                await slotModel_1.default.findByIdAndUpdate(appointment.slot_id, { status: 'available' });
                return {
                    success: true,
                    message: 'Refund processed successfully',
                    refundAmount,
                    appointmentId: appointment._id?.toString() || ''
                };
            }
            else {
                throw new Error('Refund processing failed');
            }
        }
        catch (error) {
            console.error("Error processing refund:", error);
            throw new Error('Failed to process refund');
        }
    }
    async getcancelandcompleteAppointmentDetails(userId, page = 1, limit = 3, status) {
        try {
            // Get all appointments for counting and pagination
            const allAppointments = await this._userRepository.findcancelandcompleteAppointmentsByUserId(userId, status);
            // Calculate pagination values
            const totalCount = allAppointments.length;
            const totalPages = Math.ceil(totalCount / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            // Get paginated appointments
            const paginatedAppointments = await this._userRepository.findcancelandcompleteAppointmentsByUserId(userId, status, startIndex, limit);
            // Transform appointments
            const formattedAppointments = paginatedAppointments.map(appointment => ({
                date: appointment.slot_id?.day ? new Date(appointment.slot_id.day) : new Date(),
                _id: appointment._id?.toString() || '',
                user_id: appointment.user_id?._id?.toString() || '',
                slot_id: appointment.slot_id?._id?.toString() || '',
                doctorName: appointment.slot_id?.doctor_id?.username || 'Unknown Doctor',
                doctorId: appointment.slot_id?.doctor_id?._id?.toString() || '',
                patientId: appointment.user_id?._id?.toString() || '',
                doctorDepartment: appointment.slot_id?.doctor_id?.department || 'Not Specified',
                patientName: appointment.user_id?.username || 'Unknown Patient',
                startTime: appointment.slot_id?.start_time || '',
                endTime: appointment.slot_id?.end_time || '',
                appointmentDate: appointment.slot_id?.day || '',
                status: appointment.status || 'pending',
                appointmentId: appointment._id?.toString() || '',
                amount: appointment.amount?.toString() || '',
                refund: appointment.refund || 0
            }));
            return {
                appointments: formattedAppointments,
                totalCount,
                totalPages
            };
        }
        catch (error) {
            console.error("Error fetching appointment details:", error);
            throw error;
        }
    }
    async resetPassword(userId, oldPassword, newPassword) {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new Error('user not found');
            }
            const passwordMatch = await bcrypt_1.default.compare(oldPassword, user.password);
            if (!passwordMatch) {
                throw new Error('Old Password is incorrect');
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            user.password = hashedPassword;
            await this._userRepository.updateUser(user);
            return { message: 'Password updated successfully' };
        }
        catch (error) {
            console.error("Error updating password:", error);
            throw error;
        }
    }
    async sendForgottenpassword(email) {
        try {
            const user = await this._userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('user not found');
            }
            const otp = this._otpService.generateOTP();
            const otpExpiration = this._otpService.generateOtpExpiration();
            user.otp = otp;
            user.otp_expiration = otpExpiration;
            await this._userRepository.updateUser(user);
            const emailSent = await this._otpService.sendOTPEmail(email, otp);
            if (!emailSent) {
                user.otp = null;
                user.otp_expiration = null;
                await this._userRepository.updateUser(user);
                throw new Error('Failed to send OTP email');
            }
            return { message: 'New OTP sent successfully' };
        }
        catch (error) {
            console.error("Error sending forgotten password:", error);
            throw error;
        }
    }
    async verifyForgottenpassword(email, otpString) {
        try {
            const user = await this._userRepository.findUserByEmail(email);
            if (!user || !user.otp || !user.otp_expiration) {
                throw new Error('Invalid OTP or user not found');
            }
            if (this._otpService.validateOTP(user.otp, user.otp_expiration, otpString)) {
                user.otp = null;
                user.otp_expiration = null;
                await this._userRepository.updateUser(user);
                return { message: 'Otp verified successfully' };
            }
            else {
                throw new Error('Invalid or expired OTP');
            }
        }
        catch (error) {
            console.error("Error verifying forgotten password:", error);
            throw error;
        }
    }
    async resetForgottenpassword(email, password) {
        try {
            const user = await this._userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error('user not found');
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            user.password = hashedPassword;
            await this._userRepository.updateUser(user);
            return { message: 'Password updated successfully' };
        }
        catch (error) {
            console.error("Error updating password:", error);
            throw error;
        }
    }
    async getPrescriptions(appointmentId) {
        try {
            const prescriptions = await this._userRepository.getPrescriptions(appointmentId);
            return prescriptions;
        }
        catch (error) {
            console.error('Error in UserService getPrescriptions:', error);
            throw new Error('Failed to retrieve prescriptions');
        }
    }
    async reviews(appointmentid, rating, reviewText, userid) {
        try {
            await this._userRepository.createReview(appointmentid, rating, reviewText, userid);
            return { message: 'review is uploaded successfully' };
        }
        catch (error) {
            console.error('Error uploading review:', error);
            throw new Error('Failed to upload review');
        }
    }
}
exports._userService = _userService;
