"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = require("../controllers/User/data");
const lowercase_1 = __importDefault(require("../middlewares/lowercase"));
const router = express_1.default.Router();
router.post("/progress/save", lowercase_1.default, data_1.storeBackRevisionData);
exports.default = router;
