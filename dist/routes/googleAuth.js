"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAuth_1 = require("../controllers/googleAuth");
const router = express_1.default.Router();
router.post("/auth", googleAuth_1.googleAuth);
exports.default = router;
