"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../middlewares/checkAuth");
const Planner_1 = require("../controllers/Planner");
const router = express_1.default.Router();
router.post('/create', checkAuth_1.checkAuth, Planner_1.createPlanner);
router.post('/update', checkAuth_1.checkAuth, Planner_1.updateDailyPlanner);
exports.default = router;
