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
exports.generateTimetable = exports.deleteTimetableEntry = exports.createTimetableEntry = exports.getTimetable = void 0;
const timetableService = __importStar(require("./timetable.service"));
const hodService = __importStar(require("../hod/hod.service"));
const getTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const hod = yield hodService.getHodByUserId(userId);
        if (!hod) {
            res.status(403).json({ message: 'Access denied.' });
            return;
        }
        const timetable = yield timetableService.getTimetableByDepartment(hod.department_id);
        res.json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTimetable = getTimetable;
const createTimetableEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const hod = yield hodService.getHodByUserId(userId);
        if (!hod) {
            res.status(403).json({ message: 'Access denied.' });
            return;
        }
        const { section_id, subject_id, faculty_id, day, period, day_of_week, start_time, end_time, room_number } = req.body;
        const conflict = yield timetableService.checkConflict({
            section_id, faculty_id, day, period, day_of_week, start_time, end_time
        });
        if (conflict.facultyConflict) {
            res.status(400).json({ message: 'Conflict: Faculty is already assigned at this time.' });
            return;
        }
        if (conflict.sectionConflict) {
            res.status(400).json({ message: 'Conflict: Section already has a class at this time.' });
            return;
        }
        yield timetableService.addTimetableEntry({
            department_id: hod.department_id,
            section_id, subject_id, faculty_id, day, period, day_of_week, start_time, end_time, room_number
        });
        res.status(201).json({ message: 'Timetable entry created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createTimetableEntry = createTimetableEntry;
const deleteTimetableEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield timetableService.deleteTimetableEntry(Number(id));
        res.json({ message: 'Timetable entry deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTimetableEntry = deleteTimetableEntry;
const generateTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { batch_id, year, semester } = req.body;
        if (!batch_id || !year || !semester) {
            res.status(400).json({ message: 'batch_id, year, and semester are required.' });
            return;
        }
        const result = yield timetableService.generateTimetable(Number(batch_id), Number(year), Number(semester));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.generateTimetable = generateTimetable;
