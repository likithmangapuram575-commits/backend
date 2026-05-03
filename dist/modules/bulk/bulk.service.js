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
exports.importFaculty = exports.importStudents = void 0;
const db_1 = __importDefault(require("../../config/db"));
const importStudents = (students) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        for (const student of students) {
            yield connection.query('INSERT INTO students (name, roll_no, email, phone, department_id, batch_id, year, semester, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [student.name, student.roll_no, student.email, student.phone, student.department_id, student.batch_id, student.year, student.semester, student.section_id]);
        }
        yield connection.commit();
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.importStudents = importStudents;
const importFaculty = (faculty) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        for (const member of faculty) {
            yield connection.query('INSERT INTO faculty (name, email, phone, department_id, designation) VALUES (?, ?, ?, ?, ?)', [member.name, member.email, member.phone, member.department_id, member.designation]);
        }
        yield connection.commit();
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.importFaculty = importFaculty;
