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
exports.getDashboardStats = exports.getAllMarks = exports.getAllAttendance = exports.getAllFaculty = exports.getAllStudents = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllStudents = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const [rows] = yield db_1.default.query(query, params);
    return rows;
});
exports.getAllStudents = getAllStudents;
const getAllFaculty = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const [rows] = yield db_1.default.query(query, params);
    return rows;
});
exports.getAllFaculty = getAllFaculty;
const getAllAttendance = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const [rows] = yield db_1.default.query(query, params);
    return rows;
});
exports.getAllAttendance = getAllAttendance;
const getAllMarks = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const [rows] = yield db_1.default.query(query, params);
    return rows;
});
exports.getAllMarks = getAllMarks;
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [courseCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM courses');
    const [deptCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM departments');
    const [subjectCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM subjects');
    const [studentCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM students');
    const [facultyCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM faculty_details');
    const [hodCount] = yield db_1.default.query('SELECT COUNT(*) as count FROM users WHERE role = "HOD"');
    return {
        courses: courseCount[0].count,
        departments: deptCount[0].count,
        subjects: subjectCount[0].count,
        students: studentCount[0].count,
        faculty: facultyCount[0].count,
        hods: hodCount[0].count,
    };
});
exports.getDashboardStats = getDashboardStats;
