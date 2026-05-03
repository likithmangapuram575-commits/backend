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
exports.deleteCourse = exports.updateCourse = exports.addCourse = exports.getCourseById = exports.getAllCourses = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getAllCourses = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT * FROM courses ORDER BY name');
    return rows;
});
exports.getAllCourses = getAllCourses;
const getCourseById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0];
});
exports.getCourseById = getCourseById;
const addCourse = (name, duration_years, total_semesters) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('INSERT INTO courses (name, duration_years, total_semesters) VALUES (?, ?, ?)', [name, duration_years, total_semesters]);
    return result;
});
exports.addCourse = addCourse;
const updateCourse = (id, name, duration_years, total_semesters) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('UPDATE courses SET name = ?, duration_years = ?, total_semesters = ? WHERE id = ?', [name, duration_years, total_semesters, id]);
    return result;
});
exports.updateCourse = updateCourse;
const deleteCourse = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query('DELETE FROM courses WHERE id = ?', [id]);
    return result;
});
exports.deleteCourse = deleteCourse;
