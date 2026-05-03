"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hod_controller_1 = require("./hod.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// Accessible by HOD and SuperAdmin
router.get('/stats', hod_controller_1.getStats);
router.get('/profile/:userId', auth_middleware_1.requireAdmin, hod_controller_1.getProfile);
// Super Admin Only Routes
router.use(auth_middleware_1.requireSuperAdmin);
router.get('/', hod_controller_1.getHods);
router.post('/', upload_middleware_1.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), hod_controller_1.createHod);
router.put('/:id', upload_middleware_1.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), hod_controller_1.updateHod);
router.delete('/:id', hod_controller_1.deleteHod);
exports.default = router;
