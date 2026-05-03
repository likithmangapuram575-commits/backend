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
exports.deleteSubject = exports.updateSubject = exports.addSubject = exports.getAllSubjects = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllSubjects = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT s.*, d.name as department_name, c.name as course_name
    FROM subjects s
    JOIN departments d ON s.department_id = d.id
    JOIN courses c ON d.course_id = c.id
    ORDER BY c.name, d.name, s.semester, s.name
  `);
    return rows;
});
exports.getAllSubjects = getAllSubjects;
const addSubject = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO subjects (name, code, credits, type, department_id, semester) VALUES (?, ?, ?, ?, ?, ?)', [data.name, data.code, data.credits, data.type, data.department_id, data.semester]);
    return result;
});
exports.addSubject = addSubject;
const updateSubject = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('UPDATE subjects SET name = ?, code = ?, credits = ?, type = ?, department_id = ?, semester = ? WHERE id = ?', [data.name, data.code, data.credits, data.type, data.department_id, data.semester, id]);
    return result;
});
exports.updateSubject = updateSubject;
const deleteSubject = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM subjects WHERE id = ?', [id]);
    return result;
});
exports.deleteSubject = deleteSubject;
