"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Triggering re-index
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
// Import Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const department_routes_1 = __importDefault(require("./modules/department/department.routes"));
const section_routes_1 = __importDefault(require("./modules/section/section.routes"));
const hod_routes_1 = __importDefault(require("./modules/hod/hod.routes"));
const views_routes_1 = __importDefault(require("./modules/readonly-views/views.routes"));
const batch_routes_1 = __importDefault(require("./modules/batch/batch.routes"));
const course_routes_1 = __importDefault(require("./modules/course/course.routes"));
const subject_routes_1 = __importDefault(require("./modules/subject/subject.routes"));
const finance_routes_1 = __importDefault(require("./modules/finance/finance.routes"));
const system_routes_1 = __importDefault(require("./modules/system/system.routes"));
const communication_routes_1 = __importDefault(require("./modules/communication/communication.routes"));
const bulk_routes_1 = __importDefault(require("./modules/bulk/bulk.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
const faculty_routes_1 = __importDefault(require("./modules/faculty/faculty.routes"));
const timetable_routes_1 = __importDefault(require("./modules/timetable/timetable.routes"));
const subject_assignment_routes_1 = __importDefault(require("./modules/subject_assignment/subject_assignment.routes"));
const admission_routes_1 = __importDefault(require("./modules/admission/admission.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static Folder for Uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api', auth_routes_1.default);
app.use('/api/departments', department_routes_1.default);
app.use('/api/sections', section_routes_1.default);
app.use('/api/hods', hod_routes_1.default);
app.use('/api/views', views_routes_1.default);
app.use('/api/batches', batch_routes_1.default);
app.use('/api/courses', course_routes_1.default);
app.use('/api/subjects', subject_routes_1.default);
app.use('/api/finance', finance_routes_1.default);
app.use('/api/system', system_routes_1.default);
app.use('/api/announcements', communication_routes_1.default);
app.use('/api/bulk', bulk_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/faculty', faculty_routes_1.default);
app.use('/api/timetable', timetable_routes_1.default);
app.use('/api/subject-assignments', subject_assignment_routes_1.default);
app.use('/api/admission', admission_routes_1.default);
// Health Check
app.get('/', (req, res) => {
    res.send('College ERP API is running');
});
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
