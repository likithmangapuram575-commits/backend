import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import pool from '../config/db';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendOTPEmail = async (email: string, otp: string) => {
  // Fetch college name from settings
  let collegeName = 'College ERP';
  try {
    const [rows]: any = await pool.query('SELECT college_name FROM settings LIMIT 1');
    if (rows.length > 0) collegeName = rows[0].college_name;
  } catch (err) {
    console.error('Failed to fetch college name for email');
  }

  const mailOptions = {
    from: `"${collegeName} Admin" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Verification Code for ${collegeName}`,
    html: `
      <html>
        <body style="font-family: Arial; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 10px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin-bottom: 24px;">${collegeName} Login</h2>
            
            <p style="color: #4b5563; font-size: 16px;">Dear Student,</p>
            
            <p style="color: #4b5563; font-size: 16px;">Your verification code is:</p>
            
            <h1 style="text-align: center; color: #111111; font-size: 48px; letter-spacing: 8px; margin: 32px 0;">${otp}</h1>
            
            <p style="color: #4b5563; font-size: 16px;">This code is valid for <b>5 minutes</b>.</p>
            
            <p style="color: #ef4444; font-weight: bold; font-size: 14px;">Do not share this code with anyone.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="font-size: 12px; color: #9ca3af;">
              If you didn’t request this, please ignore this email.
            </p>
            
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              Regards,<br>
              <b style="color: #0f172a;">Admin Team</b><br>
              ${collegeName}
            </p>
          </div>
        </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};
