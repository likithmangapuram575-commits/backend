"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCourse = exports.editCourse = exports.createCourse = exports.getCourses = void 0;
const courseService = __importStar(require("./course.service"));
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseService.getAllCourses();
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCourses = getCourses;
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, duration_years, total_semesters } = req.body;
        if (!name || !duration_years || !total_semesters) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const result = yield courseService.addCourse(name, Number(duration_years), Number(total_semesters));
        res.status(201).json({ message: 'Course created successfully', id: result.insertId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createCourse = createCourse;
const editCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, duration_years, total_semesters } = req.body;
        yield courseService.updateCourse(Number(id), name, Number(duration_years), Number(total_semesters));
        res.json({ message: 'Course updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.editCourse = editCourse;
const removeCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield courseService.deleteCourse(Number(id));
        res.json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.removeCourse = removeCourse;
