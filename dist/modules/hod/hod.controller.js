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
exports.getProfile = exports.getStats = exports.deleteHod = exports.updateHod = exports.createHod = exports.getHods = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hodService = __importStar(require("./hod.service"));
const getHods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hods = yield hodService.getAllHods();
        res.json(hods);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getHods = getHods;
const createHod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, password, experience, qualification, position, department_id } = req.body;
        let documents = [];
        let image_url;
        if (req.files) {
            const files = req.files;
            if (files.documents) {
                documents = files.documents.map(f => f.filename);
            }
            if (files.image) {
                image_url = files.image[0].filename;
            }
        }
        if (!name || !phone || !password || !department_id) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const result = yield hodService.addHod({
            name, phone, hashedPassword, experience, qualification, position, image_url,
            department_id, documents: JSON.stringify(documents)
        });
        res.status(201).json({ message: 'HOD created successfully', hodId: result.insertId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createHod = createHod;
const updateHod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, phone, experience, qualification, position, department_id } = req.body;
        let documents;
        let image_url;
        if (req.files) {
            const files = req.files;
            if (files.documents) {
                documents = files.documents.map(f => f.filename);
            }
            if (files.image) {
                image_url = files.image[0].filename;
            }
        }
        yield hodService.editHod(Number(id), {
            name, phone, experience, qualification, position, image_url, department_id,
            documents: documents ? JSON.stringify(documents) : undefined
        });
        res.json({ message: 'HOD updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateHod = updateHod;
const deleteHod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield hodService.removeHod(Number(id));
        res.json({ message: 'HOD deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteHod = deleteHod;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const hod = yield hodService.getHodByUserId(userId);
        if (!hod) {
            res.status(403).json({ message: 'Access denied.' });
            return;
        }
        const stats = yield hodService.getDashboardStats(hod.department_id);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStats = getStats;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const hod = yield hodService.getHodByUserId(Number(userId));
        if (!hod) {
            res.status(404).json({ message: 'HOD profile not found' });
            return;
        }
        res.json(hod);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProfile = getProfile;
