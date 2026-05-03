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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.getProfile = exports.getLeaves = exports.postLeave = exports.postMarks = exports.postAttendance = exports.getStudents = exports.getSubjects = exports.getSchedule = exports.getDashboard = exports.deleteFaculty = exports.putUpdateFaculty = exports.postCreateFaculty = exports.getFaculties = void 0;
const facultyService = __importStar(require("./faculty.service"));
const db_1 = __importDefault(require("../../config/db"));
const getFaculties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let deptId;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'HOD') {
            const [hod] = yield db_1.default.query('SELECT department_id FROM faculty_details WHERE user_id = ?', [req.user.id]);
            if (hod.length > 0)
                deptId = hod[0].department_id;
        }
        const data = yield facultyService.getAllFaculties(deptId);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getFaculties = getFaculties;
const postCreateFaculty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let deptId = req.body.department_id;
        if (!deptId && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'HOD') {
            const [hod] = yield db_1.default.query('SELECT department_id FROM faculty_details WHERE user_id = ?', [req.user.id]);
            if (hod.length > 0)
                deptId = hod[0].department_id;
        }
        const data = yield facultyService.createFaculty(req.body, deptId);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.postCreateFaculty = postCreateFaculty;
const putUpdateFaculty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = yield facultyService.updateFaculty(Number(id), req.body);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.putUpdateFaculty = putUpdateFaculty;
const deleteFaculty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = yield facultyService.deleteFaculty(Number(id));
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteFaculty = deleteFaculty;
const getDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.getFacultyDashboard(req.user.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDashboard = getDashboard;
const getSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.getFacultySchedule(req.user.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSchedule = getSchedule;
const getSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.getFacultySubjects(req.user.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSubjects = getSubjects;
const getStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { section_id } = req.query;
        if (!section_id)
            return res.status(400).json({ message: 'Section ID required' });
        const data = yield facultyService.getStudentsForSection(Number(section_id));
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStudents = getStudents;
const postAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.submitAttendance(Object.assign(Object.assign({}, req.body), { faculty_id: req.user.id }));
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.postAttendance = postAttendance;
const postMarks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.submitMarks(Object.assign(Object.assign({}, req.body), { faculty_id: req.user.id }));
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.postMarks = postMarks;
const postLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.applyLeave(req.user.id, req.body);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.postLeave = postLeave;
const getLeaves = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.getLeaveHistory(req.user.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getLeaves = getLeaves;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.getFacultyProfile(req.user.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProfile = getProfile;
const getStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield facultyService.getSubmissionStatus(req.user.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStatus = getStatus;
