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
exports.authenticateUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../config/db"));
const authenticateUser = (phone, password) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT * FROM users WHERE phone = ?', [phone]);
    const user = rows[0];
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey123', { expiresIn: '1d' });
    return {
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
        token
    };
});
exports.authenticateUser = authenticateUser;
