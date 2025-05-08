"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../Model/userModel"));
const user_1 = require("../Interfaces/user");
const appointmentModel_1 = __importDefault(require("../Model/appointmentModel"));
const prescriptionModel_1 = __importDefault(require("../Model/prescriptionModel"));
const reviewModel_1 = __importDefault(require("../Model/reviewModel"));
const slotModel_1 = __importDefault(require("../Model/slotModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class _userRepository {
    async createUser(user) {
        console.log(user, 'from the createUser');
        const newUser = new userModel_1.default(user);
        return newUser.save();
    }
    async findUserByEmail(email) {
        return userModel_1.default.findOne({ email });
    }
    async findUserById(userid) {
        return userModel_1.default.findById(userid);
    }
    async findDoctorById(doctorid) {
        return userModel_1.default.findById(doctorid).select('username clinic_name department');
    }
    async updateUser(user) {
        return userModel_1.default.findByIdAndUpdate(user._id, user, { new: true });
    }
    async updateUserProfile(userid, updateData) {
        return userModel_1.default.findOneAndUpdate({ _id: userid }, { $set: updateData }, { new: true, runValidators: true });
    }
    async findAllUsers() {
        return userModel_1.default.find();
    }
    async updateUserStatus(userid, is_active) {
        return userModel_1.default.findOneAndUpdate({ _id: userid }, { $set: { is_active: is_active } }, { new: true, runValidators: true });
    }
    async findAllVerifyDoctors() {
        return userModel_1.default.find({ role: user_1.userRole.DOCTOR, verified: true });
    }
    async findAllDoctors() {
        return userModel_1.default.find({ role: user_1.userRole.DOCTOR, verified: false });
    }
    async updateDoctorVerification(doctorid, is_verified) {
        return userModel_1.default.findOneAndUpdate({ _id: doctorid }, { $set: { verified: is_verified } }, { new: true, runValidators: true });
    }
    async findUsersByRole(userRole) {
        return userModel_1.default.find({ role: userRole });
    }
    async removeUser(_id) {
        await userModel_1.default.findByIdAndDelete(_id);
    }
    async createAppointment(appointmentData) {
        const appointment = new appointmentModel_1.default(appointmentData);
        return appointment.save();
    }
    async findAppointmentBySlotId(slotId) {
        return appointmentModel_1.default.findOne({ slot_id: slotId });
    }
    async findAppointmentById(appointmentId) {
        return appointmentModel_1.default.findOne({ _id: appointmentId });
    }
    async findAppointmentsByDoctorId(doctorId) {
        try {
            return await appointmentModel_1.default.find({})
                .populate({
                path: 'slot_id',
                match: { doctor_id: doctorId },
            })
                .populate({
                path: 'user_id',
                select: 'username email'
            })
                .exec()
                .then((appointments) => appointments
                .filter((appointment) => appointment.slot_id !== null)
                .map((appointment) => ({
                username: appointment.user_id.username,
                userEmail: appointment.user_id.email || '',
                startTime: appointment.slot_id.start_time,
                endTime: appointment.slot_id.end_time,
                date: appointment.slot_id.day,
                status: appointment.status,
                userId: appointment.user_id._id,
                appointmentId: appointment._id
            }))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        catch (error) {
            console.error('Error in findAppointmentsByDoctorId:', error);
            throw error;
        }
    }
    async findPendingAppointmentsByUserId(userId, page = 1, pageSize = 3) {
        const skip = (page - 1) * pageSize;
        const totalCount = await appointmentModel_1.default.countDocuments({
            user_id: userId,
            status: 'pending'
        });
        const appointments = await appointmentModel_1.default.find({
            user_id: userId,
            status: 'pending'
        })
            .populate({
            path: "slot_id",
            populate: {
                path: "doctor_id",
                select: "username department profile_pic"
            }
        })
            .populate("user_id", "username email")
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .skip(skip)
            .limit(pageSize)
            .lean();
        return {
            appointments,
            totalCount
        };
    }
    async findcancelandcompleteAppointmentsByUserId(userId, status, skip, limit) {
        // Build the match condition based on parameters
        const match = { user_id: new mongoose_1.default.Types.ObjectId(userId) };
        if (status) {
            // If specific status is provided, use that
            match.status = status;
        }
        else {
            // Otherwise use the default of cancelled and completed
            match.status = { $in: ['cancelled', 'completed'] };
        }
        // Create the aggregation pipeline
        const pipeline = [
            { $match: match },
            // Lookup to populate slot_id
            {
                $lookup: {
                    from: 'slots', // Collection name for slots
                    localField: 'slot_id',
                    foreignField: '_id',
                    as: 'slot'
                }
            },
            // Unwind the slot array
            { $unwind: '$slot' },
            // Lookup to populate doctor within slot
            {
                $lookup: {
                    from: 'users', // Collection name for users/doctors
                    localField: 'slot.doctor_id',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            // Unwind the doctor array
            { $unwind: '$doctor' },
            // Lookup to populate user_id
            {
                $lookup: {
                    from: 'users', // Collection name for users
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            // Unwind the user array
            { $unwind: '$user' },
            // Sort by slot's created_at field
            { $sort: { 'slot.created_at': -1 } },
            // Project to format the output similar to populate
            {
                $project: {
                    _id: 1,
                    status: 1,
                    prescription: 1,
                    symptoms: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    slot_id: {
                        _id: '$slot._id',
                        day: '$slot.day',
                        start_time: '$slot.start_time',
                        end_time: '$slot.end_time',
                        status: '$slot.status',
                        created_at: '$slot.created_at',
                        updated_at: '$slot.updated_at',
                        doctor_id: {
                            _id: '$doctor._id',
                            username: '$doctor.username',
                            department: '$doctor.department',
                            profile_pic: '$doctor.profile_pic'
                        }
                    },
                    user_id: {
                        _id: '$user._id',
                        username: '$user.username',
                        email: '$user.email'
                    }
                }
            }
        ];
        // Apply pagination if provided
        if (skip !== undefined) {
            pipeline.push({ $skip: skip });
        }
        if (limit !== undefined) {
            pipeline.push({ $limit: limit });
        }
        // Execute and return
        return appointmentModel_1.default.aggregate(pipeline);
    }
    async getDashboardStats() {
        try {
            // Get counts for doctors and users
            const [totalDoctors, totalUsers, appointments] = await Promise.all([
                userModel_1.default.countDocuments({ role: user_1.userRole.DOCTOR }),
                userModel_1.default.countDocuments({ role: user_1.userRole.PATIENT }),
                appointmentModel_1.default.find({})
            ]);
            const totalAppointments = appointments.length;
            const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
            const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
            const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
            // const revenueGenerated = appointments
            //   .reduce((total, apt) => total + (apt.amount || 0), 0);
            const revenueGenerated = appointments
                .reduce((total, apt) => {
                // Add the appointment amount if it exists
                const appointmentAmount = apt.amount || 0;
                // Subtract the refund amount if it exists
                const refundAmount = apt.refund || 0;
                // Return the net amount
                return total + appointmentAmount - refundAmount;
            }, 0);
            return {
                totalDoctors,
                totalUsers,
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                pendingAppointments,
                revenueGenerated
            };
        }
        catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }
    async getAppointmentChartStats(timeRange) {
        try {
            const now = new Date();
            let startDate;
            let endDate = new Date(now);
            // Adjust time ranges to match API parameters
            switch (timeRange) {
                case 'lastWeek':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'lastMonth':
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'lastYear':
                    startDate = new Date(now);
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
            }
            // Reset hours to get full day coverage
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            // Fetch slots with correct date range
            const slots = await slotModel_1.default.aggregate([
                {
                    $match: {
                        created_at: {
                            $gte: startDate,
                            $lte: endDate
                        },
                        status: 'booked' // Only count booked slots
                    }
                },
                {
                    $addFields: {
                        createdAtDate: { $toDate: "$created_at" }
                    }
                }
            ]);
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            };
            let result = { daily: [], weekly: [], yearly: [] };
            // Generate date range
            const days = [];
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                days.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Daily breakdown
            result.daily = days.map(date => {
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                const count = slots.filter((slot) => {
                    const slotDate = new Date(slot.created_at);
                    return slotDate >= dayStart && slotDate <= dayEnd;
                }).length;
                return {
                    name: formatDate(date),
                    appointments: count
                };
            });
            // Weekly breakdown for last month
            if (timeRange === 'lastMonth') {
                const weeks = Math.ceil(days.length / 7);
                result.weekly = Array.from({ length: weeks }, (_, weekIndex) => {
                    const weekStart = new Date(days[weekIndex * 7]);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    const weekAppointments = slots.filter((slot) => {
                        const slotDate = new Date(slot.created_at);
                        return slotDate >= weekStart && slotDate <= weekEnd;
                    });
                    return {
                        name: `Week ${weekIndex + 1}`,
                        appointments: weekAppointments.length
                    };
                });
            }
            // Yearly breakdown for last year
            if (timeRange === 'lastYear') {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                result.yearly = Array.from({ length: 12 }, (_, monthIndex) => {
                    const monthStart = new Date(now.getFullYear(), monthIndex, 1);
                    const monthEnd = new Date(now.getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999);
                    const monthAppointments = slots.filter((slot) => {
                        const slotDate = new Date(slot.created_at);
                        return slotDate >= monthStart && slotDate <= monthEnd;
                    });
                    return {
                        name: months[monthIndex],
                        appointments: monthAppointments.length
                    };
                });
            }
            return result;
        }
        catch (error) {
            console.error('Error getting appointment chart stats:', error);
            throw error;
        }
    }
    async findAppointmentWithSlot(appointmentId) {
        try {
            const appointment = await appointmentModel_1.default.findOne({ _id: appointmentId })
                .populate({
                path: 'slot_id',
                select: 'date start_time end_time doctor_id'
            })
                .select('status slot_id')
                .lean();
            if (!appointment) {
                console.log('No appointment found for ID:', appointmentId);
                return null;
            }
            return appointment;
        }
        catch (error) {
            console.error('Error in findAppointmentWithSlot:', error);
            throw error;
        }
    }
    async findVerifiedDoctorsWithFilters(page = 1, limit = 6, search = "", department = "") {
        try {
            // Build the query
            let query = { role: user_1.userRole.DOCTOR, verified: true };
            if (search) {
                query = {
                    ...query,
                    $or: [
                        { username: { $regex: search, $options: 'i' } },
                        { department: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            if (department) {
                query.department = department;
            }
            // Calculate pagination values
            const skip = (page - 1) * limit;
            // Execute queries in parallel for better performance
            const [doctors, totalDoctors, departments] = await Promise.all([
                userModel_1.default.find(query)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                userModel_1.default.countDocuments(query),
                userModel_1.default.distinct('department', { role: user_1.userRole.DOCTOR, verified: true })
            ]);
            return {
                doctors,
                totalDoctors,
                totalPages: Math.ceil(totalDoctors / limit),
                currentPage: page,
                departments
            };
        }
        catch (error) {
            console.error('Error finding verified doctors with filters:', error);
            throw error;
        }
    }
    async createPrescription(prescriptionData) {
        try {
            // Create a new prescription document
            const newPrescription = new prescriptionModel_1.default(prescriptionData);
            // Save the prescription to the database
            const savedPrescription = await newPrescription.save();
            return savedPrescription;
        }
        catch (error) {
            console.error('Error creating prescription:', error);
            throw new Error('Failed to create prescription');
        }
    }
    async updateAppointment(appointmentId, status) {
        try {
            const updatedAppointment = await appointmentModel_1.default.findByIdAndUpdate(appointmentId, {
                status: status,
                updated_at: new Date()
            });
            if (!updatedAppointment) {
                throw new Error('Appointment not found');
            }
            // Log the update for tracking
            console.log(`Appointment ${appointmentId} updated to status: ${status}`);
            return updatedAppointment;
        }
        catch (error) {
        }
    }
    async getPrescriptions(appointmentId) {
        try {
            // First, find the prescription by appointment ID
            const prescriptions = await prescriptionModel_1.default
                .find({ appointment_id: appointmentId })
                .lean();
            if (!prescriptions || prescriptions.length === 0) {
                return [];
            }
            // Get the appointment details to find related user and doctor info
            const appointment = await appointmentModel_1.default
                .findById(appointmentId)
                .lean();
            if (!appointment) {
                return prescriptions; // Return just prescriptions if appointment not found
            }
            // Get user details from appointment
            const patient = await userModel_1.default.findById(appointment.user_id).lean();
            // Get slot details to find doctor
            const slot = await slotModel_1.default.findById(appointment.slot_id).lean();
            // Get doctor details from slot
            const doctor = slot ? await userModel_1.default.findById(slot.doctor_id).lean() : null;
            // Enhance prescription with user and doctor details
            const enhancedPrescriptions = prescriptions.map(prescription => ({
                ...prescription,
                patient: patient ? {
                    username: patient.username,
                    age: patient.age,
                    gender: patient.gender
                } : null,
                doctor: doctor ? {
                    username: doctor.username,
                    department: doctor.department,
                    clinic_name: doctor.clinic_name
                } : null
            }));
            return enhancedPrescriptions;
        }
        catch (error) {
            console.error('Error fetching prescription with details:', error);
            throw error;
        }
    }
    async createReview(appointmentid, rating, reviewText, userid) {
        try {
            if (!appointmentid || !rating || !reviewText || !userid) {
                throw new Error('All fields are required');
            }
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            const review = new reviewModel_1.default({
                appointmentId: appointmentid,
                rating,
                reviewText,
                userId: userid
            });
            const savedReview = await review.save();
            console.log('Review created successfully:', savedReview);
        }
        catch (error) {
            console.error('Error in createReview:', error);
            throw error;
        }
    }
    async getAllReviews() {
        try {
            // Fetch all reviews from the database with nested population
            const reviews = await reviewModel_1.default.find()
                .populate({
                path: 'appointmentId',
                populate: {
                    path: 'slot_id',
                    populate: {
                        path: 'doctor_id',
                        select: 'username profile_pic'
                    }
                }
            })
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .lean();
            // Map database documents to the Review interface
            return reviews.map(doc => {
                // Extract doctor info from the populated fields
                const slot = doc.appointmentId?.slot_id || {};
                const doctorInfo = slot.doctor_id || {};
                const patientInfo = doc.userId || {};
                // Create the review object according to the interface
                return {
                    reviewId: doc._id,
                    appointmentId: doc.appointmentId,
                    doctorName: doctorInfo.username || '',
                    doctorProfileImage: doctorInfo.profile_pic || '',
                    patientName: patientInfo.username || '',
                    patientEmail: patientInfo.email || '',
                    rating: doc.rating,
                    reviewText: doc.reviewText,
                    createdAt: doc.createdAt
                };
            });
        }
        catch (error) {
            console.error('Error in getAllReviews:', error);
            throw new Error('Failed to retrieve reviews');
        }
    }
    async getDoctorDashboard(doctorId) {
        const doctorObjectId = new mongoose_1.default.Types.ObjectId(doctorId);
        const [statsData, reviewsData, revenueData] = await Promise.all([
            // Stats Aggregation
            appointmentModel_1.default.aggregate([
                {
                    $lookup: {
                        from: 'slots',
                        localField: 'slot_id',
                        foreignField: '_id',
                        as: 'slot'
                    }
                },
                { $unwind: '$slot' },
                { $match: { 'slot.doctor_id': doctorObjectId } },
                {
                    $group: {
                        _id: null,
                        totalAppointments: { $sum: 1 },
                        uniquePatients: { $addToSet: '$user_id' }
                    }
                },
                {
                    $project: {
                        totalAppointments: 1,
                        totalPatients: { $size: '$uniquePatients' }
                    }
                }
            ]),
            // Review Aggregation
            reviewModel_1.default.aggregate([
                {
                    $lookup: {
                        from: 'appointments',
                        localField: 'appointmentId',
                        foreignField: '_id',
                        as: 'appointment'
                    }
                },
                { $unwind: '$appointment' },
                {
                    $lookup: {
                        from: 'slots',
                        localField: 'appointment.slot_id',
                        foreignField: '_id',
                        as: 'slot'
                    }
                },
                { $unwind: '$slot' },
                { $match: { 'slot.doctor_id': doctorObjectId } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'patient'
                    }
                },
                { $unwind: '$patient' },
                {
                    $project: {
                        reviewId: { $toString: '$_id' },
                        rating: 1,
                        reviewText: 1,
                        patientName: '$patient.username',
                        createdAt: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$createdAt" } }
                    }
                }
            ]),
            // Revenue Aggregation
            appointmentModel_1.default.aggregate([
                {
                    $lookup: {
                        from: 'slots',
                        localField: 'slot_id',
                        foreignField: '_id',
                        as: 'slot'
                    }
                },
                { $unwind: '$slot' },
                { $match: { 'slot.doctor_id': doctorObjectId, status: 'completed' } }, // Consider only completed appointments
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ])
        ]);
        const totalRating = reviewsData.reduce((acc, cur) => acc + cur.rating, 0);
        const averageRating = reviewsData.length > 0 ? totalRating / reviewsData.length : 0;
        const totalAmount = revenueData[0]?.totalAmount || 0;
        const totalRevenue = parseFloat((totalAmount * 0.9).toFixed(2)); // 10% deduction
        return {
            stats: {
                totalAppointments: statsData[0]?.totalAppointments || 0,
                totalPatients: statsData[0]?.totalPatients || 0,
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalRevenue
            },
            reviews: reviewsData
        };
    }
}
exports.default = new _userRepository();
