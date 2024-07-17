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
      if (tracker.chapter) {
        tracker.chapter.overall_efficiency = fullDocument.chapter.overall_efficiency;
      }
      tracker.topics[topicIndex].plannerFrequency = fullDocument.topic.plannerFrequency;
      tracker.topics[topicIndex].overall_efficiency = fullDocument.topic.overall_efficiency;
      tracker.topics[topicIndex].studiedAt = fullDocument.topic.studiedAt;
      tracker.updatedAt = new Date();

      await Tracker.updateOne(
        { _id: tracker._id, "topics.name": topicName },
        {
          $set: {
            "topics.$": tracker.topics[topicIndex],
            "chapters.$.overall_efficiency": fullDocument.chapter.overall_efficiency,
            updatedAt: new Date()
          }
        }
      );
      console.log('Topic already present in the tracker, updated the topic information', tracker.topics[topicIndex]);
    } else {
      // Topic does not exist, add it to the tracker
      tracker.topics.push(fullDocument.topic);
      await tracker.save();
      console.log('New topic added to existing tracker');
    }

  } catch (error) {
    console.log(error);
  }
};

export default updateStudentTracker;
