import Tracker from "../../../models/trackerModel";
import IDataSchema from "../../../types/IDataSchema";

const updateStudentTracker = async (fullDocument: IDataSchema) => {
  try {
    const subjectName = fullDocument.subject.name.trim().toLowerCase();
    const chapterName = fullDocument.chapter.name.trim().toLowerCase();
    const topicName = fullDocument.topic.name.trim().toLowerCase();

    let tracker = await Tracker.findOne({
      user: fullDocument.user,
      "subject.name": subjectName,
      'chapter.name': chapterName
    });

    if (!tracker) {
      console.log('Tracker not found, nothing to update');
      return; 
    }

    const topicIndex = tracker.topics.findIndex(topic => topic.name === topicName);

    if (topicIndex !== -1) {
      // Topic exists, update its information
      tracker.topics[topicIndex].plannerFrequency = fullDocument.topic.plannerFrequency;
      tracker.topics[topicIndex].overall_efficiency = fullDocument.topic.overall_efficiency;
      tracker.topics[topicIndex].studiedAt = fullDocument.topic.studiedAt;
      console.log('Topic already present in the tracker, updated the topic information');
    } else {
      // Topic does not exist, add it to the tracker
      tracker.topics.push(fullDocument.topic);
      console.log('New topic added to existing tracker');
    }

    await tracker.save();
    console.log('Tracker updated successfully');
  } catch (error) {
    console.log(error);
  }
};

export default updateStudentTracker;
