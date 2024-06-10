"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Course_1 = require("../controllers/Course");
const router = express_1.default.Router();
router.post('/create', Course_1.createCourse);
// router.get('/:id', getCourse)
router.get('/all', Course_1.getAllCourses);
router.post('/payment/:id', Course_1.coursePayment);
router.post('/verifypayment', Course_1.verifyPayment);
exports.default = router;
