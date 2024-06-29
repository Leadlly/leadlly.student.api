export const getSubjectList = (exam: string): string[] => {
    switch (exam.toLowerCase()) {
        case 'jee':
            return ['maths', 'physics', 'chemistry'];
        case 'neet':
            return ['biology', 'physics', 'chemistry'];
        default:
            return [];
    }
};
