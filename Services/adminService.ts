import { adminLoginResponse, review, reviewAdminside, user, userRole } from "../Interfaces/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import  _userRepository  from "../Repository/userRepository";
import { IuserRepository } from "../Entities/iUserRepository";
import { chartAppointmentStats, dashboardStats } from "../Interfaces/appointment";
import { IadminService } from "../Entities/iAdminService";
import { IemailService } from "../Entities/iEmailService";
import  _emailService  from "./emailService";
dotenv.config();

export class _adminService implements IadminService{
    constructor(private _userRepository: IuserRepository,private _emailService:IemailService){}
    
  async login(email: string, password: string):Promise<adminLoginResponse> {
    try {
      const admin = await this._userRepository.findUserByEmail(email);
      if (!admin || admin.role !== userRole.ADMIN) {
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

  async getPatients(): Promise<user[]> {
    try {
      const users = await this._userRepository.findAllUsers();

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
  ): Promise<user | null> {
    try {
      const user = await this._userRepository.findUserById(id);

      if (!user) {
        throw new Error("user not found");
      }

      if (user.role !== userRole.PATIENT) {
        throw new Error("user is not a patient");
      }

      const updatedUser = await this._userRepository.updateUserStatus(id, is_active);
      return updatedUser;
    } catch (error) {
      console.error("Error toggling patient status:", error);
      throw error;
    }
  }

  async getVerifyDoctors(): Promise<user[]> {
    try {
      return await this._userRepository.findAllVerifyDoctors();
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  }

  async getDoctors(): Promise<user[]> {
    try {
      return await this._userRepository.findAllDoctors();
    } catch (error) {
      console.error("Error fetching doctor", error);
      throw error;
    }
  }

  async rejectDoctor(id: string, reason: string): Promise<void> {
    try {
      const doctor = await this._userRepository.findUserById(id)

      if (!doctor) {
        throw new Error("Doctor not found")
      }

      if (doctor.role !== userRole.DOCTOR) {
        throw new Error("user is not a doctor")
      }

      // Send rejection email
      await this._emailService.sendRejectionEmail(doctor.email, reason)

      // Remove doctor from the database
      await this._userRepository.removeUser(id)
    } catch (error) {
      console.error("Error rejecting doctor:", error)
      throw error
    }
  }

  async toggleDoctorStatus(id: string): Promise<user | null> {
    try {
      const user = await this._userRepository.findUserById(id);

      if (!user) {
        throw new Error("user not found");
      }

      if (user.role !== userRole.DOCTOR) {
        throw new Error("user is not a doctor");
      }
      const newStatus = !user.is_active;

      return await this._userRepository.updateUserStatus(id, newStatus);
    } catch (error) {
      console.error("Error toggling doctor status:", error);
      throw error;
    }
  }

    async verifyDoctor(id: string): Promise<user | null> {
    try {
      const user = await this._userRepository.findUserById(id)

      if (!user) {
        throw new Error("user not found")
      }

      if (user.role !== userRole.DOCTOR) {
        throw new Error("user is not a doctor")
      }

      const is_verified = true // Always set to true when approving
      const updatedUser = await this._userRepository.updateDoctorVerification(id, is_verified)

      if (updatedUser && is_verified) {
        // Send approval email
        await this._emailService.sendApprovalEmail(updatedUser.email)
      }

      return updatedUser
    } catch (error) {
      console.error("Error verifying doctor:", error)
      throw error
    }
  }

  async getDashboardMetrics(): Promise<dashboardStats> {
    try {
      const stats = await this._userRepository.getDashboardStats();
      console.log(stats,'is the stats is comming or not')
      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  async getAppointmentChartStats(timeRange: string): Promise<chartAppointmentStats> {
    try {
      return await this._userRepository.getAppointmentChartStats(timeRange);
    } catch (error) {
      console.error('Error fetching appointment chart stats:', error);
      throw error;
    }
  }

  async getReviews(): Promise<reviewAdminside[]> {
    try {
      const reviews = await this._userRepository.getAllReviews();
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

export default new _adminService(_userRepository,_emailService);
