import pool from '../../config/db';

export const getAllStudents = async (departmentId?: number) => {
  let query = `
    SELECT s.*, d.name as department_name, sec.name as section_name, b.name as batch_name 
    FROM students s
    LEFT JOIN departments d ON s.department_id = d.id
    LEFT JOIN sections sec ON s.section_id = sec.id
    LEFT JOIN batches b ON s.batch_id = b.id
  `;
  const params = [];
  if (departmentId) {
    query += ' WHERE s.department_id = ?';
    params.push(departmentId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

export const getAllFaculty = async (departmentId?: number) => {
  let query = `
    SELECT u.name, u.phone, u.email, f.*, d.name as department_name 
    FROM faculty_details f
    JOIN users u ON f.user_id = u.id
    LEFT JOIN departments d ON f.department_id = d.id
  `;
  const params = [];
  if (departmentId) {
    query += ' WHERE f.department_id = ?';
    params.push(departmentId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

export const getAllAttendance = async (departmentId?: number) => {
  let query = `
    SELECT a.*, s.name as student_name, s.roll_no, s.semester, s.year, b.name as batch_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    LEFT JOIN batches b ON s.batch_id = b.id
  `;
  const params = [];
  if (departmentId) {
    query += ' WHERE s.department_id = ?';
    params.push(departmentId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

export const getAllMarks = async (departmentId?: number) => {
  let query = `
    SELECT m.*, s.name as student_name, s.roll_no, s.semester, s.year, b.name as batch_name
    FROM marks m
    JOIN students s ON m.student_id = s.id
    LEFT JOIN batches b ON s.batch_id = b.id
  `;
  const params = [];
  if (departmentId) {
    query += ' WHERE s.department_id = ?';
    params.push(departmentId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

export const getDashboardStats = async () => {
  const [courseCount]: any = await pool.query('SELECT COUNT(*) as count FROM courses');
  const [deptCount]: any = await pool.query('SELECT COUNT(*) as count FROM departments');
  const [subjectCount]: any = await pool.query('SELECT COUNT(*) as count FROM subjects');
  const [studentCount]: any = await pool.query('SELECT COUNT(*) as count FROM students');
  const [facultyCount]: any = await pool.query('SELECT COUNT(*) as count FROM faculty_details');
  const [hodCount]: any = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "HOD"');

  const [deptPerformance]: any = await pool.query(`
    SELECT d.name, AVG(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100 as avg_attendance
    FROM departments d
    JOIN subjects s ON d.id = s.department_id
    JOIN attendance a ON s.id = a.subject_id
    GROUP BY d.id
  `);

  const [recentLogs]: any = await pool.query(`
    SELECT l.*, u.name as user_name 
    FROM audit_logs l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC LIMIT 5
  `);

  return {
    courses: courseCount[0].count,
    departments: deptCount[0].count,
    subjects: subjectCount[0].count,
    students: studentCount[0].count,
    faculty: facultyCount[0].count,
    hods: hodCount[0].count,
    deptPerformance,
    recentLogs
  };
};

export const getAttendanceAnalytics = async (sectionId?: number) => {
  let query = `
    SELECT s.id, s.name, s.roll_no,
           COUNT(a.id) as total_classes,
           SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
           (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100 as percentage
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id
    WHERE s.section_id = ? OR ? IS NULL
    GROUP BY s.id
    HAVING total_classes > 0
    ORDER BY percentage ASC
  `;
  const [rows] = await pool.query(query, [sectionId, sectionId]);
  return rows;
};

export const getMarksAnalytics = async (departmentId?: number) => {
  let query = `
    SELECT s.name as student_name, s.roll_no, m.marks, m.grade, m.result, sub.name as subject_name
    FROM marks m
    JOIN students s ON m.student_id = s.id
    JOIN subjects sub ON m.subject_id = sub.id
    WHERE s.department_id = ? OR ? IS NULL
  `;
  const [rows]: any = await pool.query(query, [departmentId, departmentId]);
  
  const total = rows.length;
  const passed = rows.filter((r: any) => r.result === 'PASS').length;
  const passPercentage = total > 0 ? (passed / total) * 100 : 0;
  
  // Group by subject for subject-wise avg
  const subjectStats: any = {};
  rows.forEach((r: any) => {
    if (!subjectStats[r.subject_name]) subjectStats[r.subject_name] = { total: 0, count: 0 };
    subjectStats[r.subject_name].total += Number(r.marks);
    subjectStats[r.subject_name].count += 1;
  });
  
  const subjectAverages = Object.keys(subjectStats).map(name => ({
    name,
    avg: (subjectStats[name].total / subjectStats[name].count / 30) * 100 // Out of 30
  }));

  return {
    passPercentage,
    totalExams: total,
    subjectAverages,
    recentMarks: rows.slice(-10)
  };
};
