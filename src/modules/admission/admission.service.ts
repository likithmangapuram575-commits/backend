import pool from '../../config/db';
import { ResultSetHeader } from 'mysql2';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import bcrypt from 'bcrypt';

export const createApplication = async (data: any) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create User
    const hashedPassword = await bcrypt.hash(data.password || 'Student@123', 10);
    const [userResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)',
      [data.name, data.phone, hashedPassword, 'Student']
    );
    const userId = userResult.insertId;

    // 2. Create Student record linked to user
    const [studentResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO students (
        user_id, name, gender, dob, phone, email, course_id, department_id, batch_id, 
        aadhaar, pan, father_name, mother_name, parent_phone, occupation, 
        permanent_address, current_address, admission_type, admission_fee,
        bus_required, bus_route, bus_fee, hostel_required, hostel_type,
        room_type, hostel_fee, total_fee, fee_paid, fee_due, status, year, semester
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED', 1, 1)`,
      [
        userId, data.name, data.gender, data.dob, data.phone, data.email, data.course_id, data.department_id, data.batch_id,
        data.aadhaar || null, data.pan || null, data.father_name, data.mother_name, data.parent_phone, data.occupation,
        data.permanent_address, data.current_address, data.admission_type, data.admission_fee,
        data.bus_required || false, data.bus_route || null, data.bus_fee || 0,
        data.hostel_required || false, data.hostel_type || null, data.room_type || null,
        data.hostel_fee || 0, data.total_fee || 0, data.fee_paid || 0, data.fee_due || 0
      ]
    );

    await connection.commit();
    return studentResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getApplications = async (filters: any) => {
  let query = `
    SELECT s.*, d.name as department_name, b.name as batch_name, c.name as course_name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN batches b ON s.batch_id = b.id
    JOIN courses c ON s.course_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.status) {
    query += ' AND s.status = ?';
    params.push(filters.status);
  }
  if (filters.department_id) {
    query += ' AND s.department_id = ?';
    params.push(filters.department_id);
  }
  if (filters.batch_id) {
    query += ' AND s.batch_id = ?';
    params.push(filters.batch_id);
  }
  if (filters.search) {
    query += ' AND (s.name LIKE ? OR s.phone LIKE ? OR s.aadhaar LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY s.created_at DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

export const getStudentDetails = async (id: number) => {
  const [student]: any = await pool.query(
    `SELECT s.*, d.name as department_name, b.name as batch_name, c.name as course_name, sec.name as section_name
     FROM students s
     JOIN departments d ON s.department_id = d.id
     JOIN batches b ON s.batch_id = b.id
     JOIN courses c ON s.course_id = c.id
     LEFT JOIN sections sec ON s.section_id = sec.id
     WHERE s.id = ?`,
    [id]
  );
  
  const [documents]: any = await pool.query(
    'SELECT * FROM documents WHERE student_id = ?',
    [id]
  );

  return { ...student[0], documents };
};

export const updateStudentStatus = async (id: number, status: string, remarks?: string) => {
  await pool.query(
    'UPDATE students SET status = ?, remarks = ? WHERE id = ?',
    [status, remarks || null, id]
  );
};

export const uploadDocument = async (studentId: number, type: string, fileName: string, filePath: string) => {
  await pool.query(
    'INSERT INTO documents (student_id, type, file_name, file_path) VALUES (?, ?, ?, ?)',
    [studentId, type, fileName, filePath]
  );
};

export const verifyDocument = async (docId: number, status: string, remarks?: string) => {
  await pool.query(
    'UPDATE documents SET status = ?, remarks = ? WHERE id = ?',
    [status, remarks || null, docId]
  );
};

export const activateStudent = async (studentId: number, sectionId: number) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get student details
    const [students]: any = await connection.query(
      'SELECT s.*, d.code as dept_code, b.name as batch_name FROM students s JOIN departments d ON s.department_id = d.id JOIN batches b ON s.batch_id = b.id WHERE s.id = ?',
      [studentId]
    );
    const student = students[0];

    if (!student) throw new Error('Student not found');
    if (student.status === 'ACTIVE') throw new Error('Student is already active');

    // 2. Generate Roll Number: DEPT-BATCH-COUNT
    // Example: CSE-2021-001
    // We need to count students in same dept and batch who are already ACTIVE or APPROVED
    const [countResult]: any = await connection.query(
      'SELECT COUNT(*) as count FROM students WHERE department_id = ? AND batch_id = ? AND (status = "ACTIVE" OR status = "APPROVED")',
      [student.department_id, student.batch_id]
    );
    const nextCount = (countResult[0].count + 1).toString().padStart(3, '0');
    const rollNo = `${student.dept_code}-${student.batch_name}-${nextCount}`;

    // 3. Generate Student ID Card (Simple numeric ID for now)
    const studentIdCard = `SID-${Date.now()}-${studentId}`;

    // 4. Update student
    await connection.query(
      'UPDATE students SET roll_no = ?, student_id_card = ?, section_id = ?, status = "ACTIVE" WHERE id = ?',
      [rollNo, studentIdCard, sectionId, studentId]
    );

    await connection.commit();
    return { rollNo, studentIdCard };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getDashboardStats = async () => {
  const [totalApps]: any = await pool.query('SELECT COUNT(*) as count FROM students');
  const [pendingVer]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE status = "APPLIED"');
  const [approved]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE status = "APPROVED"');
  const [active]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE status = "ACTIVE"');
  const [rejected]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE status = "REJECTED"');
  
  const [todayAdmissions]: any = await pool.query('SELECT COUNT(*) as count FROM students WHERE DATE(created_at) = CURDATE()');

  const [deptDistribution]: any = await pool.query(`
    SELECT d.name, COUNT(s.id) as count 
    FROM departments d 
    LEFT JOIN students s ON d.id = s.department_id 
    GROUP BY d.id
  `);

  const [dailyTrend]: any = await pool.query(`
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM students 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  return {
    stats: {
      totalApplications: totalApps[0].count,
      pendingVerification: pendingVer[0].count,
      approvedStudents: approved[0].count,
      activeStudents: active[0].count,
      rejectedApplications: rejected[0].count,
      todayAdmissions: todayAdmissions[0].count
    },
    deptDistribution,
    dailyTrend
  };
};

export const deleteDocument = async (docId: number) => {
    await pool.query('DELETE FROM documents WHERE id = ?', [docId]);
};

export const exportStudentsToExcel = async () => {
  const [rows]: any = await pool.query(`
    SELECT s.*, d.name as department_name, b.name as batch_name, c.name as course_name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN batches b ON s.batch_id = b.id
    JOIN courses c ON s.course_id = c.id
  `);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Roll No', key: 'roll_no', width: 15 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Department', key: 'department_name', width: 20 },
    { header: 'Batch', key: 'batch_name', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Aadhaar', key: 'aadhaar', width: 15 },
    { header: 'Admission Type', key: 'admission_type', width: 15 },
    { header: 'Admission Fee', key: 'admission_fee', width: 15 },
    { header: 'Bus Fee', key: 'bus_fee', width: 15 },
    { header: 'Hostel Fee', key: 'hostel_fee', width: 15 },
    { header: 'Total Fee', key: 'total_fee', width: 15 },
    { header: 'Paid', key: 'fee_paid', width: 15 },
    { header: 'Due', key: 'fee_due', width: 15 },
  ];

  worksheet.addRows(rows);
  return workbook;
};

