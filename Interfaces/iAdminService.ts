import { ChartAppointmentStats, DashboardStats } from "./appointment";
import { AdminLoginResponse, Review, ReviewAdminside, User } from "./user";

export interface IAdminService {

  login(email: string, password: string): Promise<AdminLoginResponse>;

  getPatients(): Promise<User[]>;

  togglePatientStatus(
    id: string,
    is_active: boolean
  ): Promise<User | null>;

  getVerifyDoctors(): Promise<User[]>;

  getDoctors(): Promise<User[]>;

  rejectDoctor(id: string, reason: string): Promise<void>;

  toggleDoctorStatus(id: string): Promise<User | null>;

  verifyDoctor(id: string): Promise<User | null>;

  getDashboardMetrics(): Promise<DashboardStats>;

  getAppointmentChartStats(timeRange: string): Promise<ChartAppointmentStats>;

  getReviews(): Promise<ReviewAdminside[]>;
}