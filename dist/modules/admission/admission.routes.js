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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admissionController = __importStar(require("./admission.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Multer Config
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/documents/');
    },
    filename: (req, file, cb) => {
        cb(null, `doc-${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
// All routes require authentication and Administrator/SuperAdmin role
router.use(auth_middleware_1.authenticateToken);
router.use((0, auth_middleware_1.authorize)(['Administrator', 'SuperAdmin']));
router.get('/stats', admissionController.getDashboardStats);
router.get('/applications', admissionController.getApplications);
router.post('/apply', admissionController.createApplication);
router.get('/student/:id', admissionController.getStudentDetails);
router.put('/student/:id/status', admissionController.updateStatus);
router.post('/student/:id/activate', admissionController.activateStudent);
router.post('/student/:id/upload-doc', upload.single('file'), admissionController.uploadDocument);
router.put('/document/:docId/verify', admissionController.verifyDocument);
router.delete('/document/:docId', admissionController.deleteDocument);
// Export/Import
router.get('/export/excel', admissionController.exportToExcel);
router.get('/export/pdf/:id', admissionController.exportProfilePDF);
router.post('/import/bulk', upload.single('file'), admissionController.bulkImport);
exports.default = router;
