export interface IOtpService {
  generateOTP(): string;
  generateOtpExpiration(): Date;
  sendOTPEmail(email: string, otp: string): Promise<boolean>;
  validateOTP(storedOtp: string, storedExpiration: Date, userProvidedOtp: string): boolean;
}