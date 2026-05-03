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
exports.removeBatch = exports.addBatch = exports.getAllBatches = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllBatches = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT b.*, c.name as course_name, c.duration_years, c.total_semesters
    FROM batches b
    JOIN courses c ON b.course_id = c.id
    ORDER BY b.start_year DESC
  `);
    return rows;
});
exports.getAllBatches = getAllBatches;
const addBatch = (start_year, end_year, course_id) => __awaiter(void 0, void 0, void 0, function* () {
    const name = `${start_year}-${end_year}`;
    const [result] = yield db_1.default.query('INSERT INTO batches (name, start_year, end_year, course_id) VALUES (?, ?, ?, ?)', [name, start_year, end_year, course_id]);
    return result;
});
exports.addBatch = addBatch;
const removeBatch = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM batches WHERE id = ?', [id]);
    return result;
});
exports.removeBatch = removeBatch;
