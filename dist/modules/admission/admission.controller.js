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
exports.bulkImport = exports.exportProfilePDF = exports.exportToExcel = exports.deleteDocument = exports.getDashboardStats = exports.activateStudent = exports.verifyDocument = exports.uploadDocument = exports.updateStatus = exports.getStudentDetails = exports.getApplications = exports.createApplication = void 0;
const admissionService = __importStar(require("./admission.service"));
const fs_1 = __importDefault(require("fs"));
const createApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = yield admissionService.createApplication(req.body);
        res.status(201).json({ message: 'Application submitted successfully', studentId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createApplication = createApplication;
const getApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield admissionService.getApplications(req.query);
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getApplications = getApplications;
const getStudentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield admissionService.getStudentDetails(parseInt(req.params.id));
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStudentDetails = getStudentDetails;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, remarks } = req.body;
        yield admissionService.updateStudentStatus(parseInt(req.params.id), status, remarks);
        res.json({ message: 'Status updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateStatus = updateStatus;
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const { type } = req.body;
        const studentId = parseInt(req.params.id);
        const fileName = req.file.filename;
        const filePath = req.file.path;
        yield admissionService.uploadDocument(studentId, type, fileName, filePath);
        res.json({ message: 'Document uploaded successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.uploadDocument = uploadDocument;
const verifyDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, remarks } = req.body;
        yield admissionService.verifyDocument(parseInt(req.params.docId), status, remarks);
        res.json({ message: 'Document verification status updated' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.verifyDocument = verifyDocument;
const activateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sectionId } = req.body;
        const result = yield admissionService.activateStudent(parseInt(req.params.id), sectionId);
        res.json(Object.assign({ message: 'Student activated successfully' }, result));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.activateStudent = activateStudent;
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield admissionService.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDashboardStats = getDashboardStats;
const deleteDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield admissionService.deleteDocument(parseInt(req.params.docId));
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteDocument = deleteDocument;
// Export features
const exportToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workbook = yield admissionService.exportStudentsToExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.exportToExcel = exportToExcel;
const exportProfilePDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield admissionService.generateStudentPDF(parseInt(req.params.id));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=student_${req.params.id}.pdf`);
        doc.pipe(res);
        doc.end();
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.exportProfilePDF = exportProfilePDF;
const bulkImport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        yield admissionService.bulkImportStudents(req.file.path);
        // Clean up uploaded file
        fs_1.default.unlinkSync(req.file.path);
        res.json({ message: 'Bulk import completed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.bulkImport = bulkImport;
