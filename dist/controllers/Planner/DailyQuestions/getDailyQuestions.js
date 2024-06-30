"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyQuestions = void 0;
const db_1 = require("../../../db/db");
const getDailyQuestions = async (day, date, dailyTopics) => {
    try {
        const questions = db_1.questions_db.collection("questionbanks");
        const results = {};
        const categories = ["jeemains_easy", "neet", "boards", "jeemains", "jeeadvance"];
        for (let topicData of dailyTopics) {
            const topic = topicData.topic.name;
            console.log(topic);
            results[topic] = [];
            let remainingQuestions = 3;
            for (let category of categories) {
                if (remainingQuestions > 0) {
                    const query = { topics: topic, level: category };
                    const topicQuestions = await questions.aggregate([
                        { $match: query },
                        { $sample: { size: remainingQuestions } }
                    ]).toArray();
                    results[topic].push(...topicQuestions);
                    remainingQuestions -= topicQuestions.length;
                }
                else {
                    break;
                }
            }
        }
        return results;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to retrieve daily questions");
    }
};
exports.getDailyQuestions = getDailyQuestions;
