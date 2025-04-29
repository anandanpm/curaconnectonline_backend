import { Request, Response } from 'express';
import { AdminService } from '../Services/adminService';
import { IAdminService } from '../Interfaces/iAdminService';
import { userRepository } from '../Repository/userRepository';
import { emailService } from '../Services/emailService';
import jwt from 'jsonwebtoken';


class AdminController {
  constructor(private AdminService: IAdminService) { }


  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, username, email: adminEmail, role, isActive } = await this.AdminService.login(email, password);

      res.cookie('accessToken', accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: 'Admin login successful', username, email: adminEmail, role, isActive });
    } catch (error: any) {
      console.error("Admin Login Error:", error);
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ message: 'Logout successfully' });
    } catch (error) {
      console.error('Logout Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async getPatients(req: Request, res: Response): Promise<void> {
    try {
      let response = await this.AdminService.getPatients();
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) res.status(400).json({ message: error.message });
      else res.status(400).json({ message: 'An unknown error occurred' });
    }
  }

  async togglePatientStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const updatedPatient = await this.AdminService.togglePatientStatus(id, is_active);
      res.status(200).json(updatedPatient);
    } catch (error) {
      console.error('Toggle Patient Status Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async getVerifyDoctors(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this.AdminService.getVerifyDoctors();
      res.status(200).json(doctors);
    } catch (error) {
      console.error('Get Doctors Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this.AdminService.getDoctors();
      res.status(200).json(doctors)

    } catch (error) {
      console.error('Get Doctors Error', error)
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
      else {
        res.status(400).json({ message: 'An unknown error occured' })
      }
    }
  }

  async toggleDoctorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const updatedDoctor = await this.AdminService.toggleDoctorStatus(id);
      console.log(updatedDoctor, 'the updateddoctor from the toggle')
      res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error('Toggle Doctor Status Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async verifyDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const verifiedDoctor = await this.AdminService.verifyDoctor(id);
      console.log(verifiedDoctor, 'is there any  problem in this form the verifydoctor of the admin controller')
      res.status(200).json(verifiedDoctor);
    } catch (error) {
      console.error('Verify Doctor Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async rejectDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { reason } = req.body

      await this.AdminService.rejectDoctor(id, reason)

      res.status(200).json({ message: "Doctor rejected successfully" })
    } catch (error) {
      console.error("Error rejecting doctor:", error)
      res.status(500).json({ message: "An error occurred while rejecting the doctor" })
    }
  }

  async getDashboardMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.AdminService.getDashboardMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      console.error('Get Dashboard Metrics Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async getAppointmentStats(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = req.query.timeRange as string || 'lastWeek';
      const stats = await this.AdminService.getAppointmentChartStats(timeRange);
      console.log(stats, 'the stats is comming or not')
      res.status(200).json(stats);
    } catch (error) {
      console.error('Get Appointment Stats Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
      try {
        const refreshToken = req.cookies.refreshToken;
  
        console.log('Refresh token from cookies:', refreshToken);
  
        // Check if refresh token exists
        if (!refreshToken) {
          console.log('Refresh token not found in cookies');
          // Send a special status code to identify missing refresh token
          res.status(403).json({ 
            message: 'Refresh token not found in cookies',
            tokenState: 'MISSING_REFRESH_TOKEN'
          });
          return;
        }
  
        // Verify the token
        try {
          if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
          }
          const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
          console.log(decoded, 'is the decoded is coming or not');
  
          // Generate new tokens
          const userId = (decoded as jwt.JwtPayload).userId;
          const role = (decoded as jwt.JwtPayload).role;
          console.log(userId, 'the userid is comming or not')
  
          const newAccessToken = jwt.sign(
            { userId: userId, role: role },
            process.env.JWT_SECRET || '',
            { expiresIn: '15m' }
          );
  
          const newRefreshToken = jwt.sign(
            { userId: userId, role: role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
          );
  
          // Set the new tokens as cookies
          res.cookie('accessToken', newAccessToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
            maxAge: 15 * 60 * 1000 // 15 minutes
          });
  
          res.cookie('refreshToken', newRefreshToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
  
          res.status(200).json({ 
            message: 'Token refreshed successfully',
            accessToken: newAccessToken
          });
          return;
        } catch (error) {
          console.error('Token verification error:', error);
          res.status(403).json({ 
            message: 'Invalid refresh token',
            tokenState: 'INVALID_REFRESH_TOKEN'
          });
          return;
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await this.AdminService.getReviews();
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Get Reviews Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unknown error occurred' });
      }
    }
  }

}

export const adminController = new AdminController(new AdminService(userRepository, emailService));

