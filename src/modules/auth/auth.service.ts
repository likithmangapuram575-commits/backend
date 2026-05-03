import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db';
import { sendOTPEmail } from '../../utils/mailer';
import crypto from 'crypto';

export const authenticateUser = async (phone: string, password: string) => {
  const [rows]: any = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
  const user = rows[0];

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  let studentData = {};
  if (user.role === 'Student') {
    const [students]: any = await pool.query('SELECT id, roll_no FROM students WHERE user_id = ?', [user.id]);
    if (students.length > 0) {
      studentData = { 
        id: students[0].id, // Use student ID as the primary ID for the session
        roll_no: students[0].roll_no 
      };
    }
  }

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role, ...(user.role === 'Student' ? { studentId: (studentData as any).id } : {}) },
    process.env.JWT_SECRET || 'supersecretjwtkey123',
    { expiresIn: '1d' }
  );

  return {
    user: { 
      ...user, 
      ...studentData,
      id: user.role === 'Student' ? (studentData as any).id || user.id : user.id 
    },
    token
  };
};

export const requestOTP = async (email: string) => {
  // 1. Check if student exists
  const [students]: any = await pool.query('SELECT id, name FROM students WHERE email = ?', [email]);
  if (students.length === 0) {
    throw new Error('Student with this email not found');
  }

  // 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  // 3. Save OTP to database
  await pool.query('DELETE FROM otp_verification WHERE email = ?', [email]); // Remove old ones
  await pool.query(
    'INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt]
  );

  // 4. Send Email (in production, handle error properly)
  try {
    await sendOTPEmail(email, otp);
  } catch (err) {
    console.error('Email failed to send:', err);
    // Even if email fails in dev, we return success so user can check logs if needed
  }

  return { message: 'OTP sent to your email' };
};

export const verifyOTP = async (email: string, otp: string) => {
  // 1. Find valid OTP
  const [records]: any = await pool.query(
    'SELECT * FROM otp_verification WHERE email = ? AND otp = ? AND expires_at > NOW() AND attempts < 3',
    [email, otp]
  );

  if (records.length === 0) {
    // Increment attempts for the email if OTP was wrong
    await pool.query('UPDATE otp_verification SET attempts = attempts + 1 WHERE email = ?', [email]);
    throw new Error('Invalid or expired OTP');
  }

  // 2. Get student details
  const [students]: any = await pool.query('SELECT id, name, roll_no FROM students WHERE email = ?', [email]);
  const student = students[0];

  // 3. Generate JWT
  const token = jwt.sign(
    { id: student.id, email, role: 'Student' },
    process.env.JWT_SECRET || 'supersecretjwtkey123',
    { expiresIn: '7d' } // Students stay logged in longer
  );

  // 4. Cleanup OTP
  await pool.query('DELETE FROM otp_verification WHERE email = ?', [email]);

  return {
    user: { id: student.id, name: student.name, roll_no: student.roll_no, role: 'Student' },
    token
  };
};
