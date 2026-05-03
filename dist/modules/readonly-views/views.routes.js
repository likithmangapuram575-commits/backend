"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const views_controller_1 = require("./views.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// Views are accessible by both SuperAdmin and HOD
router.get('/students', views_controller_1.getStudents);
router.get('/faculty', views_controller_1.getFaculty);
router.get('/attendance', views_controller_1.getAttendance);
router.get('/marks', views_controller_1.getMarks);
router.get('/dashboard-stats', views_controller_1.getDashboardStats);
exports.default = router;
