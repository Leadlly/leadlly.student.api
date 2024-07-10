import { StudyData } from '../../models/studentData';
import IUser from '../../types/IUser';
import { questions_db } from '../../db/db';
import IDataSchema from '../../types/IDataSchema';

export const calculateChapterEfficiency = async (chapterName: string, user: IUser) => {
    try {
        // Fetch topics from the questions_db collection
        const topics = await questions_db.collection("topics").aggregate([
            { $match: { chapterName: chapterName } }
        ]).toArray();

        // If topics are found, proceed to calculate the overall efficiency
        if (topics.length > 0) {
            // Calculate the sum of overall efficiency and the count of topics
            let totalEfficiency = 0;
            let topicCount = 0;

            for (let topic of topics) {
                const studyData = await StudyData.findOne({
                    user: user._id,
                    'topic.name': topic.name,
                    'chapter.name': chapterName,
                }) as IDataSchema;

                if (studyData) {
                    totalEfficiency += studyData.topic.overall_efficiency!;
                    topicCount++;
                }
            }

            // Calculate the average efficiency for the chapter
            let chapterEfficiency = topicCount > 0 ? totalEfficiency / topicCount : 0;

            // Round off the efficiency to two decimal places
            chapterEfficiency = Math.round(chapterEfficiency * 100) / 100;

            // Update the chapter efficiency in the StudyData model
            await StudyData.updateMany(
                {
                    user: user._id,
                    'chapter.name': chapterName,
                },
                {
                    $set: {
                        'chapter.overall_efficiency': chapterEfficiency,
                    }
                }
            );

            console.log(`Chapter ${chapterName} efficiency calculated: ${chapterEfficiency}`);
        }
        
    } catch (error) {
        console.error('Error calculating chapter efficiency:', error);
        throw new Error('Failed to calculate chapter efficiency');
    }
};
