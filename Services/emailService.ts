import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { IEmailService } from "../Interfaces/iEmailService"

dotenv.config()

class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false 
      }
    })
  }

  async sendRejectionEmail(email: string, reason: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Curra_Connect: Doctor Application Rejected",
        text: `
          Dear Doctor,

          We regret to inform you that your application to join Curra_Connect has been rejected.

          Reason for rejection: ${reason}

          If you have any questions or would like to appeal this decision, please contact our support team at support@curra_connect.com.

          Thank you for your interest in Curra_Connect.

          Best regards,
          The Curra_Connect Team
        `,
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error("Rejection Email Error:", error)
      return false
    }
  }

  async sendApprovalEmail(email: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Curra_Connect: Doctor Application Approved",
        text: `
          Dear Doctor,

          Congratulations! Your application to join Curra_Connect has been approved.

          You can now log in to your account and start taking appointments. We're excited to have you on board and look forward to your valuable contributions to our platform.

          If you have any questions or need assistance getting started, please don't hesitate to contact our support team at support@curra_connect.com.

          Welcome to Curra_Connect!

          Best regards,
          The Curra_Connect Team
        `,
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error("Approval Email Error:", error)
      return false
    }
  }

  async sendAppointmentConfirmation(
    patientEmail: string,
    appointmentDetails: {
      doctorName: string
      department: string
      day: string
      startTime: string
      endTime: string
      amount: number
      status: string
    }
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: patientEmail,
        subject: "Curra_Connect: Appointment Confirmation",
        text: `
          Dear Patient,

          Your appointment has been successfully booked with Curra_Connect.

          Appointment Details:
          - Doctor: Dr. ${appointmentDetails.doctorName}
          - Department: ${appointmentDetails.department}
          - Day: ${appointmentDetails.day}
          - Time: ${appointmentDetails.startTime} - ${appointmentDetails.endTime}
          - Amount Paid: $${appointmentDetails.amount}
          - Status: ${appointmentDetails.status}

          Please make sure to arrive 10 minutes before your scheduled appointment time.

          For any questions or assistance, please contact our support team at support@curra_connect.com.

          Thank you for choosing Curra_Connect!

          Best regards,
          The Curra_Connect Team
        `,
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error("Appointment Confirmation Email Error:", error)
      return false
    }
  }
}

export const emailService = new EmailService()

