"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportStudents = exports.generateStudentPDF = exports.exportStudentsToExcel = exports.deleteDocument = exports.getDashboardStats = exports.activateStudent = exports.verifyDocument = exports.uploadDocument = exports.updateStudentStatus = exports.getStudentDetails = exports.getApplications = exports.createApplication = void 0;
const db_1 = __importDefault(require("../../config/db"));
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const createApplication = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query(`INSERT INTO students (
      name, gender, dob, phone, email, course_id, department_id, batch_id, 
      aadhaar, pan, father_name, mother_name, parent_phone, occupation, 
      permanent_address, current_address, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED')`, [
        data.name, data.gender, data.dob, data.phone, data.email, data.course_id, data.department_id, data.batch_id,
        data.aadhaar, data.pan, data.father_name, data.mother_name, data.parent_phone, data.occupation,
        data.permanent_address, data.current_address
    ]);
    return result.insertId;
});
exports.createApplication = createApplication;
const getApplications = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
    SELECT s.*, d.name as department_name, b.name as batch_name, c.name as course_name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN batches b ON s.batch_id = b.id
    JOIN courses c ON s.course_id = c.id
    WHERE 1=1
  `;
    const params = [];
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
    const [rows] = yield db_1.default.query(query, params);
    return rows;
});
exports.getApplications = getApplications;
const getStudentDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [student] = yield db_1.default.query(`SELECT s.*, d.name as department_name, b.name as batch_name, c.name as course_name, sec.name as section_name
     FROM students s
     JOIN departments d ON s.department_id = d.id
     JOIN batches b ON s.batch_id = b.id
     JOIN courses c ON s.course_id = c.id
     LEFT JOIN sections sec ON s.section_id = sec.id
     WHERE s.id = ?`, [id]);
    const [documents] = yield db_1.default.query('SELECT * FROM documents WHERE student_id = ?', [id]);
    return Object.assign(Object.assign({}, student[0]), { documents });
});
exports.getStudentDetails = getStudentDetails;
const updateStudentStatus = (id, status, remarks) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('UPDATE students SET status = ?, remarks = ? WHERE id = ?', [status, remarks || null, id]);
});
exports.updateStudentStatus = updateStudentStatus;
const uploadDocument = (studentId, type, fileName, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('INSERT INTO documents (student_id, type, file_name, file_path) VALUES (?, ?, ?, ?)', [studentId, type, fileName, filePath]);
});
exports.uploadDocument = uploadDocument;
const verifyDocument = (docId, status, remarks) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('UPDATE documents SET status = ?, remarks = ? WHERE id = ?', [status, remarks || null, docId]);
});
exports.verifyDocument = verifyDocument;
const activateStudent = (studentId, sectionId) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // 1. Get student details
        const [students] = yield connection.query('SELECT s.*, d.name as dept_code, b.name as batch_name FROM students s JOIN departments d ON s.department_id = d.id JOIN batches b ON s.batch_id = b.id WHERE s.id = ?', [studentId]);
        const student = students[0];
        if (!student)
            throw new Error('Student not found');
        if (student.status === 'ACTIVE')
            throw new Error('Student is already active');
        // 2. Generate Roll Number: DEPT-BATCH-COUNT
        // Example: CSE-2021-001
        // We need to count students in same dept and batch who are already ACTIVE or APPROVED
        const [countResult] = yield connection.query('SELECT COUNT(*) as count FROM students WHERE department_id = ? AND batch_id = ? AND (status = "ACTIVE" OR status = "APPROVED")', [student.department_id, student.batch_id]);
        const nextCount = (countResult[0].count + 1).toString().padStart(3, '0');
        const rollNo = `${student.dept_code}-${student.batch_name}-${nextCount}`;
        // 3. Generate Student ID Card (Simple numeric ID for now)
        const studentIdCard = `SID-${Date.now()}-${studentId}`;
        // 4. Update student
        yield connection.query('UPDATE students SET roll_no = ?, student_id_card = ?, section_id = ?, status = "ACTIVE" WHERE id = ?', [rollNo, studentIdCard, sectionId, studentId]);
        yield connection.commit();
        return { rollNo, studentIdCard };
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.activateStudent = activateStudent;
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalApps] = yield db_1.default.query('SELECT COUNT(*) as count FROM students');
    const [pendingVer] = yield db_1.default.query('SELECT COUNT(*) as count FROM students WHERE status = "APPLIED"');
    const [approved] = yield db_1.default.query('SELECT COUNT(*) as count FROM students WHERE status = "APPROVED"');
    const [active] = yield db_1.default.query('SELECT COUNT(*) as count FROM students WHERE status = "ACTIVE"');
    const [rejected] = yield db_1.default.query('SELECT COUNT(*) as count FROM students WHERE status = "REJECTED"');
    const [todayAdmissions] = yield db_1.default.query('SELECT COUNT(*) as count FROM students WHERE DATE(created_at) = CURDATE()');
    const [deptDistribution] = yield db_1.default.query(`
    SELECT d.name, COUNT(s.id) as count 
    FROM departments d 
    LEFT JOIN students s ON d.id = s.department_id 
    GROUP BY d.id
  `);
    const [dailyTrend] = yield db_1.default.query(`
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
});
exports.getDashboardStats = getDashboardStats;
const deleteDocument = (docId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('DELETE FROM documents WHERE id = ?', [docId]);
});
exports.deleteDocument = deleteDocument;
const exportStudentsToExcel = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT s.*, d.name as department_name, b.name as batch_name, c.name as course_name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN batches b ON s.batch_id = b.id
    JOIN courses c ON s.course_id = c.id
  `);
    const workbook = new exceljs_1.default.Workbook();
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
    ];
    worksheet.addRows(rows);
    return workbook;
});
exports.exportStudentsToExcel = exportStudentsToExcel;
const generateStudentPDF = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield (0, exports.getStudentDetails)(studentId);
    const doc = new pdfkit_1.default();
    doc.fontSize(24).fillColor('#0f172a').text('AcadeMiq ERP - Admission Profile', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#1e293b').text('Student Information', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#334155');
    const drawField = (label, value) => {
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
    doc.moveDown();
    doc.fontSize(16).fillColor('#1e293b').text('Address', { underline: true });
    doc.moveDown();
    doc.text('Permanent Address:');
    doc.text(student.permanent_address, { indent: 20 });
    doc.moveDown(0.5);
    doc.text('Current Address:');
    doc.text(student.current_address, { indent: 20 });
    return doc;
});
exports.generateStudentPDF = generateStudentPDF;
const bulkImportStudents = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
    yield workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const students = [];
    worksheet === null || worksheet === void 0 ? void 0 : worksheet.eachRow((row, rowNumber) => {
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
        yield (0, exports.createApplication)(s);
    }
});
exports.bulkImportStudents = bulkImportStudents;
