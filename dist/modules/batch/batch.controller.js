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
exports.deleteBatch = exports.createBatch = exports.getBatches = void 0;
const batchService = __importStar(require("./batch.service"));
const courseService = __importStar(require("../course/course.service"));
const getBatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const batches = yield batchService.getAllBatches();
        res.json(batches);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getBatches = getBatches;
const createBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { start_year, end_year, course_id } = req.body;
        if (!start_year || !end_year || !course_id) {
            res.status(400).json({ message: 'Start year, End year, and Course ID are required' });
            return;
        }
        const course = yield courseService.getCourseById(Number(course_id));
        if (!course) {
            res.status(400).json({ message: 'Invalid Course ID' });
            return;
        }
        if (Number(end_year) !== Number(start_year) + course.duration_years) {
            res.status(400).json({ message: `End year must be exactly Start year + ${course.duration_years} (Course Duration)` });
            return;
        }
        const result = yield batchService.addBatch(Number(start_year), Number(end_year), Number(course_id));
        res.status(201).json({ message: 'Batch created successfully', batchId: result.insertId });
    }
    catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'This batch already exists for this course' });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.createBatch = createBatch;
const deleteBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield batchService.removeBatch(Number(id));
        res.json({ message: 'Batch deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteBatch = deleteBatch;
