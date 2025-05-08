import { Request, Response } from 'express';
import  {_doctorService } from '../Services/doctorService'
import { IdoctorService } from '../Entities/iDoctorService';
import  _userRepository  from '../Repository/userRepository';
import  _slotRepository  from '../Repository/slotRepository';
import _otpService  from '../Services/otpService';
import jwt from 'jsonwebtoken';


class doctorController {
  constructor(private _doctorService: IdoctorService) { }

  async getOtp(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const result = await this._doctorService.signup(userData);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Signup Error:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await this._doctorService.verifyOtp(email, otp);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return
      }

      const result = await this._doctorService.resendOtp(email);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Resend OTP Error:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { Email, password } = req.body;
      const { accessToken, refreshToken, username, email, isActive, role, profile_pic, age, phone, certification, experience, department, medical_license, address, clinic_name, about, education, gender, _id } = await this._doctorService.login(Email, password);

      // res.cookie('accessToken',accessToken, {
      //   httpOnly: true,
      //   secure: true, // Required for HTTPS
      //   sameSite: 'none', // Required for cross-site cookies
      //   maxAge: 24 * 60 * 60 * 1000, // 1 day
      // });
  
      // res.cookie('refreshToken', refreshToken, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: 'none',
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // });

      res.cookie('accessToken', accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ message: 'Login successful', username, email: Email, role, isActive, profile_pic, age, phone, certification, experience, department, medical_license, address, clinic_name, about, gender, education, _id });
    } catch (error: any) {
      console.error("Login Error:", error);
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

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const result = await this._doctorService.googleAuth(token);

      // res.cookie('accessToken', result.accessToken, {
      //   httpOnly: true,
      //   secure: true, // Required for HTTPS
      //   sameSite: 'none', // Required for cross-site cookies
      //   maxAge: 24 * 60 * 60 * 1000, // 1 day
      // });
  
      // res.cookie('refreshToken', result.refreshToken, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: 'none',
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // });

      res.cookie('accessToken', result.accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', result.refreshToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });


      res.status(200).json({
        message: 'Google authentication successful',
        username: result.username,
        email: result.email,
        role: result.role,
        isActive: result.isActive,
        profile_pic: result.profile_pic,
        phone: result.phone,
        age: result.age,
        gender: result.gender,
        address: result.address,
        _id: result._id,
        experience: result.experience,
        certification: result.certification,
        department: result.department,
        medical_license: result.medical_license,
        clinic_name: result.clinic_name,
        about: result.about,
        education: result.education
      });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const docDetails = req.body;
      console.log('Incoming profile update request:', docDetails);

      const updatedDoc = await this._doctorService.profile(docDetails);
      console.log(updatedDoc, 'the updated one is comming or not')

      res.status(200).json({ message: 'Profile updated successfully', updatedDoc });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async addSlots(req: Request, res: Response): Promise<void> {
    try {
      const slotData = req.body.slots;
      console.log('Incoming slot request:', req.body);
      const result = await this._doctorService.addSlots(slotData);
      res.status(200).json({ message: 'slot added successfully', result });

    } catch (error) {
      console.error('Error adding slots:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params
      console.log(doctorId)
      const result = await this._doctorService.getSlots(doctorId)
      res.status(200).json(result)
    } catch (error) {

    }
  }


  async getAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      console.log(doctorId, 'the doctor id is coming');

      const appointments = await this._doctorService.getDoctorAppointments(doctorId);
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  }

  async checkAppointmentTime(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      console.log(`Checking appointment time for appointment: ${appointmentId}`);

      if (!appointmentId) {
        res.status(400).json({
          allowed: false,
          message: 'Appointment ID is required'
        });
        return;
      }

      const isValidTime = await this._doctorService.checkAppointmentValidity(appointmentId);
      console.log(isValidTime, 'is this is comming or not')

      res.status(200).json({
        allowed: isValidTime,
        message: isValidTime ? 'Appointment time is valid' : 'You time is not reached'
      });
    } catch (error) {
      console.error('Error checking appointment time:', error);
      res.status(500).json({
        allowed: false,
        message: 'Failed to check appointment time'
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body)
      const { doctorId, oldPassword, newPassword } = req.body
      const result = await this._doctorService.resetPassword(doctorId, oldPassword, newPassword)
      res.status(200).json(result)

    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  }


  async sendForgottenpassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body
      let result = await this._doctorService.sendForgottenpassword(email)
      res.status(200).json(result)
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }
  }

  async verifyForgottenpassword(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body)
      const { email, otpString } = req.body
      let result = await this._doctorService.verifyForgottenpassword(email, otpString)
      res.status(200).json(result)

    } catch (error) {
      res.status(500).json(error)
    }
  }

  async resetForgottenpassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body
      console.log(req.body)
      let result = await this._doctorService.resetForgottenpassword(email, password)
      res.status(200).json(result)

    } catch (error) {
      res.status(500).json(error)
    }
  }

  async prescription(req: Request, res: Response): Promise<void> {
    try {
      const prescriptionData = req.body
      console.log('Incoming prescription request:', prescriptionData);
      const result = await this._doctorService.prescription(prescriptionData);
      console.log(result, 'the prescription is added successfully')
      res.status(200).json({ message: 'prescription added successfully', result });
    }
    catch (error) {
      res.status(500).json(error)
    }
  }

  async completeAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const result = await this._doctorService.completeAppointment(appointmentId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error completing appointment:', error);
      res.status(500).json({ message: 'Failed to complete appointment' });
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

  async getDetailsDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      console.log(doctorId, 'the doctor id is coming');

      const details = await this._doctorService.getDetailsDashboard(doctorId);
      res.status(200).json(details);
    } catch (error) {
      console.error('Error fetching details:', error);
      res.status(500).json({ message: 'Failed to fetch details' });
    }
  }

  async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const { slotId } = req.params;
      console.log(slotId, 'the slot id is coming');

      const result = await this._doctorService.deleteSlot(slotId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error deleting slot:', error);
      res.status(500).json({ message: 'Failed to delete slot' });
    }
  }
}


export default new doctorController(new _doctorService(_userRepository, _slotRepository, _otpService));