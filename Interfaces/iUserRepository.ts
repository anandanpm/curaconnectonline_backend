import { Types } from "mongoose";
import { Appointment, AppointmentDetails, AppointmentData, DashboardStats, ChartAppointmentStats } from "./appointment";
import { DashboardResponseType, DoctorAppointment, Review, ReviewAdminside, User, UserRole } from "./user";
import { Prescription } from "./prescription";



export interface IUserRepository {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userid: string): Promise<User | null>;
  findDoctorById(doctorid: string): Promise<User | null>;
  updateUser(user: User): Promise<User | null>;
  updateUserProfile(userid: string, updateData: Partial<User>): Promise<User | null>;
  findAllUsers(): Promise<User[]>;
  updateUserStatus(userid: string, isActive: boolean): Promise<User | null>;
  findAllVerifyDoctors(): Promise<User[]>;
  findAllDoctors(): Promise<User[]>;
  updateDoctorVerification(doctorid: string, isVerified: boolean): Promise<User | null>;
  findUsersByRole(userRole: UserRole): Promise<User[]>;
  removeUser(id: string): Promise<void>;
  createAppointment(appointmentData: AppointmentData): Promise<Appointment>;
  findAppointmentBySlotId(slotId: string): Promise<Appointment | null>;
  findAppointmentById(appointmentId: string): Promise<Appointment | null>;
  findAppointmentsByDoctorId(doctorId: string): Promise<AppointmentDetails[]>;

  findPendingAppointmentsByUserId(userId: string, page: number, pageSize: number): Promise<{
    appointments: any[];
    totalCount: number;
  }>;

  findcancelandcompleteAppointmentsByUserId(
    userId: string,
    status?: string,
    skip?: number,
    limit?: number
  ): Promise<AppointmentDetails[]>;

  getDashboardStats(): Promise<DashboardStats>;
  getAppointmentChartStats(timeRange: string): Promise<ChartAppointmentStats>;
  findAppointmentWithSlot(appointmentId: string): Promise<AppointmentDetails | null>;
  findVerifiedDoctorsWithFilters(
    page?: number,
    limit?: number,
    search?: string,
    department?: string
  ): Promise<{
    doctors: User[];
    totalDoctors: number;
    totalPages: number;
    currentPage: number;
    departments: string[];
  }>;
  createPrescription(prescriptionData: Prescription): Promise<Prescription>;
  updateAppointment(appointmentId: string, status: string): Promise<DoctorAppointment>;
  getPrescriptions(appointmentId: string): Promise<Prescription[]>;
  createReview: (appointmentid: string, rating: number, reviewText: string, userid: string) => any
  getAllReviews: () => Promise<ReviewAdminside[]>
  getDoctorDashboard(doctorId: string): Promise<DashboardResponseType>;
}