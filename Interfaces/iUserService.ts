import { User, LoginResponse, SignupResponse } from './user';
import { AppointmentDetails, AppointmentData, RefundResponse, AppointmentResponse } from './appointment';
import { Slot } from './slot';
import { Prescription } from './prescription';


export interface IUserService {
  findUserById(userId: any): unknown;

  signup(username: string, email: string, password: string): Promise<SignupResponse>;

  verifyOtp(email: string, otp: string): Promise<{
    message: string;
  }>;

  login(email: string, password: string): Promise<LoginResponse>;

  resendOtp(email: string): Promise<{
    message: string;
  }>;

  googleAuth(token: string): Promise<LoginResponse>;

  profile(userdetails: User): Promise<User>;


  getDoctors(page: number, limit: number, search: string, department: string): Promise<{
    doctors: User[];
    totalDoctors: number;
    totalPages: number;
    currentPage: number;
    departments: string[];
  }>;

  getDoctorSlots(doctorId: string): Promise<Slot[]>;

  createPaymentIntent(amount: number): Promise<string | null>;

  createAppointment(appointmentData: AppointmentData): Promise<AppointmentResponse>;

  getAppointmentDetails(userId: string, page: number, pageSize: number): Promise<{
    appointments: AppointmentDetails[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;

  refundPayment(appointmentId: string): Promise<RefundResponse>;

  getcancelandcompleteAppointmentDetails(
    userId: string,
    page?: number,
    limit?: number,
    status?: string
  ): Promise<{
    appointments: AppointmentDetails[];
    totalCount: number;
    totalPages: number;
  }>;


  resetPassword(userId: string, oldPassword: string, newPassword: string): Promise<{
    message: string;
  }>;

  sendForgottenpassword(email: string): Promise<{
    message: string;
  }>;

  verifyForgottenpassword(email: string, otpString: string): Promise<{
    message: string;
  }>;

  resetForgottenpassword(email: string, password: string): Promise<{
    message: string;
  }>;
  getPrescriptions(appointmentId: string): Promise<Prescription[]>

  reviews(appointmentid: string, rating: number, reviewText: string, userid: string): Promise<{ message: string }>;
}