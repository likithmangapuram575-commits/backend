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
exports.getSubmissionStatus = exports.getFacultyProfile = exports.getLeaveHistory = exports.applyLeave = exports.submitMarks = exports.submitAttendance = exports.getStudentsForSection = exports.getFacultySubjects = exports.getFacultySchedule = exports.getFacultyDashboard = exports.deleteFaculty = exports.updateFaculty = exports.createFaculty = exports.getAllFaculties = void 0;
const db_1 = __importDefault(require("../../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const getAllFaculties = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const [rows] = yield db_1.default.query(query, params);
    return rows;
});
exports.getAllFaculties = getAllFaculties;
const createFaculty = (data, departmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, password, qualification, experience, salary, joining_date, address } = data;
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // 1. Create User
        const hashedPassword = yield bcrypt_1.default.hash(password || 'Faculty@123', 10);
        const [userResult] = yield connection.query('INSERT INTO users (name, phone, email, password, role, status) VALUES (?, ?, ?, ?, "Faculty", "ACTIVE")', [name, phone, email, hashedPassword]);
        const userId = userResult.insertId;
        // 2. Create Faculty Details
        yield connection.query(`INSERT INTO faculty_details (user_id, department_id, qualification, experience, salary, joining_date, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [userId, departmentId || null, qualification, experience, salary || 0, joining_date || null, address]);
        yield connection.commit();
        return { id: userId, name, phone, email };
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.createFaculty = createFaculty;
const updateFaculty = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, qualification, experience, salary, joining_date, address } = data;
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // 1. Update User
        yield connection.query('UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?', [name, phone, email, id]);
        // 2. Update Faculty Details
        yield connection.query(`UPDATE faculty_details 
       SET qualification = ?, experience = ?, salary = ?, joining_date = ?, address = ?
       WHERE user_id = ?`, [qualification, experience, salary, joining_date, address, id]);
        yield connection.commit();
        return { id, name, phone, email };
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.updateFaculty = updateFaculty;
const deleteFaculty = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('DELETE FROM users WHERE id = ?', [id]);
    return { message: 'Faculty deleted successfully' };
});
exports.deleteFaculty = deleteFaculty;
const getFacultyDashboard = (facultyId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Today's Classes
    const dayOfWeek = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const [todayClasses] = yield db_1.default.query(`
    SELECT t.*, s.name as subject_name, sec.name as section_name, sec.year, sec.semester
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    WHERE t.faculty_id = ? AND t.day_of_week = ?
    ORDER BY t.period
  `, [facultyId, dayOfWeek]);
    // 2. Stats
    const [[{ totalSubjects }]] = yield db_1.default.query('SELECT COUNT(DISTINCT subject_id) as totalSubjects FROM subject_assignments WHERE faculty_id = ?', [facultyId]);
    const [[{ totalSections }]] = yield db_1.default.query('SELECT COUNT(DISTINCT section_id) as totalSections FROM subject_assignments WHERE faculty_id = ?', [facultyId]);
    const [[{ pendingAttendance }]] = yield db_1.default.query("SELECT COUNT(*) as pendingAttendance FROM attendance WHERE faculty_id = ? AND approval_status = 'PENDING'", [facultyId]);
    return {
        todayClasses,
        stats: {
            totalSubjects,
            totalSections,
            pendingAttendance
        }
    };
});
exports.getFacultyDashboard = getFacultyDashboard;
const getFacultySchedule = (facultyId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT t.*, s.name as subject_name, sec.name as section_name, sec.year, sec.semester
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    WHERE t.faculty_id = ?
    ORDER BY t.day, t.period
  `, [facultyId]);
    return rows;
});
exports.getFacultySchedule = getFacultySchedule;
const getFacultySubjects = (facultyId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT DISTINCT s.id as subject_id, s.name as subject_name, sec.id as section_id, sec.name as section_name, sec.year, sec.semester, d.name as department_name
    FROM subject_assignments sa
    JOIN subjects s ON sa.subject_id = s.id
    JOIN sections sec ON sa.section_id = sec.id
    JOIN departments d ON s.department_id = d.id
    WHERE sa.faculty_id = ?
  `, [facultyId]);
    return rows;
});
exports.getFacultySubjects = getFacultySubjects;
const getStudentsForSection = (sectionId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT id, name, roll_no FROM students WHERE section_id = ? ORDER BY roll_no', [sectionId]);
    return rows;
});
exports.getStudentsForSection = getStudentsForSection;
const submitAttendance = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { faculty_id, subject_id, section_id, date, attendanceData } = data;
    // Check if attendance already exists for this subject/section/date
    const [existing] = yield db_1.default.query('SELECT id FROM attendance WHERE subject_id = ? AND date = ? AND student_id IN (SELECT id FROM students WHERE section_id = ?)', [subject_id, date, section_id]);
    if (existing.length > 0) {
        throw new Error('Attendance already submitted for this date and subject.');
    }
    const values = attendanceData.map((a) => [
        a.student_id, subject_id, faculty_id, date, a.status, 'PENDING'
    ]);
    yield db_1.default.query('INSERT INTO attendance (student_id, subject_id, faculty_id, date, status, approval_status) VALUES ?', [values]);
    return { message: 'Attendance submitted successfully' };
});
exports.submitAttendance = submitAttendance;
const submitMarks = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { faculty_id, subject_id, marksData } = data;
    // marksData: Array of { student_id, marks }
    for (const m of marksData) {
        if (m.marks < 0 || m.marks > 30)
            throw new Error('Marks must be between 0 and 30');
        // Check for duplicate
        const [existing] = yield db_1.default.query('SELECT id FROM marks WHERE student_id = ? AND subject_id = ? AND exam_type = "internal"', [m.student_id, subject_id]);
        if (existing.length > 0) {
            yield db_1.default.query('UPDATE marks SET marks = ?, faculty_id = ?, approval_status = "PENDING" WHERE id = ?', [m.marks, faculty_id, existing[0].id]);
        }
        else {
            yield db_1.default.query('INSERT INTO marks (student_id, subject_id, faculty_id, marks, exam_type, approval_status) VALUES (?, ?, ?, ?, "internal", "PENDING")', [m.student_id, subject_id, faculty_id, m.marks]);
        }
    }
    return { message: 'Marks submitted successfully' };
});
exports.submitMarks = submitMarks;
const applyLeave = (facultyId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { from_date, to_date, reason } = data;
    yield db_1.default.query('INSERT INTO leaves (faculty_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, "PENDING")', [facultyId, from_date, to_date, reason]);
    return { message: 'Leave application submitted' };
});
exports.applyLeave = applyLeave;
const getLeaveHistory = (facultyId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT * FROM leaves WHERE faculty_id = ? ORDER BY created_at DESC', [facultyId]);
    return rows;
});
exports.getLeaveHistory = getLeaveHistory;
const getFacultyProfile = (facultyId) => __awaiter(void 0, void 0, void 0, function* () {
    const [[profile]] = yield db_1.default.query(`
    SELECT u.name, u.phone, u.email, fd.*, d.name as department_name
    FROM users u
    LEFT JOIN faculty_details fd ON u.id = fd.user_id
    LEFT JOIN departments d ON fd.department_id = d.id
    WHERE u.id = ?
  `, [facultyId]);
    return profile;
});
exports.getFacultyProfile = getFacultyProfile;
const getSubmissionStatus = (facultyId) => __awaiter(void 0, void 0, void 0, function* () {
    const [attendance] = yield db_1.default.query(`
    SELECT DISTINCT date, s.name as subject_name, approval_status
    FROM attendance a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.faculty_id = ?
    ORDER BY date DESC LIMIT 10
  `, [facultyId]);
    const [marks] = yield db_1.default.query(`
    SELECT DISTINCT s.name as subject_name, approval_status, created_at
    FROM marks m
    JOIN subjects s ON m.subject_id = s.id
    WHERE m.faculty_id = ?
    ORDER BY created_at DESC LIMIT 10
  `, [facultyId]);
    return { attendance, marks };
});
exports.getSubmissionStatus = getSubmissionStatus;
