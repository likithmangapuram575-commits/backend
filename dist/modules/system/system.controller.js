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
exports.getLogs = exports.removeCalendarEvent = exports.createCalendarEvent = exports.getCalendar = void 0;
const systemService = __importStar(require("./system.service"));
const getCalendar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield systemService.getAllCalendarEvents();
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCalendar = getCalendar;
const createCalendarEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_name, type, start_date, end_date, batch_id } = req.body;
        if (!event_name || !type || !start_date || !end_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const result = yield systemService.addCalendarEvent({
            event_name, type, start_date, end_date, batch_id: batch_id ? Number(batch_id) : undefined
        });
        res.status(201).json({ message: 'Event created successfully', id: result.insertId });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createCalendarEvent = createCalendarEvent;
const removeCalendarEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield systemService.deleteCalendarEvent(Number(id));
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.removeCalendarEvent = removeCalendarEvent;
const getLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logs = yield systemService.getAuditLogs();
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getLogs = getLogs;
