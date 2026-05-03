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
exports.deleteFees = exports.updateFees = exports.addFees = exports.getAllFees = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllFees = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT f.*, b.name as batch_name, c.name as course_name
    FROM fees_structure f
    JOIN batches b ON f.batch_id = b.id
    JOIN courses c ON b.course_id = c.id
    ORDER BY c.name, b.start_year DESC
  `);
    return rows;
});
exports.getAllFees = getAllFees;
const addFees = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO fees_structure (batch_id, tuition_fee, bus_fee, hostel_fee, other_charges) VALUES (?, ?, ?, ?, ?)', [data.batch_id, data.tuition_fee, data.bus_fee, data.hostel_fee, data.other_charges]);
    return result;
});
exports.addFees = addFees;
const updateFees = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('UPDATE fees_structure SET batch_id = ?, tuition_fee = ?, bus_fee = ?, hostel_fee = ?, other_charges = ? WHERE id = ?', [data.batch_id, data.tuition_fee, data.bus_fee, data.hostel_fee, data.other_charges, id]);
    return result;
});
exports.updateFees = updateFees;
const deleteFees = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM fees_structure WHERE id = ?', [id]);
    return result;
});
exports.deleteFees = deleteFees;
