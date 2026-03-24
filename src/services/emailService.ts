export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (params: EmailParams) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Email Service Error:', error);
    throw error;
  }
};

export const emailTemplates = {
  applicationConfirmation: (name: string) => ({
    subject: 'Application Received - RVSL Recruitment Platform',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h1 style="color: #ea580c; margin-bottom: 24px;">Application Received!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for applying to the RVSL Recruitment Platform. We have received your application and our team will review it shortly.</p>
        <p>You can track your application status by logging into your candidate dashboard.</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
          Best regards,<br>
          The RVSL Team
        </div>
      </div>
    `
  }),
  statusUpdate: (name: string, status: string) => ({
    subject: `Application Status Updated: ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h1 style="color: #ea580c; margin-bottom: 24px;">Status Update</h1>
        <p>Hi ${name},</p>
        <p>Your application status has been updated to: <strong>${status}</strong>.</p>
        <p>Please log in to your dashboard for more details and next steps.</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
          Best regards,<br>
          The RVSL Team
        </div>
      </div>
    `
  })
};
