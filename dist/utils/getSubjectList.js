"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectList = void 0;
const getSubjectList = (exam) => {
    switch (exam.toLowerCase()) {
        case 'jee':
            return ['maths', 'physics', 'chemistry'];
        case 'neet':
            return ['biology', 'physics', 'chemistry'];
        default:
            return [];
    }
};
exports.getSubjectList = getSubjectList;
