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
exports.deleteAnnouncement = exports.addAnnouncement = exports.getAllAnnouncements = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllAnnouncements = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT * FROM announcements ORDER BY created_at DESC');
    return rows;
});
exports.getAllAnnouncements = getAllAnnouncements;
const addAnnouncement = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO announcements (title, description, target_role) VALUES (?, ?, ?)', [data.title, data.description, data.target_role]);
    return result;
});
exports.addAnnouncement = addAnnouncement;
const deleteAnnouncement = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM announcements WHERE id = ?', [id]);
    return result;
});
exports.deleteAnnouncement = deleteAnnouncement;
