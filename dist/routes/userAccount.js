"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = require("../controllers/UserAccount/data");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.post("/study/save", checkAuth_1.checkAuth, data_1.storeBackRevisionData);
exports.default = router;
