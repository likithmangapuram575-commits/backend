"use strict";
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
exports.login = void 0;
const auth_service_1 = require("./auth.service");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            res.status(400).json({ message: 'Phone and password are required' });
            return;
        }
        const { user, token } = yield (0, auth_service_1.authenticateUser)(phone, password);
        res.json({ message: 'Login successful', token, user });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
});
exports.login = login;
