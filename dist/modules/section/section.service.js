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
exports.removeSection = exports.editSection = exports.addSection = exports.getAllSections = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllSections = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT s.*, d.name as department_name, b.name as batch_name
    FROM sections s 
    LEFT JOIN departments d ON s.department_id = d.id
    LEFT JOIN batches b ON s.batch_id = b.id
  `);
    return rows;
});
exports.getAllSections = getAllSections;
const addSection = (name, department_id, batch_id, year, semester) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO sections (name, department_id, batch_id, year, semester) VALUES (?, ?, ?, ?, ?)', [name, department_id, batch_id, year, semester]);
    return result;
});
exports.addSection = addSection;
const editSection = (id, name, department_id, batch_id, year, semester) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('UPDATE sections SET name = ?, department_id = ?, batch_id = ?, year = ?, semester = ? WHERE id = ?', [name, department_id, batch_id, year, semester, id]);
    return result;
});
exports.editSection = editSection;
const removeSection = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM sections WHERE id = ?', [id]);
    return result;
});
exports.removeSection = removeSection;
