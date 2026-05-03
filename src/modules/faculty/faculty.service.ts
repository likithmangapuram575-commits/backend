import pool from '../../config/db';
import bcrypt from 'bcrypt';

export const getAllFaculties = async (departmentId?: number) => {
  let query = `
    SELECT u.id, u.name, u.phone, u.email, u.status,
           fd.qualification, fd.experience, fd.salary, fd.joining_date, fd.address
    FROM users u
    LEFT JOIN faculty_details fd ON u.id = fd.user_id
    WHERE u.role = 'Faculty'
  `;
  const params = [];

  if (departmentId) {
    query += ' AND fd.department_id = ?';
    params.push(departmentId);
  }

  const [rows]: any = await pool.query(query, params);
  return rows;
};

export const createFaculty = async (data: any, departmentId?: number) => {
  const { name, phone, email, password, qualification, experience, salary, joining_date, address } = data;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password || 'Faculty@123', 10);
    const [userResult]: any = await connection.query(
      'INSERT INTO users (name, phone, email, password, role, status) VALUES (?, ?, ?, ?, "Faculty", "ACTIVE")',
      [name, phone, email, hashedPassword]
    );
    const userId = userResult.insertId;

    // 2. Create Faculty Details
    await connection.query(
      `INSERT INTO faculty_details (user_id, department_id, qualification, experience, salary, joining_date, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, departmentId || null, qualification, experience, salary || 0, joining_date || null, address]
    );

    await connection.commit();
    return { id: userId, name, phone, email };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateFaculty = async (id: number, data: any) => {
  const { name, phone, email, qualification, experience, salary, joining_date, address } = data;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update User
    await connection.query(
      'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
      [name, phone, email, id]
    );

    // 2. Update Faculty Details
    await connection.query(
      `UPDATE faculty_details 
       SET qualification = ?, experience = ?, salary = ?, joining_date = ?, address = ?
       WHERE user_id = ?`,
      [qualification, experience, salary, joining_date, address, id]
    );

    await connection.commit();
    return { id, name, phone, email };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteFaculty = async (id: number) => {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return { message: 'Faculty deleted successfully' };
};

export const getFacultyDashboard = async (facultyId: number) => {
  const today = new Date().toISOString().split('T')[0];
  const [holidays]: any = await pool.query(
    'SELECT event_name FROM academic_calendar WHERE type = "Holiday" AND ? BETWEEN start_date AND end_date',
    [today]
  );
  const isHoliday = holidays.length > 0;

  const dayOfWeek = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const [todayClasses]: any = await pool.query(`
    SELECT t.*, s.name as subject_name, sec.name as section_name, sec.year, sec.semester
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    WHERE t.faculty_id = ? AND t.day_of_week = ?
    ORDER BY t.period
  `, [facultyId, dayOfWeek]);

  const [[{ totalSubjects }]]: any = await pool.query(
    'SELECT COUNT(DISTINCT subject_id) as totalSubjects FROM subject_assignments WHERE faculty_id = ?',
    [facultyId]
  );
  
  const [[{ totalSections }]]: any = await pool.query(
    'SELECT COUNT(DISTINCT section_id) as totalSections FROM subject_assignments WHERE faculty_id = ?',
    [facultyId]
  );

  // Resolve faculty_id for attendance lookup
  const [faculty]: any = await pool.query('SELECT id FROM faculty WHERE user_id = ?', [facultyId]);
  const attendanceFacultyId = faculty.length > 0 ? faculty[0].id : facultyId;

  const [[{ pendingAttendance }]]: any = await pool.query(
    'SELECT COUNT(*) as pendingAttendance FROM attendance WHERE faculty_id = ? AND approval_status = "Pending"',
    [attendanceFacultyId]
  );

  return {
    todayClasses: isHoliday ? [] : todayClasses,
    holiday: isHoliday ? holidays[0].event_name : null,
    stats: {
      totalSubjects,
      totalSections,
      pendingAttendance
    }
  };
};

export const getFacultySchedule = async (facultyId: number) => {
  const [rows]: any = await pool.query(`
    SELECT t.*, s.name as subject_name, sec.name as section_name, sec.year, sec.semester
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    WHERE t.faculty_id = ?
    ORDER BY t.day, t.period
  `, [facultyId]);
  return rows;
};

export const getFacultySubjects = async (facultyId: number) => {
  const [rows]: any = await pool.query(`
    SELECT DISTINCT s.id as subject_id, s.name as subject_name, sec.id as section_id, sec.name as section_name, sec.year, sec.semester, d.name as department_name
    FROM subject_assignments sa
    JOIN subjects s ON sa.subject_id = s.id
    JOIN sections sec ON sa.section_id = sec.id
    LEFT JOIN departments d ON s.department_id = d.id
    WHERE sa.faculty_id = ?
  `, [facultyId]);
  return rows;
};

export const getStudentsForSection = async (sectionId: number) => {
  const [rows]: any = await pool.query(
    'SELECT id, name, roll_no FROM students WHERE section_id = ? ORDER BY roll_no',
    [sectionId]
  );
  return rows;
};

export const getCurrentClass = async (facultyUserId: number) => {
  const now = new Date();
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  
  if (dayOfWeek === 'Sunday') return null;

  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Period Mapping (Example: 9:00 - 10:00 is Period 1)
  let period = 0;
  if (totalMinutes >= 540 && totalMinutes < 600) period = 1;      // 9:00 - 10:00
  else if (totalMinutes >= 600 && totalMinutes < 660) period = 2; // 10:00 - 11:00
  else if (totalMinutes >= 675 && totalMinutes < 735) period = 3; // 11:15 - 12:15
  else if (totalMinutes >= 735 && totalMinutes < 795) period = 4; // 12:15 - 1:15
  else if (totalMinutes >= 840 && totalMinutes < 900) period = 5; // 2:00 - 3:00
  else if (totalMinutes >= 900 && totalMinutes < 960) period = 6; // 3:00 - 4:00

  if (period === 0) return null;

  const [rows]: any = await pool.query(`
    SELECT t.*, s.name as subject_name, sec.name as section_name, sec.year, sec.semester
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    WHERE t.faculty_id = ? AND t.day = ? AND t.period = ?
  `, [facultyUserId, dayOfWeek, period]);

  return rows.length > 0 ? rows[0] : null;
};

export const submitAttendance = async (data: any) => {
  const { faculty_id, subject_id, section_id, period, date, attendanceData } = data;

  const [holidays]: any = await pool.query(
    'SELECT event_name FROM academic_calendar WHERE type = "Holiday" AND ? BETWEEN start_date AND end_date',
    [date]
  );
  if (holidays.length > 0) {
    throw new Error(`Cannot submit attendance on a holiday: ${holidays[0].event_name}`);
  }

  // Check for duplicate attendance (same date and period for this section)
  const [existing]: any = await pool.query(
    'SELECT id FROM attendance WHERE section_id = ? AND date = ? AND period = ?',
    [section_id, date, period]
  );

  if (existing.length > 0) {
    throw new Error('Attendance already submitted for this section and period today.');
  }

  const values = attendanceData.map((a: any) => [
    a.student_id, subject_id, section_id, faculty_id, date, period, a.status, 'PENDING'
  ]);

  await pool.query(
    'INSERT INTO attendance (student_id, subject_id, section_id, faculty_id, date, period, status, approval_status) VALUES ?',
    [values]
  );

  return { message: 'Attendance submitted for approval' };
};

export const getPendingAttendanceForHOD = async (hodUserId: number) => {
  // Get HOD's department
  const [hod]: any = await pool.query('SELECT department_id FROM faculty WHERE user_id = ?', [hodUserId]);
  if (hod.length === 0) return [];
  const deptId = hod[0].department_id;

  const [rows]: any = await pool.query(`
    SELECT DISTINCT a.date, a.period, f.name as faculty_name, s.name as subject_name, sec.name as section_name, a.approval_status, a.subject_id, a.section_id, a.faculty_id
    FROM attendance a
    JOIN faculty f ON a.faculty_id = f.id
    JOIN subjects s ON a.subject_id = s.id
    JOIN sections sec ON a.section_id = sec.id
    WHERE f.department_id = ? AND a.approval_status = 'PENDING'
    ORDER BY a.date DESC, a.period DESC
  `, [deptId]);
  return rows;
};

export const updateAttendanceStatus = async (data: any) => {
  const { date, period, section_id, subject_id, status, remarks } = data;
  await pool.query(
    'UPDATE attendance SET approval_status = ?, remarks = ? WHERE date = ? AND period = ? AND section_id = ? AND subject_id = ?',
    [status, remarks, date, period, section_id, subject_id]
  );
  return { message: `Attendance ${status.toLowerCase()} successfully` };
};

const calculateGrade = (marks: number) => {
  if (marks >= 26) return { grade: 'A+', result: 'PASS' };
  if (marks >= 21) return { grade: 'A', result: 'PASS' };
  if (marks >= 16) return { grade: 'B', result: 'PASS' };
  if (marks >= 12) return { grade: 'C', result: 'PASS' };
  return { grade: 'F', result: 'FAIL' };
};

export const submitMarks = async (data: any) => {
  const { faculty_id, subject_id, marksData } = data;

  for (const m of marksData) {
    if (m.marks < 0 || m.marks > 30) throw new Error('Marks must be between 0 and 30');
    
    const { grade, result: passFail } = calculateGrade(m.marks);
    
    const [existing]: any = await pool.query(
      'SELECT id FROM marks WHERE student_id = ? AND subject_id = ? AND exam_type = "internal"',
      [m.student_id, subject_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE marks SET marks = ?, grade = ?, result = ?, faculty_id = ?, approval_status = "PENDING" WHERE id = ?',
        [m.marks, grade, passFail, faculty_id, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO marks (student_id, subject_id, faculty_id, marks, grade, result, exam_type, approval_status) VALUES (?, ?, ?, ?, ?, ?, "internal", "PENDING")',
        [m.student_id, subject_id, faculty_id, m.marks, grade, passFail]
      );
    }
  }

  return { message: 'Marks submitted successfully' };
};

export const applyLeave = async (facultyId: number, data: any) => {
  const { from_date, to_date, reason } = data;
  await pool.query(
    'INSERT INTO leaves (faculty_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, "PENDING")',
    [facultyId, from_date, to_date, reason]
  );
  return { message: 'Leave application submitted' };
};

export const getLeaveHistory = async (facultyId: number) => {
  const [rows]: any = await pool.query(
    'SELECT * FROM leaves WHERE faculty_id = ? ORDER BY created_at DESC',
    [facultyId]
  );
  return rows;
};

export const getFacultyProfile = async (facultyId: number) => {
  const [[profile]]: any = await pool.query(`
    SELECT u.name, u.phone, u.email, fd.*, d.name as department_name
    FROM users u
    LEFT JOIN faculty_details fd ON u.id = fd.user_id
    LEFT JOIN departments d ON fd.department_id = d.id
    WHERE u.id = ?
  `, [facultyId]);
  return profile;
};

export const getSubmissionStatus = async (facultyId: number) => {
  const [attendance]: any = await pool.query(`
    SELECT DISTINCT date, s.name as subject_name, approval_status
    FROM attendance a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.faculty_id = ?
    ORDER BY date DESC LIMIT 10
  `, [facultyId]);

  const [marks]: any = await pool.query(`
    SELECT DISTINCT s.name as subject_name, approval_status, created_at
    FROM marks m
    JOIN subjects s ON m.subject_id = s.id
    WHERE m.faculty_id = ?
    ORDER BY created_at DESC LIMIT 10
  `, [facultyId]);

  return { attendance, marks };
};
