"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyTopics = void 0;
const getDailyTopics = (continuousRevisionTopics, backRevisionTopics, user) => {
    const dailyContinuousTopics = [];
    const dailyBackTopics = [];
    // Add 3 continuous revision topics
    if (continuousRevisionTopics.length > 0) {
        const topic = continuousRevisionTopics.shift();
        if (topic) {
            dailyContinuousTopics.push(topic);
        }
        // Add 2 back revision topics
        for (let i = 0; i < 2; i++) {
            const backTopic = backRevisionTopics.shift();
            if (backTopic) {
                dailyBackTopics.push(backTopic);
            }
        }
    }
    else {
        for (let i = 0; i < 3; i++) {
            const backTopic = backRevisionTopics.shift();
            if (backTopic) {
                dailyBackTopics.push(backTopic);
            }
        }
    }
    return {
        dailyContinuousTopics,
        dailyBackTopics
    };
};
exports.getDailyTopics = getDailyTopics;
