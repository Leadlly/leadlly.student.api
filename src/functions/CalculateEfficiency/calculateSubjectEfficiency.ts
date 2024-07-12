import { StudyData } from '../../models/studentData';
import IUser from '../../types/IUser';
import { questions_db } from '../../db/db';
import User from '../../models/userModel';

export const calculateSubjectEfficiency = async (subjectName: string, user: IUser) => {
    try {
        // Fetch all chapters for the given subject
        const chapters = await questions_db.collection("chapters").aggregate([
            { $match: { subjectName: subjectName } }
        ]).toArray();

        // If chapters are found, proceed to calculate the overall efficiency
        if (chapters.length > 0) {
            // Calculate the sum of overall efficiency and the count of chapters
            let totalEfficiency = 0;
            let chapterCount = 0;

            for (let chapter of chapters) {
                const studyData = await StudyData.findOne({
                    user: user._id,
                    'chapter.name': chapter.name,
                    'subject.name': subjectName,
                });

                if (studyData) {
                    totalEfficiency += studyData.chapter.overall_efficiency!;
                    chapterCount++;
                }
            }

            let subjectEfficiency = chapterCount > 0 ? totalEfficiency / chapterCount : 0;
            subjectEfficiency = Math.round(subjectEfficiency * 100) / 100;
    
            const userDoc = await User.findById(user._id) as IUser;

            if (userDoc) {
            
                const subject = userDoc.academic.subjects.find(sub => sub.name === subjectName);

                if (subject) {
                    // Update the efficiency
                    subject.overall_efficiency = subjectEfficiency;
                } else {
                    // If the subject does not exist, add it
                    userDoc.academic.subjects.push({
                        name: subjectName,
                        overall_efficiency: subjectEfficiency,
                        overall_progress: 0,
                        total_questions_solved: 0,
                    });
                }

                // Save the updated user document
                await userDoc.save();

                console.log(`Subject ${subjectName} efficiency calculated and updated: ${subjectEfficiency}`);
            } else {
                throw new Error('User not found');
            }
        }
    } catch (error) {
        console.error('Error calculating subject efficiency:', error);
        throw new Error('Failed to calculate subject efficiency');
    }
};
