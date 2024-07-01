"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GoogleAuth_1 = require("../controllers/GoogleAuth");
const router = express_1.default.Router();
router.post("/auth", GoogleAuth_1.googleAuth);
exports.default = router;
