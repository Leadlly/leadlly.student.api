"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./../controllers/User/index");
const express_1 = __importDefault(require("express"));
const data_1 = require("../controllers/User/data");
const checkAuth_1 = require("../middlewares/checkAuth");
const lowercase_1 = __importDefault(require("../middlewares/lowercase"));
const User_1 = require("../controllers/User");
const router = express_1.default.Router();
router.post('/progress/save', checkAuth_1.checkAuth, lowercase_1.default, data_1.storeBackRevisionData);
router.post('/profile/save', checkAuth_1.checkAuth, User_1.studentPersonalInfo);
router.post('/todaysVibe/save', checkAuth_1.checkAuth, index_1.setTodaysVibe);
exports.default = router;
