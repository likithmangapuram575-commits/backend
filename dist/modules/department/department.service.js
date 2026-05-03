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
exports.removeDepartment = exports.editDepartment = exports.addDepartment = exports.getAllDepartments = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllDepartments = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT d.*, c.name as course_name,
    (SELECT COUNT(*) FROM sections s WHERE s.department_id = d.id) as section_count 
    FROM departments d
    JOIN courses c ON d.course_id = c.id
  `);
    return rows;
});
exports.getAllDepartments = getAllDepartments;
const addDepartment = (name, course_id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO departments (name, course_id) VALUES (?, ?)', [name, course_id]);
    return result;
});
exports.addDepartment = addDepartment;
const editDepartment = (id, name, course_id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('UPDATE departments SET name = ?, course_id = ? WHERE id = ?', [name, course_id, id]);
    return result;
});
exports.editDepartment = editDepartment;
const removeDepartment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM departments WHERE id = ?', [id]);
    return result;
});
exports.removeDepartment = removeDepartment;
