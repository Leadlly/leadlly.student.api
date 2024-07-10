import Tracker from "../../models/trackerModel";
import IDataSchema from "../../types/IDataSchema";

const updateStudentTracker = async (fullDocument: IDataSchema) => {
  try {
    let tracker = await Tracker.findOne({
      user: fullDocument.user,
      "subject.name": fullDocument.subject.name,
      'chapter.name': fullDocument.chapter.name
    });

    if (!tracker) {
      console.log('Tracker not found, nothing to update');
      return; 
    }

    const topicExists = tracker.topics.some(topic => topic.name === fullDocument.topic.name);
    if (topicExists) {
      console.log('Topic already present in the tracker');
      return; 
    }

    // Push the new topic to the existing tracker
    tracker.topics.push(fullDocument.topic);
    await tracker.save();

    console.log('Tracker updated with new topic');
  } catch (error) {
    console.log(error);
  }
};

export default updateStudentTracker;
