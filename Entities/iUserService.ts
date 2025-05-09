import { user, loginResponse, signupResponse } from '../Interfaces/user';
import { appointmentDetails, appointmentData, refundResponse, appointmentResponse, AppointmentResult, AppointmentData } from '../Interfaces/appointment';
import { slot } from '../Interfaces/slot';
import { prescription } from '../Interfaces/prescription';


export interface IuserService {
  lockSlot(slotId: any, userId: any, expiresAt: Date): unknown;
  findUserById(userId: any): unknown;

  signup(username: string, email: string, password: string): Promise<signupResponse>;

  verifyOtp(email: string, otp: string): Promise<{
    message: string;
  }>;

  login(email: string, password: string): Promise<loginResponse>;

  resendOtp(email: string): Promise<{
    message: string;
  }>;

  googleAuth(token: string): Promise<loginResponse>;

  profile(userdetails: user): Promise<user>;


  getDoctors(page: number, limit: number, search: string, department: string): Promise<{
    doctors: user[];
    totalDoctors: number;
    totalPages: number;
    currentPage: number;
    departments: string[];
  }>;

  getStatus(userId: string): Promise<boolean>;

  getDoctorSlots(doctorId: string): Promise<slot[]>;

  createPaymentIntent(amount: number): Promise<string | null>;

  // createAppointment(appointmentData: appointmentData): Promise<appointmentResponse>;
  createAppointment(appointmentData: AppointmentData): Promise<AppointmentResult>

  getAppointmentDetails(userId: string, page: number, pageSize: number): Promise<{
    appointments: appointmentDetails[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;

  refundPayment(appointmentId: string): Promise<refundResponse>;

  getcancelandcompleteAppointmentDetails(
    userId: string,
    page?: number,
    limit?: number,
    status?: string
  ): Promise<{
    appointments: appointmentDetails[];
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
  getPrescriptions(appointmentId: string): Promise<prescription[]>

  reviews(appointmentid: string, rating: number, reviewText: string, userid: string): Promise<{ message: string }>;
}