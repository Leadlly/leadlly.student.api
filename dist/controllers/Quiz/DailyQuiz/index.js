"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDailQuiz = void 0;
const solvedQuestions_1 = __importDefault(require("../../../models/solvedQuestions"));
const calculateEfficiency_1 = require("../../../helpers/Efficiency/calculateEfficiency");
const saveDailQuiz = async (req, res, next) => {
    try {
        const { topic, questions, studentAnswer, isCorrect, tag } = req.body;
        const topics = [];
        topics.push(topic);
        for (let question of questions) {
            await solvedQuestions_1.default.create({
                question,
                studentAnswer,
                isCorrect,
                tag
            });
        }
        await (0, calculateEfficiency_1.calculateEfficiency)(topics, req.user);
        res.status(200).json({
            sucess: true,
            message: "Saved",
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.saveDailQuiz = saveDailQuiz;