export const generateStudentPDF = async (studentId: number) => {
    const student = await getStudentDetails(studentId);
    const doc = new PDFDocument();
    
    doc.fontSize(24).fillColor('#0f172a').text('AcadeMiq ERP - Admission Profile', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(16).fillColor('#1e293b').text('Student Information', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#334155');
    
    const drawField = (label: string, value: string) => {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value || 'N/A');
        doc.moveDown(0.5);
    };

    drawField('Full Name', student.name);
    drawField('Roll Number', student.roll_no);
    drawField('Status', student.status);
    drawField('Course', student.course_name);
    drawField('Department', student.department_name);
    drawField('Batch', student.batch_name);
    drawField('Section', student.section_name);
    
    doc.moveDown();
    doc.fontSize(16).fillColor('#1e293b').text('Contact & Identity', { underline: true });
    doc.moveDown();
    drawField('Phone', student.phone);
    drawField('Email', student.email);
    drawField('Aadhaar', student.aadhaar);
    drawField('PAN', student.pan);

    doc.moveDown();
    doc.fontSize(16).fillColor('#1e293b').text('Parent Details', { underline: true });
    doc.moveDown();
    drawField('Father\'s Name', student.father_name);
    drawField('Mother\'s Name', student.mother_name);
    drawField('Parent Phone', student.parent_phone);
    
    doc.text('Permanent Address:');
    doc.text(student.permanent_address, { indent: 20 });
    doc.moveDown(0.5);
    doc.text('Current Address:');
    doc.text(student.current_address, { indent: 20 });

    doc.moveDown();
    doc.fontSize(16).fillColor('#1e293b').text('Fee & Facility Details', { underline: true });
    doc.moveDown();
    drawField('Admission Type', student.admission_type);
    drawField('Admission Fee', `₹${student.admission_fee}`);
    
    if (student.bus_required) {
        doc.font('Helvetica-Bold').text('Transport: ', { continued: true }).font('Helvetica').text(`Route: ${student.bus_route} | Fee: ₹${student.bus_fee}`);
        doc.moveDown(0.5);
    }
    
    if (student.hostel_required) {
        doc.font('Helvetica-Bold').text('Hostel: ', { continued: true }).font('Helvetica').text(`${student.hostel_type} | ${student.room_type} | Fee: ₹${student.hostel_fee}`);
        doc.moveDown(0.5);
    }

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a');
    doc.text(`Total Fee: ₹${student.total_fee}`);
    doc.text(`Fee Paid: ₹${student.fee_paid}`);
    doc.fillColor('#ef4444').text(`Fee Due: ₹${student.fee_due}`);

    return doc;
};

export const bulkImportStudents = async (filePath: string) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    
    const students: any[] = [];
    worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header
            students.push({
                name: row.getCell(1).text,
                phone: row.getCell(2).text,
                email: row.getCell(3).text,
                aadhaar: row.getCell(4).text,
                course_id: row.getCell(5).value,
                department_id: row.getCell(6).value,
                batch_id: row.getCell(7).value,
                gender: row.getCell(8).text || 'Male',
                dob: row.getCell(9).text,
            });
        }
    });

    for (const s of students) {
        await createApplication(s);
    }
};export const deleteStudent = async (id: number) => {
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
};
