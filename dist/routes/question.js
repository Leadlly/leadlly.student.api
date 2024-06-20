"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Question_1 = require("../controllers/Question");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.get("/chapter", checkAuth_1.checkAuth, Question_1.getChapter);
router.get("/topic", checkAuth_1.checkAuth, Question_1.getTopic);
router.get("/question", checkAuth_1.checkAuth, Question_1.getAllQuestion);
exports.default = router;
