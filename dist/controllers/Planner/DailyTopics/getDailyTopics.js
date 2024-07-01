"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyTopics = void 0;
const getDailyTopics = (continuousRevisionTopics, backRevisionTopics, user) => {
    const dailyBackTopics = [];
    // If continuous revision topics are available
    if (continuousRevisionTopics.length > 0) {
        // Add 2 back revision topics
        for (let i = 0; i < 2; i++) {
            const backTopic = backRevisionTopics.shift();
            if (backTopic) {
                dailyBackTopics.push(backTopic);
            }
        }
    }
    else {
        // If no continuous revision topics, add 3 back revision topics
        for (let i = 0; i < 3; i++) {
            const backTopic = backRevisionTopics.shift();
            if (backTopic) {
                dailyBackTopics.push(backTopic);
            }
        }
    }
    return {
        dailyContinuousTopics: continuousRevisionTopics,
        dailyBackTopics,
    };
};
exports.getDailyTopics = getDailyTopics;
