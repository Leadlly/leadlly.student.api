import createStudentTracker from '../functions/CreateTracker';
import IDataSchema from '../types/IDataSchema';
import { StudyData } from '../models/studentData';

export const watchStudyDataCollection = async () => {
    // Create a change stream to watch for changes in the collection
    const changeStream = StudyData.watch([], { fullDocument: 'updateLookup' });
  
    changeStream.on('change', async (change) => {
      try {
        let fullDocument: IDataSchema | undefined;
  
        switch (change.operationType) {
          case 'update':
          case 'replace':
            fullDocument = change.fullDocument as IDataSchema;
            break;
  
          default:
            console.log(`Unhandled change operation: ${change.operationType}`);
            return;
        }
  
        if (fullDocument) {
          await createStudentTracker(fullDocument);
        }
      } catch (error) {
        console.error('Error processing change:', error);
      }
    });
  
    changeStream.on('error', (error) => {
      console.error('Change stream error:', error);
    });
  };
