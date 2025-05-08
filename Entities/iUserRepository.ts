import { Types } from "mongoose";
import { appointment, appointmentDetails, appointmentData, dashboardStats, chartAppointmentStats } from "../Interfaces/appointment";
import { dashboardResponseType, doctorAppointment, review, reviewAdminside, user, userRole } from "../Interfaces/user";
import { prescription } from "../Interfaces/prescription";



export interface IuserRepository {
  createUser(user: user): Promise<user>;
  findUserByEmail(email: string): Promise<user | null>;
  findUserById(userid: string): Promise<user | null>;
  findDoctorById(doctorid: string): Promise<user | null>;
  updateUser(user: user): Promise<user | null>;
  updateUserProfile(userid: string, updateData: Partial<user>): Promise<user | null>;
  findAllUsers(): Promise<user[]>;
  updateUserStatus(userid: string, isActive: boolean): Promise<user | null>;
  findAllVerifyDoctors(): Promise<user[]>;
  findAllDoctors(): Promise<user[]>;
  updateDoctorVerification(doctorid: string, isVerified: boolean): Promise<user | null>;
  findUsersByRole(userRole: userRole): Promise<user[]>;
  removeUser(id: string): Promise<void>;
  createAppointment(appointmentData: appointmentData): Promise<appointment>;
  findAppointmentBySlotId(slotId: string): Promise<appointment | null>;
  findAppointmentById(appointmentId: string): Promise<appointment | null>;
  findAppointmentsByDoctorId(doctorId: string): Promise<appointmentDetails[]>;

  findPendingAppointmentsByUserId(userId: string, page: number, pageSize: number): Promise<{
    appointments: any[];
    totalCount: number;
  }>;

  findcancelandcompleteAppointmentsByUserId(
    userId: string,
    status?: string,
    skip?: number,
    limit?: number
  ): Promise<appointmentDetails[]>;

  getDashboardStats(): Promise<dashboardStats>;
  getAppointmentChartStats(timeRange: string): Promise<chartAppointmentStats>;
  findAppointmentWithSlot(appointmentId: string): Promise<appointmentDetails | null>;
  findVerifiedDoctorsWithFilters(
    page?: number,
    limit?: number,
    search?: string,
    department?: string
  ): Promise<{
    doctors: user[];
    totalDoctors: number;
    totalPages: number;
    currentPage: number;
    departments: string[];
  }>;
  createPrescription(prescriptionData: prescription): Promise<prescription>;
  updateAppointment(appointmentId: string, status: string): Promise<doctorAppointment>;
  getPrescriptions(appointmentId: string): Promise<prescription[]>;
  createReview: (appointmentid: string, rating: number, reviewText: string, userid: string) => any
  getAllReviews: () => Promise<reviewAdminside[]>
  getDoctorDashboard(doctorId: string): Promise<dashboardResponseType>;
}