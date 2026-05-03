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
exports.deleteSection = exports.updateSection = exports.createSection = exports.getSections = void 0;
const sectionService = __importStar(require("./section.service"));
const getSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { department_id, batch_id, year, semester } = req.query;
        let sections = yield sectionService.getAllSections();
        if (department_id)
            sections = sections.filter(s => s.department_id === Number(department_id));
        if (batch_id)
            sections = sections.filter(s => s.batch_id === Number(batch_id));
        if (year)
            sections = sections.filter(s => s.year === Number(year));
        if (semester)
            sections = sections.filter(s => s.semester === Number(semester));
        res.json(sections);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getSections = getSections;
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, department_id, batch_id, year, semester } = req.body;
        if (!name || !department_id || !batch_id || !year || !semester) {
            res.status(400).json({ message: 'Name, department_id, batch_id, year, and semester are required' });
            return;
        }
        const result = yield sectionService.addSection(name, Number(department_id), Number(batch_id), Number(year), Number(semester));
        res.status(201).json({ message: 'Section created successfully', sectionId: result.insertId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createSection = createSection;
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, department_id, batch_id, year, semester } = req.body;
        if (!name || !department_id || !batch_id || !year || !semester) {
            res.status(400).json({ message: 'Name, department_id, batch_id, year, and semester are required' });
            return;
        }
        yield sectionService.editSection(Number(id), name, Number(department_id), Number(batch_id), Number(year), Number(semester));
        res.json({ message: 'Section updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateSection = updateSection;
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield sectionService.removeSection(Number(id));
        res.json({ message: 'Section deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteSection = deleteSection;
