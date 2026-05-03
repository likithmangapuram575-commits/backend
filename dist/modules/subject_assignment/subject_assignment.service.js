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
exports.deleteAssignment = exports.addAssignment = exports.getAssignmentsByDepartment = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAssignmentsByDepartment = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT sa.*, u.name as faculty_name, s.name as subject_name, sec.name as section_name
    FROM subject_assignments sa
    JOIN users u ON sa.faculty_id = u.id
    JOIN subjects s ON sa.subject_id = s.id
    JOIN sections sec ON sa.section_id = sec.id
    WHERE s.department_id = ?
  `, [departmentId]);
    return rows;
});
exports.getAssignmentsByDepartment = getAssignmentsByDepartment;
const addAssignment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { faculty_id, subject_ids, section_ids, semester, department_id, batch_id, year } = data;
    // Support both single values and arrays for subjects/sections
    const subjects = Array.isArray(subject_ids) ? subject_ids : [data.subject_id || data.subject_ids];
    const sections = Array.isArray(section_ids) ? section_ids : [data.section_id || data.section_ids];
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        for (const subId of subjects) {
            if (!subId)
                continue;
            for (const secId of sections) {
                if (!secId)
                    continue;
                // Avoid duplicate assignments
                const [existing] = yield connection.query('SELECT id FROM subject_assignments WHERE faculty_id = ? AND subject_id = ? AND section_id = ? AND semester = ?', [faculty_id, subId, secId, semester]);
                if (existing.length === 0) {
                    yield connection.query('INSERT INTO subject_assignments (faculty_id, subject_id, section_id, semester, department_id, batch_id, year) VALUES (?, ?, ?, ?, ?, ?, ?)', [faculty_id, subId, secId, semester, department_id, batch_id, year]);
                }
                else {
                    // Update existing with new metadata
                    yield connection.query('UPDATE subject_assignments SET department_id = ?, batch_id = ?, year = ? WHERE id = ?', [department_id, batch_id, year, existing[0].id]);
                }
            }
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
exports.addAssignment = addAssignment;
const deleteAssignment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('DELETE FROM subject_assignments WHERE id = ?', [id]);
});
exports.deleteAssignment = deleteAssignment;
