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
exports.addAuditLog = exports.getAuditLogs = exports.deleteCalendarEvent = exports.addCalendarEvent = exports.getAllCalendarEvents = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllCalendarEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT ac.*, b.name as batch_name 
    FROM academic_calendar ac
    LEFT JOIN batches b ON ac.batch_id = b.id
    ORDER BY ac.start_date DESC
  `);
    return rows;
});
exports.getAllCalendarEvents = getAllCalendarEvents;
const addCalendarEvent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO academic_calendar (event_name, type, start_date, end_date, batch_id) VALUES (?, ?, ?, ?, ?)', [data.event_name, data.type, data.start_date, data.end_date, data.batch_id || null]);
    return result;
});
exports.addCalendarEvent = addCalendarEvent;
const deleteCalendarEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM academic_calendar WHERE id = ?', [id]);
    return result;
});
exports.deleteCalendarEvent = deleteCalendarEvent;
// Audit Logs
const getAuditLogs = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT a.*, u.name as user_name, u.role as user_role
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC
    LIMIT 100
  `);
    return rows;
});
exports.getAuditLogs = getAuditLogs;
const addAuditLog = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('INSERT INTO audit_logs (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)', [data.user_id, data.action, data.table_name, data.record_id, data.details]);
});
exports.addAuditLog = addAuditLog;
