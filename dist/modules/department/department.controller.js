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
exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const departmentService = __importStar(require("./department.service"));
const getDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield departmentService.getAllDepartments();
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDepartments = getDepartments;
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, course_id } = req.body;
        if (!name || !course_id) {
            res.status(400).json({ message: 'Name and Course ID are required' });
            return;
        }
        const result = yield departmentService.addDepartment(name, Number(course_id));
        res.status(201).json({ message: 'Department created successfully', departmentId: result.insertId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createDepartment = createDepartment;
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, course_id } = req.body;
        if (!name || !course_id) {
            res.status(400).json({ message: 'Name and Course ID are required' });
            return;
        }
        yield departmentService.editDepartment(Number(id), name, Number(course_id));
        res.json({ message: 'Department updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateDepartment = updateDepartment;
const deleteDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield departmentService.removeDepartment(Number(id));
        res.json({ message: 'Department deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteDepartment = deleteDepartment;
