"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseControllers_1 = require("../controllers/courseControllers");
const router = express_1.default.Router();
router.post('/create', courseControllers_1.createCourse);
// router.get('/:id', getCourse)
router.get('/all', courseControllers_1.getAllCourses);
router.post('/payment/:id', courseControllers_1.coursePayment);
router.post('/verifypayment', courseControllers_1.verifyPayment);
exports.default = router;
