"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyQuestions = void 0;
const db_1 = require("../../../db/db");
const getDailyQuestions = async (day, date, dailyTopics) => {
    try {
        const questions = db_1.questions_db.collection("questions");
        const results = {};
        const query = { topics: { $in: dailyTopics }, level: { $in: ["jeemains", "jeemains_easy"] } };
        const allTopicQuestions = await questions.find(query).toArray();
        for (let topic of dailyTopics) {
            const filteredQuestions = allTopicQuestions.filter(question => question.topics.includes(topic));
            results[topic] = filteredQuestions.slice(0, 3);
        }
        return results;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to retrieve daily questions");
    }
};
exports.getDailyQuestions = getDailyQuestions;
