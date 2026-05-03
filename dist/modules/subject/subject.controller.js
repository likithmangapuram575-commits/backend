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
exports.removeSubject = exports.editSubject = exports.createSubject = exports.getSubjects = void 0;
const subjectService = __importStar(require("./subject.service"));
const getSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield subjectService.getAllSubjects();
        res.json(subjects);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSubjects = getSubjects;
const createSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, credits, type, department_id, semester } = req.body;
        if (!name || !code || !credits || !type || !department_id || !semester) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const result = yield subjectService.addSubject({
            name, code, credits: Number(credits), type, department_id: Number(department_id), semester: Number(semester)
        });
        res.status(201).json({ message: 'Subject created successfully', id: result.insertId });
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Subject code already exists' });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.createSubject = createSubject;
const editSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, code, credits, type, department_id, semester } = req.body;
        yield subjectService.updateSubject(Number(id), {
            name, code, credits: Number(credits), type, department_id: Number(department_id), semester: Number(semester)
        });
        res.json({ message: 'Subject updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.editSubject = editSubject;
const removeSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield subjectService.deleteSubject(Number(id));
        res.json({ message: 'Subject deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.removeSubject = removeSubject;
