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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facultyController = __importStar(require("./faculty.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All faculty routes require authentication and Faculty role
router.use(auth_middleware_1.authenticateToken);
router.use(auth_middleware_1.requireFaculty);
// CRUD Routes (Used by HOD/SuperAdmin)
router.get('/', facultyController.getFaculties);
router.post('/', facultyController.postCreateFaculty);
router.put('/:id', facultyController.putUpdateFaculty);
router.delete('/:id', facultyController.deleteFaculty);
// Faculty Self Routes
router.get('/dashboard', facultyController.getDashboard);
router.get('/schedule', facultyController.getSchedule);
router.get('/subjects', facultyController.getSubjects);
router.get('/students', facultyController.getStudents);
router.get('/profile', facultyController.getProfile);
router.get('/status', facultyController.getStatus);
router.post('/attendance', facultyController.postAttendance);
router.post('/marks', facultyController.postMarks);
router.post('/leave', facultyController.postLeave);
router.get('/leaves', facultyController.getLeaves);
exports.default = router;
