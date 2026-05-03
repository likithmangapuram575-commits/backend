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
exports.updateSettings = exports.getSettings = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT * FROM settings WHERE id = 1');
    return rows[0];
});
exports.getSettings = getSettings;
const updateSettings = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const fields = [];
    const values = [];
    if (data.college_name) {
        fields.push('college_name = ?');
        values.push(data.college_name);
    }
    if (data.college_logo) {
        fields.push('college_logo = ?');
        values.push(data.college_logo);
    }
    if (fields.length === 0)
        return;
    values.push(1); // ID = 1
    yield db_1.default.query(`UPDATE settings SET \${fields.join(', ')} WHERE id = ?`, values);
});
exports.updateSettings = updateSettings;
