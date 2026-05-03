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
exports.getDashboardStats = exports.getMarks = exports.getAttendance = exports.getFaculty = exports.getStudents = void 0;
const viewsService = __importStar(require("./views.service"));
const hodService = __importStar(require("../hod/hod.service"));
const getDepartmentId = (req) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.role === 'HOD') {
        const hod = yield hodService.getHodByUserId(req.user.id);
        return hod === null || hod === void 0 ? void 0 : hod.department_id;
    }
    return undefined;
});
const getStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deptId = yield getDepartmentId(req);
        const students = yield viewsService.getAllStudents(deptId);
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStudents = getStudents;
const getFaculty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deptId = yield getDepartmentId(req);
        const faculty = yield viewsService.getAllFaculty(deptId);
        res.json(faculty);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getFaculty = getFaculty;
const getAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deptId = yield getDepartmentId(req);
        const attendance = yield viewsService.getAllAttendance(deptId);
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAttendance = getAttendance;
const getMarks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deptId = yield getDepartmentId(req);
        const marks = yield viewsService.getAllMarks(deptId);
        res.json(marks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMarks = getMarks;
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield viewsService.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDashboardStats = getDashboardStats;
