import userModel from '../Model/userModel';
import { doctorAppointment, review, reviewAdminside, user, userRole } from '../Interfaces/user';
import appointmentModel from '../Model/appointmentModel';
import { IuserRepository } from '../Entities/iUserRepository';
import { appointment, chartAppointmentStats, dashboardStats } from '../Interfaces/appointment';
import { prescription } from '../Interfaces/prescription';
import prescriptionModel from '../Model/prescriptionModel';
import reviewModel from '../Model/reviewModel';
import slotModel from '../Model/slotModel';
import mongoose from 'mongoose';




class _userRepository implements IuserRepository {

  async createUser(user: user): Promise<user> {
    console.log(user, 'from the createUser')
    const newUser = new userModel(user);
    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<user | null> {
    return userModel.findOne({ email });
  }

  async findUserById(userid: string): Promise<user | null> {
    return userModel.findById(userid);
  }

  async findDoctorById(doctorid: string): Promise<user | null> {
    return userModel.findById(doctorid).select('username clinic_name department')
  }

  async updateUser(user: user): Promise<user | null> {
    return userModel.findByIdAndUpdate(user._id, user, { new: true });
  }

  async updateUserProfile(userid: string, updateData: Partial<user>): Promise<user | null> {
    return userModel.findOneAndUpdate(
      { _id: userid },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async findAllUsers(): Promise<user[]> {
    return userModel.find();
  }

  async updateUserStatus(userid: string, is_active: boolean): Promise<user | null> {
    return userModel.findOneAndUpdate(
      { _id: userid },
      { $set: { is_active: is_active } },
      { new: true, runValidators: true }
    );
  }

  async findAllVerifyDoctors(): Promise<user[]> {
    return userModel.find({ role: userRole.DOCTOR, verified: true });
  }

  async findAllDoctors(): Promise<user[]> {
    return userModel.find({ role: userRole.DOCTOR, verified: false })
  }

  async updateDoctorVerification(doctorid: string, is_verified: boolean): Promise<user | null> {
    return userModel.findOneAndUpdate(
      { _id: doctorid },
      { $set: { verified: is_verified } },
      { new: true, runValidators: true }
    );
  }

  async findUsersByRole(userRole: userRole): Promise<user[]> {
    return userModel.find({ role: userRole });

  }

  async removeUser(_id: string): Promise<void> {
    await userModel.findByIdAndDelete(_id)
  }

  async createAppointment(appointmentData: {
    slot_id: string;
    user_id: string;
    amount: number;
    payment_id: string;
    status: string;
  }): Promise<any> {
    const appointment = new appointmentModel(appointmentData);
    return appointment.save();
  }

  async findAppointmentBySlotId(slotId: string): Promise<any> {
    return appointmentModel.findOne({ slot_id: slotId });
  }

  async findAppointmentById(appointmentId: string): Promise<any> {
    return appointmentModel.findOne({ _id: appointmentId })
  }

  async findAppointmentsByDoctorId(doctorId: string) {
    try {
      return await appointmentModel.find({})
        .populate({
          path: 'slot_id',
          match: { doctor_id: doctorId },
        })
        .populate({
          path: 'user_id',
          select: 'username email'
        })
        .exec()
        .then((appointments: any) =>
          appointments
            .filter((appointment: { slot_id: null; }) => appointment.slot_id !== null)
            .map((appointment: {
              _id: any; user_id: { username: any; email: any; _id: any; }; slot_id: { start_time: any; end_time: any; day: any; }; status: any;
            }) => ({
              username: appointment.user_id.username,
              userEmail: appointment.user_id.email || '',
              startTime: appointment.slot_id.start_time,
              endTime: appointment.slot_id.end_time,
              date: appointment.slot_id.day,
              status: appointment.status,
              userId: appointment.user_id._id,
              appointmentId: appointment._id
            }))
            .sort((a: { date: Date }, b: { date: Date }) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
    } catch (error) {
      console.error('Error in findAppointmentsByDoctorId:', error);
      throw error;
    }
  }

  async findPendingAppointmentsByUserId(userId: string, page: number = 1, pageSize: number = 3): Promise<any> {
    const skip = (page - 1) * pageSize;

    const totalCount = await appointmentModel.countDocuments({
      user_id: userId,
      status: 'pending'
    });

    const appointments = await appointmentModel.find({
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

  async findcancelandcompleteAppointmentsByUserId(
    userId: string,
    status?: string,
    skip?: number,
    limit?: number
  ): Promise<any[]> {
    // Build the match condition based on parameters
    const match: any = { user_id: new mongoose.Types.ObjectId(userId) };
  
    if (status) {
      // If specific status is provided, use that
      match.status = status;
    } else {
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
      pipeline.push({ $skip: skip } as any);
    }
    
    if (limit !== undefined) {
      pipeline.push({ $limit: limit }as any);
    }
  
    // Execute and return
    return appointmentModel.aggregate(pipeline as any);
  }

  async getDashboardStats(): Promise<dashboardStats> {
    try {
      // Get counts for doctors and users
      const [
        totalDoctors,
        totalUsers,
        appointments
      ] = await Promise.all([
        userModel.countDocuments({ role: userRole.DOCTOR }),
        userModel.countDocuments({ role: userRole.PATIENT }),
        appointmentModel.find({})
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
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getAppointmentChartStats(timeRange: string): Promise<chartAppointmentStats> {
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date(now);

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
      const slots = await slotModel.aggregate([
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

      const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      };

      let result: chartAppointmentStats = { daily: [], weekly: [], yearly: [] };

      // Generate date range
      const days: Date[] = [];
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

        const count = slots.filter((slot: { created_at: string | number | Date; }) => {
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

          const weekAppointments = slots.filter((slot: { created_at: string | number | Date; }) => {
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

          const monthAppointments = slots.filter((slot: { created_at: string | number | Date; }) => {
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

    } catch (error) {
      console.error('Error getting appointment chart stats:', error);
      throw error;
    }
  }

  async findAppointmentWithSlot(appointmentId: string): Promise<any> {
    try {
      const appointment = await appointmentModel.findOne({ _id: appointmentId })
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
    } catch (error) {
      console.error('Error in findAppointmentWithSlot:', error);
      throw error;
    }
  }

  async findVerifiedDoctorsWithFilters(
    page: number = 1,
    limit: number = 6,
    search: string = "",
    department: string = ""
  ): Promise<{
    doctors: user[];
    totalDoctors: number;
    totalPages: number;
    currentPage: number;
    departments: string[];
  }> {
    try {
      // Build the query
      let query: any = { role: userRole.DOCTOR, verified: true };

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
        userModel.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        userModel.countDocuments(query),
        userModel.distinct('department', { role: userRole.DOCTOR, verified: true })
      ]);

      return {
        doctors,
        totalDoctors,
        totalPages: Math.ceil(totalDoctors / limit),
        currentPage: page,
        departments
      };
    } catch (error) {
      console.error('Error finding verified doctors with filters:', error);
      throw error;
    }
  }

  async createPrescription(prescriptionData: prescription): Promise<prescription> {
    try {
      // Create a new prescription document
      const newPrescription = new prescriptionModel(prescriptionData);

      // Save the prescription to the database
      const savedPrescription = await newPrescription.save();

      return savedPrescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw new Error('Failed to create prescription');
    }
  }

  async updateAppointment(appointmentId: string, status: string): Promise<any> {
    try {
      const updatedAppointment = await appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          status: status,
          updated_at: new Date()
        }
      )

      if (!updatedAppointment) {
        throw new Error('Appointment not found');
      }

      // Log the update for tracking
      console.log(`Appointment ${appointmentId} updated to status: ${status}`);

      return updatedAppointment;
    } catch (error) {

    }
  }

  async getPrescriptions(appointmentId: string): Promise<any> {
    try {
      // First, find the prescription by appointment ID
      const prescriptions = await prescriptionModel
        .find({ appointment_id: appointmentId })
        .lean();
  
      if (!prescriptions || prescriptions.length === 0) {
        return [];
      }
  
      // Get the appointment details to find related user and doctor info
      const appointment = await appointmentModel
        .findById(appointmentId)
        .lean();
  
      if (!appointment) {
        return prescriptions; // Return just prescriptions if appointment not found
      }
  
      // Get user details from appointment
      const patient = await userModel.findById(appointment.user_id).lean();
  
      // Get slot details to find doctor
      const slot = await slotModel.findById(appointment.slot_id).lean();
      
      // Get doctor details from slot
      const doctor = slot ? await userModel.findById(slot.doctor_id).lean() : null;
  
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
    } catch (error) {
      console.error('Error fetching prescription with details:', error);
      throw error;
    }
  }

  async createReview(appointmentid: string, rating: number, reviewText: string, userid: string): Promise<void> {
    try {

      if (!appointmentid || !rating || !reviewText || !userid) {
        throw new Error('All fields are required');
      }


      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const review = new reviewModel({
        appointmentId: appointmentid,
        rating,
        reviewText,
        userId: userid
      });

      const savedReview = await review.save();

      console.log('Review created successfully:', savedReview);

    } catch (error) {
      console.error('Error in createReview:', error);
      throw error;
    }
  }

  async getAllReviews(): Promise<reviewAdminside[]> {
    try {
      // Fetch all reviews from the database with nested population
      const reviews = await reviewModel.find()
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
        const slot = (doc.appointmentId as any)?.slot_id || {};
        const doctorInfo = slot.doctor_id || {};
        const patientInfo = doc.userId as unknown as user || {};

        // Create the review object according to the interface
        return {
          reviewId: doc._id,
          appointmentId: doc.appointmentId,
          doctorName: doctorInfo.username || '',
          doctorProfileImage: doctorInfo.profile_pic || '',
          patientName: patientInfo.username || '',
          patientEmail: (patientInfo as { email?: string }).email || '',
          rating: doc.rating,
          reviewText: doc.reviewText,
          createdAt: doc.createdAt
        } as unknown as reviewAdminside;
      });
    } catch (error) {
      console.error('Error in getAllReviews:', error);
      throw new Error('Failed to retrieve reviews');
    }
  }

  async getDoctorDashboard(doctorId: string): Promise<any> {
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const [statsData, reviewsData, revenueData] = await Promise.all([

      // Stats Aggregation
      appointmentModel.aggregate([
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
      reviewModel.aggregate([
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
      appointmentModel.aggregate([
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

export default new _userRepository();


