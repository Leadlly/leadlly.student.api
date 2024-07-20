import { StudentReport } from '../../models/reportModel';
import User from '../../models/userModel';

export const insertStudentReport = () => {
  const changeStream = User.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert') {
        const fullDocument = change.fullDocument;
        await StudentReport.create({
          user: fullDocument._id // Use _id directly from the fullDocument
        });
      }
    } catch (error) {
      console.error('Error processing change stream:', error);
    }
  });

  changeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });
};
