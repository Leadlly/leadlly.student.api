import { Meeting } from '../../models/meetingModal'
import { meetingQueue } from '../../services/bullmq/producer';


export const sendMeetingsNotification = () => {
  const changeStream = Meeting.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', async (change) => {
    try {
      // Check if the change is an update and if the status field is changed to 'Verified'
      if (change.operationType === 'update' && change.updateDescription && change.updateDescription.updatedFields && change.updateDescription.updatedFields.accepted === true) {
        const fullDocument = change.fullDocument;
        await meetingQueue.add("sendNotification", fullDocument);
      }
    } catch (error) {
      console.error('Error processing change stream:', error);
    }
  });

  changeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });
};
