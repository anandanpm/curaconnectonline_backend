import { Prescription } from "./prescription";
import { Slot } from "./slot";
import { DashboardResponseType, DoctorAppointment, DoctorDetails, DoctorLoginResponse, DoctorSignupRequest, DoctorSignupResponse, DoctorSlotRequest, LoginResponse, OtpResponse, User } from "./user";

export interface IDoctorService {
  signup(userData: DoctorSignupRequest): Promise<DoctorSignupResponse>;

  verifyOtp(email: string, otp: string): Promise<OtpResponse>;

  login(email: string, password: string): Promise<DoctorLoginResponse>;

  resendOtp(email: string): Promise<OtpResponse>;

  googleAuth(token: string): Promise<LoginResponse>;

  profile(docDetails: User & DoctorDetails): Promise<User & DoctorDetails>;

  addSlots(slotData: DoctorSlotRequest): Promise<Slot>;

  getSlots(doctorId: string): Promise<Slot[]>;

  getDoctorAppointments(doctorId: string): Promise<DoctorAppointment[]>;

  checkAppointmentValidity(appointmentId: string): Promise<boolean>;

  resetPassword(
    doctorId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<OtpResponse>;

  sendForgottenpassword(email: string): Promise<OtpResponse>;

  verifyForgottenpassword(email: string, otpString: string): Promise<OtpResponse>;

  resetForgottenpassword(email: string, password: string): Promise<OtpResponse>;

  prescription(prescriptionData: Prescription): Promise<Prescription>;

  completeAppointment(appointmentId: string): Promise<DoctorAppointment>;

  getDetailsDashboard(doctorId: string): Promise<DashboardResponseType>;
  
  deleteSlot(slotId: string): Promise<Slot>;
}
