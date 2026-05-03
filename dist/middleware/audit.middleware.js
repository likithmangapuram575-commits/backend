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
exports.auditLog = void 0;
const systemService = __importStar(require("../modules/system/system.service"));
const auditLog = (action, tableName) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const originalJson = res.json;
        // Override res.json to capture the response and log the action
        res.json = function (body) {
            const user = req.user;
            // We only log if the request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                systemService.addAuditLog({
                    user_id: user ? user.id : null,
                    action: action,
                    table_name: tableName,
                    record_id: body.id || body.insertId || (req.params.id ? Number(req.params.id) : null),
                    details: JSON.stringify({
                        method: req.method,
                        url: req.originalUrl,
                        params: req.params,
                        body: req.body
                    })
                }).catch(err => console.error('Audit Log Error:', err));
            }
            return originalJson.call(this, body);
        };
        next();
    });
};
exports.auditLog = auditLog;
