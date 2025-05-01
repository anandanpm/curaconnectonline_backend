import { AdminLoginResponse, Review, ReviewAdminside, User, UserRole } from "../Interfaces/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userRepository } from "../Repository/userRepository";
import { IUserRepository } from "../Interfaces/iUserRepository";
import { ChartAppointmentStats, DashboardStats } from "../Interfaces/appointment";
import { IAdminService } from "../Interfaces/iAdminService";
import { IEmailService } from "../Interfaces/iEmailService";
import { emailService } from "./emailService";
dotenv.config();

export class AdminService implements IAdminService{
    constructor(private userRepository: IUserRepository,private emailService:IEmailService){}
    
  async login(email: string, password: string):Promise<AdminLoginResponse> {
    try {
      const admin = await this.userRepository.findUserByEmail(email);
      if (!admin || admin.role !== UserRole.ADMIN) {
        throw new Error("Invalid credentials");
      }

      const passwordMatch = await bcrypt.compare(password, admin.password!);
      if (!passwordMatch) {
        throw new Error("Invalid credentials");
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }

      const accessToken = jwt.sign(
        { userId: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
      }

      const refreshToken = jwt.sign(
        { userId: admin._id, role: admin.role  },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      return {
        accessToken,
        refreshToken,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active??true,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPatients(): Promise<User[]> {
    try {
      const users = await this.userRepository.findAllUsers();

      const patients = users.filter((user) => user.role === "patient");

      return patients;
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  }

  async togglePatientStatus(
    id: string,
    is_active: boolean
  ): Promise<User | null> {
    try {
      const user = await this.userRepository.findUserById(id);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role !== UserRole.PATIENT) {
        throw new Error("User is not a patient");
      }

      const updatedUser = await this.userRepository.updateUserStatus(id, is_active);
      return updatedUser;
    } catch (error) {
      console.error("Error toggling patient status:", error);
      throw error;
    }
  }

  async getVerifyDoctors(): Promise<User[]> {
    try {
      return await this.userRepository.findAllVerifyDoctors();
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  }

  async getDoctors(): Promise<User[]> {
    try {
      return await this.userRepository.findAllDoctors();
    } catch (error) {
      console.error("Error fetching doctor", error);
      throw error;
    }
  }

  async rejectDoctor(id: string, reason: string): Promise<void> {
    try {
      const doctor = await this.userRepository.findUserById(id)

      if (!doctor) {
        throw new Error("Doctor not found")
      }

      if (doctor.role !== UserRole.DOCTOR) {
        throw new Error("User is not a doctor")
      }

      // Send rejection email
      await this.emailService.sendRejectionEmail(doctor.email, reason)

      // Remove doctor from the database
      await this.userRepository.removeUser(id)
    } catch (error) {
      console.error("Error rejecting doctor:", error)
      throw error
    }
  }

  async toggleDoctorStatus(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findUserById(id);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role !== UserRole.DOCTOR) {
        throw new Error("User is not a doctor");
      }
      const newStatus = !user.is_active;

      return await this.userRepository.updateUserStatus(id, newStatus);
    } catch (error) {
      console.error("Error toggling doctor status:", error);
      throw error;
    }
  }

    async verifyDoctor(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findUserById(id)

      if (!user) {
        throw new Error("User not found")
      }

      if (user.role !== UserRole.DOCTOR) {
        throw new Error("User is not a doctor")
      }

      const is_verified = true // Always set to true when approving
      const updatedUser = await this.userRepository.updateDoctorVerification(id, is_verified)

      if (updatedUser && is_verified) {
        // Send approval email
        await this.emailService.sendApprovalEmail(updatedUser.email)
      }

      return updatedUser
    } catch (error) {
      console.error("Error verifying doctor:", error)
      throw error
    }
  }

  async getDashboardMetrics(): Promise<DashboardStats> {
    try {
      const stats = await this.userRepository.getDashboardStats();
      console.log(stats,'is the stats is comming or not')
      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  async getAppointmentChartStats(timeRange: string): Promise<ChartAppointmentStats> {
    try {
      return await this.userRepository.getAppointmentChartStats(timeRange);
    } catch (error) {
      console.error('Error fetching appointment chart stats:', error);
      throw error;
    }
  }

  async getReviews(): Promise<ReviewAdminside[]> {
    try {
      const reviews = await this.userRepository.getAllReviews();
      console.log('review is comming or not ',reviews)
      return reviews;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error fetching reviews');
    }
  }

}

export const adminService = new AdminService(userRepository,emailService);
