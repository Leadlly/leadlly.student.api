"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const plannerSchema = new mongoose_1.default.Schema({
    student: {
        type: mongoose_1.default.Schema.Types.ObjectId,
    },
    date: String,
    day: String,
    topics: [
        {
            name: String,
            additionalDetails: {
                subject: String,
                chapter: String,
                topic: String,
                subtopic: String,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Planner = mongoose_1.default.model("Planner", plannerSchema);
exports.default = Planner;
