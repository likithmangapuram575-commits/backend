import pool from '../../config/db';

export const getStudentDashboard = async (studentId: number) => {
  // 1. Attendance %
  const [[attendance]]: any = await pool.query(`
    SELECT 
      COUNT(*) as total_classes,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
      (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as percentage
    FROM attendance 
    WHERE student_id = ? AND approval_status = 'APPROVED'
  `, [studentId]);

  // 2. Marks summary (latest internal)
  const [marks]: any = await pool.query(`
    SELECT s.name as subject_name, m.marks, m.grade, m.result
    FROM marks m
    JOIN subjects s ON m.subject_id = s.id
    WHERE m.student_id = ? AND m.approval_status = 'APPROVED'
    ORDER BY m.created_at DESC LIMIT 5
  `, [studentId]);

  // 3. Unread Notifications
  const [notifications]: any = await pool.query(`
    SELECT * FROM notifications 
    WHERE (role = 'Student' OR student_id = ?) AND is_read = 0 
    ORDER BY created_at DESC LIMIT 5
  `, [studentId, studentId]);

  return {
    stats: {
      attendance_percentage: Math.round(attendance?.percentage || 0),
      total_classes: attendance?.total_classes || 0,
      present_count: attendance?.present_count || 0
    },
    recent_marks: marks || [],
    notifications: notifications || []
  };
};

export const getStudentTimetable = async (studentId: number) => {
  // Get student's section first
  const [[student]]: any = await pool.query('SELECT section_id FROM students WHERE id = ?', [studentId]);
  if (!student) throw new Error('Student not found');

  const [rows]: any = await pool.query(`
    SELECT t.*, s.name as subject_name, f.name as faculty_name
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN faculty f ON t.faculty_id = f.id
    WHERE t.section_id = ?
    ORDER BY t.day, t.period
  `, [student.section_id]);
  return rows;
};

export const getStudentAttendance = async (studentId: number) => {
  const [rows]: any = await pool.query(`
    SELECT 
      s.name as subject_name,
      COUNT(*) as total_classes,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
      (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as percentage
    FROM attendance a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.student_id = ? AND a.approval_status = 'APPROVED'
    GROUP BY s.id
  `, [studentId]);
  return rows;
};

export const getStudentMarks = async (studentId: number) => {
  const [rows]: any = await pool.query(`
    SELECT s.name as subject_name, m.marks, m.grade, m.result, m.exam_type
    FROM marks m
    JOIN subjects s ON m.subject_id = s.id
    WHERE m.student_id = ? AND m.approval_status = 'APPROVED'
  `, [studentId]);
  return rows;
};

export const getStudentFees = async (studentId: number) => {
  const [[fees]]: any = await pool.query(`
    SELECT * FROM student_fees WHERE student_id = ?
  `, [studentId]);
  return fees;
};

export const getStudentProfile = async (studentId: number) => {
  const [[profile]]: any = await pool.query(`
    SELECT s.*, sec.name as section_name, b.name as batch_name, d.name as department_name
    FROM students s
    LEFT JOIN sections sec ON s.section_id = sec.id
    LEFT JOIN batches b ON s.batch_id = b.id
    LEFT JOIN departments d ON s.department_id = d.id
    WHERE s.id = ?
  `, [studentId]);
  return profile;
};

export const getStudentDocuments = async (studentId: number) => {
  const [rows]: any = await pool.query(`
    SELECT * FROM student_documents WHERE student_id = ?
  `, [studentId]);
  return rows;
};
