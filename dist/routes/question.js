"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Question_1 = require("../controllers/Question");
const router = express_1.default.Router();
router.get("/get/chapter", Question_1.getChapter);
router.get("/get/topic", Question_1.getTopic);
router.get("/get/questions", Question_1.getAllQuestion);
exports.default = router;
