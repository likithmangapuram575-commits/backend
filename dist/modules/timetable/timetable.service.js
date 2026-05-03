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
exports.deleteTimetableEntry = exports.generateTimetable = exports.addTimetableEntry = exports.checkConflict = exports.getTimetableByDepartment = void 0;
const db_1 = __importDefault(require("../../config/db"));
const getTimetableByDepartment = (departmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.query(`
    SELECT t.*, s.name as subject_name, sec.name as section_name, sec.year, sec.semester, u.name as faculty_name
    FROM timetable t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    JOIN users u ON t.faculty_id = u.id
    WHERE t.department_id = ?
    ORDER BY t.day, t.period
  `, [departmentId]);
    return rows;
});
exports.getTimetableByDepartment = getTimetableByDepartment;
const checkConflict = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if faculty is busy at this time (by day/period OR time range)
    const [facultyConflict] = yield db_1.default.query(`
    SELECT * FROM timetable 
    WHERE faculty_id = ? AND (
      (day = ? AND period = ?) OR
      (day_of_week = ? AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?)
      ))
    )
  `, [data.faculty_id, data.day, data.period, data.day_of_week, data.start_time, data.start_time, data.end_time, data.end_time]);
    // Check if section is busy at this time
    const [sectionConflict] = yield db_1.default.query(`
    SELECT * FROM timetable 
    WHERE section_id = ? AND (
      (day = ? AND period = ?) OR
      (day_of_week = ? AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?)
      ))
    )
  `, [data.section_id, data.day, data.period, data.day_of_week, data.start_time, data.start_time, data.end_time, data.end_time]);
    return { facultyConflict: facultyConflict.length > 0, sectionConflict: sectionConflict.length > 0 };
});
exports.checkConflict = checkConflict;
const addTimetableEntry = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.query(`
    INSERT INTO timetable (department_id, section_id, subject_id, faculty_id, day, period, day_of_week, start_time, end_time, room_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [data.department_id, data.section_id, data.subject_id, data.faculty_id, data.day, data.period, data.day_of_week, data.start_time, data.end_time, data.room_number]);
    return result;
});
exports.addTimetableEntry = addTimetableEntry;
const generateTimetable = (batchId, year, semester) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // 1. Fetch all sections for this batch
        const [sections] = yield connection.query('SELECT id, name, department_id FROM sections WHERE batch_id = ? AND year = ?', [batchId, year]);
        if (sections.length === 0)
            throw new Error('No sections found for this batch/year');
        // 2. Fetch all subject assignments for these sections
        const [assignments] = yield connection.query(`
      SELECT sa.*, s.name as subject_name, u.name as faculty_name 
      FROM subject_assignments sa
      JOIN subjects s ON sa.subject_id = s.id
      JOIN users u ON sa.faculty_id = u.id
      WHERE sa.batch_id = ? AND sa.year = ? AND sa.semester = ?
    `, [batchId, year, semester]);
        if (assignments.length === 0)
            throw new Error('No subject assignments found for this batch/year/semester');
        // 3. Clear existing timetable for these sections
        const sectionIds = sections.map((s) => s.id);
        yield connection.query('DELETE FROM timetable WHERE section_id IN (?)', [sectionIds]);
        // 4. Initialize scheduling structures
        const days = [1, 2, 3, 4, 5, 6]; // Mon-Sat
        const periods = [1, 2, 3, 4, 5, 6, 7]; // 7 periods per day
        const facultySchedule = {};
        const facultyDailyLoad = {};
        const weeklyTracker = {}; // { sectionId_subjectId: count }
        const [existingSchedules] = yield connection.query('SELECT faculty_id, day, period FROM timetable WHERE day IS NOT NULL AND period IS NOT NULL');
        existingSchedules.forEach((row) => {
            if (!facultySchedule[row.faculty_id])
                facultySchedule[row.faculty_id] = {};
            if (!facultySchedule[row.faculty_id][row.day])
                facultySchedule[row.faculty_id][row.day] = {};
            facultySchedule[row.faculty_id][row.day][row.period] = true;
            if (!facultyDailyLoad[row.faculty_id])
                facultyDailyLoad[row.faculty_id] = {};
            facultyDailyLoad[row.faculty_id][row.day] = (facultyDailyLoad[row.faculty_id][row.day] || 0) + 1;
        });
        const MAX_PERIODS_PER_DAY = 6;
        // 5. Generation Logic
        for (const day of days) {
            const filledPeriods = {};
            sections.forEach((s) => filledPeriods[s.id] = new Set());
            // 5a. LABS (1x/week, 3 slots)
            for (const section of sections) {
                const labs = assignments.filter((a) => a.section_id === section.id && a.subject_name.toLowerCase().includes('lab'));
                for (const lab of labs) {
                    const trackerKey = `${section.id}_${lab.subject_id}`;
                    if ((weeklyTracker[trackerKey] || 0) >= 3)
                        continue;
                    const [anyLabToday] = yield connection.query('SELECT t.id FROM timetable t JOIN subjects s ON t.subject_id = s.id WHERE t.section_id = ? AND t.day = ? AND s.name LIKE "%Lab%"', [section.id, day]);
                    if (anyLabToday.length > 0)
                        continue;
                    const possibleStarts = [1, 2, 5];
                    for (const start of possibleStarts.sort(() => Math.random() - 0.5)) {
                        const range = [start, start + 1, start + 2];
                        if (range.some(p => p > 7))
                            continue;
                        const isFree = range.every(p => { var _a, _b; return !filledPeriods[section.id].has(p) && !((_b = (_a = facultySchedule[lab.faculty_id]) === null || _a === void 0 ? void 0 : _a[day]) === null || _b === void 0 ? void 0 : _b[p]); });
                        if (isFree && (((_a = facultyDailyLoad[lab.faculty_id]) === null || _a === void 0 ? void 0 : _a[day]) || 0) + 3 <= MAX_PERIODS_PER_DAY) {
                            for (const p of range) {
                                yield insertEntry(connection, section, lab, day, p);
                                filledPeriods[section.id].add(p);
                                markFacultyBusy(facultySchedule, facultyDailyLoad, lab.faculty_id, day, p);
                            }
                            weeklyTracker[trackerKey] = (weeklyTracker[trackerKey] || 0) + 3;
                            break;
                        }
                    }
                }
            }
            // 5b. THEORY (Goal: 6x/week)
            // Shuffle periods to avoid same subject in same period every day
            const shuffledPeriods = [...periods].sort(() => Math.random() - 0.5);
            for (const period of shuffledPeriods) {
                for (const section of sections) {
                    if (filledPeriods[section.id].has(period))
                        continue;
                    const theoryAssignments = assignments.filter((a) => a.section_id === section.id && !a.subject_name.toLowerCase().includes('lab')).sort((a, b) => {
                        // Prioritize subjects with lower counts
                        const countA = weeklyTracker[`${section.id}_${a.subject_id}`] || 0;
                        const countB = weeklyTracker[`${section.id}_${b.subject_id}`] || 0;
                        return countA - countB + (Math.random() - 0.5);
                    });
                    for (const assignment of theoryAssignments) {
                        const trackerKey = `${section.id}_${assignment.subject_id}`;
                        // If we already have 6, only assign if we really have to (leftover slots)
                        // But user said "at least 6", so we aim for 6.
                        if ((weeklyTracker[trackerKey] || 0) >= 6 && Math.random() > 0.2)
                            continue;
                        if ((_c = (_b = facultySchedule[assignment.faculty_id]) === null || _b === void 0 ? void 0 : _b[day]) === null || _c === void 0 ? void 0 : _c[period])
                            continue;
                        if ((((_d = facultyDailyLoad[assignment.faculty_id]) === null || _d === void 0 ? void 0 : _d[day]) || 0) >= MAX_PERIODS_PER_DAY)
                            continue;
                        const [subjectToday] = yield connection.query('SELECT id FROM timetable WHERE section_id = ? AND day = ? AND subject_id = ?', [section.id, day, assignment.subject_id]);
                        if (subjectToday.length > 0)
                            continue;
                        yield insertEntry(connection, section, assignment, day, period);
                        filledPeriods[section.id].add(period);
                        markFacultyBusy(facultySchedule, facultyDailyLoad, assignment.faculty_id, day, period);
                        weeklyTracker[trackerKey] = (weeklyTracker[trackerKey] || 0) + 1;
                        break;
                    }
                }
            }
        }
        yield connection.commit();
        return { message: 'Timetable generated successfully' };
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.generateTimetable = generateTimetable;
const insertEntry = (connection, section, assignment, day, period) => __awaiter(void 0, void 0, void 0, function* () {
    const getTimes = (p) => {
        const slots = {
            1: ['08:30:00', '09:20:00'], 2: ['09:20:00', '10:10:00'],
            3: ['10:10:00', '11:00:00'], 4: ['11:00:00', '11:50:00'],
            5: ['12:50:00', '13:40:00'], 6: ['13:40:00', '14:30:00'],
            7: ['14:30:00', '15:20:00']
        };
        return slots[p] || ['00:00:00', '00:00:00'];
    };
    const [startTime, endTime] = getTimes(period);
    const dayName = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    yield connection.query(`
    INSERT INTO timetable (section_id, department_id, subject_id, faculty_id, day, period, day_of_week, start_time, end_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [section.id, section.department_id, assignment.subject_id, assignment.faculty_id, day, period, dayName, startTime, endTime]);
});
const markFacultyBusy = (facultySchedule, facultyDailyLoad, facultyId, day, period) => {
    if (!facultySchedule[facultyId])
        facultySchedule[facultyId] = {};
    if (!facultySchedule[facultyId][day])
        facultySchedule[facultyId][day] = {};
    facultySchedule[facultyId][day][period] = true;
    if (!facultyDailyLoad[facultyId])
        facultyDailyLoad[facultyId] = {};
    facultyDailyLoad[facultyId][day] = (facultyDailyLoad[facultyId][day] || 0) + 1;
};
const deleteTimetableEntry = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query('DELETE FROM timetable WHERE id = ?', [id]);
});
exports.deleteTimetableEntry = deleteTimetableEntry;
