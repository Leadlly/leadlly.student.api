import IDataSchema from '../../types/IDataSchema';
import { StudyData } from '../../models/studentData';
import User from '../../models/userModel';
import { calculateSubjectEfficiency } from '../../functions/CalculateEfficiency/calculateSubjectEfficiency';
import IUser from '../../types/IUser';
import updateStudentTracker from '../../functions/UpdateTracker';
import { calculateChapterEfficiency } from '../../functions/CalculateEfficiency/calculateChapterEfficiency';


export const watchingForUpdateTracker = async () => {
    // Create a change stream to watch for changes in the collection
    const changeStream = StudyData.watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', async (change) => {
        try {
            let fullDocument: IDataSchema | undefined;
            let updatedFields: any;

            switch (change.operationType) {
                case 'update':
                    fullDocument = change.fullDocument as IDataSchema;
                    updatedFields = change.updateDescription.updatedFields;
                    break;
                case 'replace':
                    fullDocument = change.fullDocument as IDataSchema;
                    break;
                default:
                    console.log(`Unhandled change operation: ${change.operationType}`);
                    return;
            }

            if (fullDocument) {
                // Find the user based on fullDocument.user
                const user = await User.findById(fullDocument.user) as IUser;
                if (!user) {
                    console.error(`User not found for ID: ${fullDocument.user}`);
                    return;
                }

                if (updatedFields) {
                    const subjectName = fullDocument.subject.name;

                    // Check for topic.overall_efficiency update
                    if (updatedFields['topic.overall_efficiency'] !== undefined) {
                        const chapterName = fullDocument.chapter.name; 
                        await calculateChapterEfficiency(chapterName, user);
                        await updateStudentTracker(fullDocument);
                    }

                    // Check for chapter.overall_efficiency update
                    if (updatedFields['chapter.overall_efficiency'] !== undefined) {
                        await calculateSubjectEfficiency(subjectName, user);
                    }
                }

                
            }
        } catch (error) {
            console.error('Error processing change:', error);
        }
    });

    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
    });
};
