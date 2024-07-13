import IDataSchema from '../../types/IDataSchema';
import { StudyData } from '../../models/studentData';
import User from '../../models/userModel';
import IUser from '../../types/IUser';
import { trackerQueue } from '../../services/bullmq/producer';


export const watchingForCreateTracker = async () => {
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

                    if (updatedFields['tag'] === 'active_continuous_revision' || updatedFields['tag'] === 'active_unrevised_topic') {
                        
                        await trackerQueue.add("createTracker", fullDocument);
                        
                        console.log("Tracker added to queue sucess")
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
