import { chartAppointmentStats, dashboardStats } from "../Interfaces/appointment";
import { adminLoginResponse, review, reviewAdminside, user } from "../Interfaces/user";

export interface IadminService {

  login(email: string, password: string): Promise<adminLoginResponse>;

  getPatients(): Promise<user[]>;

  togglePatientStatus(
    id: string,
    is_active: boolean
  ): Promise<user | null>;

  getVerifyDoctors(): Promise<user[]>;

  getDoctors(): Promise<user[]>;

  rejectDoctor(id: string, reason: string): Promise<void>;

  toggleDoctorStatus(id: string): Promise<user | null>;

  verifyDoctor(id: string): Promise<user | null>;

  getDashboardMetrics(): Promise<dashboardStats>;

  getAppointmentChartStats(timeRange: string): Promise<chartAppointmentStats>;

  getReviews(): Promise<reviewAdminside[]>;
}