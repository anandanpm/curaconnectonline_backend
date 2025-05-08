import { prescription } from "../Interfaces/prescription";
import { slot } from "../Interfaces/slot";
import { dashboardResponseType, doctorAppointment, doctorDetails, doctorLoginResponse, doctorSignupRequest, doctorSignupResponse, doctorSlotRequest, loginResponse, otpResponse, user } from "../Interfaces/user";

export interface IdoctorService {
  signup(userData: doctorSignupRequest): Promise<doctorSignupResponse>;

  verifyOtp(email: string, otp: string): Promise<otpResponse>;

  login(email: string, password: string): Promise<doctorLoginResponse>;

  resendOtp(email: string): Promise<otpResponse>;

  googleAuth(token: string): Promise<loginResponse>;

  profile(docDetails: user & doctorDetails): Promise<user & doctorDetails>;

  addSlots(slotData: doctorSlotRequest): Promise<slot>;

  getSlots(doctorId: string): Promise<slot[]>;

  getDoctorAppointments(doctorId: string): Promise<doctorAppointment[]>;

  checkAppointmentValidity(appointmentId: string): Promise<boolean>;

  resetPassword(
    doctorId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<otpResponse>;

  sendForgottenpassword(email: string): Promise<otpResponse>;

  verifyForgottenpassword(email: string, otpString: string): Promise<otpResponse>;

  resetForgottenpassword(email: string, password: string): Promise<otpResponse>;

  prescription(prescriptionData: prescription): Promise<prescription>;

  completeAppointment(appointmentId: string): Promise<doctorAppointment>;

  getDetailsDashboard(doctorId: string): Promise<dashboardResponseType>;
  
  deleteSlot(slotId: string): Promise<slot>;
}
