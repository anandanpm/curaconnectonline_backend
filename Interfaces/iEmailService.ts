export interface IEmailService {
  sendRejectionEmail(email: string, reason: string): Promise<boolean>;
  sendApprovalEmail(email: string): Promise<boolean>;
  sendAppointmentConfirmation(
    patientEmail: string,
    appointmentDetails: {
      doctorName: string;
      department: string;
      day: string;
      startTime: string;
      endTime: string;
      amount: number;
      status: string;
    }
  ): Promise<boolean>;
}