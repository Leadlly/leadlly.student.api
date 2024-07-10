import mongoose from 'mongoose';
import { StudyData } from '../../models/studentData';
import IUser from '../../types/IUser';
import { questions_db } from '../../db/db';

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

            // Calculate the average efficiency for the subject
            let subjectEfficiency = chapterCount > 0 ? totalEfficiency / chapterCount : 0;

            // Round off the efficiency to two decimal places
            subjectEfficiency = Math.round(subjectEfficiency * 100) / 100;

            // Update the subject efficiency in the StudyData model
            // await StudyData.updateMany(
            //     {
            //         user: user._id,
            //         'subject.name': subjectName,
            //     },
            //     {
            //         $set: {
            //             'subject.overall_efficiency': subjectEfficiency,
            //         }
            //     }
            // );

            console.log(`Subject ${subjectName} efficiency calculated: ${subjectEfficiency}`);
        }
    } catch (error) {
        console.error('Error calculating subject efficiency:', error);
        throw new Error('Failed to calculate subject efficiency');
    }
};
