"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
  student: {
    type: mongoose_1.default.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {},
  studentAnswer: {},
  isCorrect: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const SolvedQuestions = mongoose_1.default.model(
  "SolvedQuestions",
  questionSchema,
);
exports.default = SolvedQuestions;
