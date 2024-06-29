import moment from "moment";
import { StudyData } from "../../../models/studentData";
import IDataSchema from "../../../types/IDataSchema";

const getWeekNumber = (startDate: Date, currentDate: Date) => {
    const start = moment(startDate);
    const current = moment(currentDate);
    return current.diff(start, 'weeks') + 1;
};

export const getBackRevistionTopics = async (studentId: string, dateOfSubscription: Date) => {

    console.log("inside back revision")
    const activeContinuousRevisionTopics = await StudyData.find({
        user: studentId,
        tag: 'active_continuous_revision',
    }).exec() as IDataSchema[];

    const unrevisedTopics = await StudyData.find({
        user: studentId,
        tag: 'unrevised_topic',
    }).exec() as IDataSchema[];

    const continuousLowEfficiency = activeContinuousRevisionTopics.filter(data => data.topic.overall_efficiency! < 40);
    const unrevisedLowEfficiency = unrevisedTopics.filter(data => data.topic.overall_efficiency! < 40);

    console.log("1")
    const continuousModerateEfficiency = activeContinuousRevisionTopics.filter(data => data.topic.overall_efficiency! >= 40 && data.topic.overall_efficiency! < 60);

    const currentWeek = getWeekNumber(dateOfSubscription, new Date());

    let backRevisionTopics: IDataSchema[] = [];

    if (currentWeek === 1 || currentWeek === 2) {
        // Week 1 and Week 2: backRevisionTopics contains only unrevised topics
        backRevisionTopics = unrevisedTopics;

        console.log("3 week1 2")
    } else {
        // For Week 3 onwards:
        // Determine the reference week to fetch topics from
        const referenceWeek = currentWeek - 2; // Fetch topics from the previous week

        // Filter topics based on the reference week
        const filteredContinuousLowEfficiency = continuousLowEfficiency.filter(data => getWeekNumber(data.updatedAt!, new Date()) === referenceWeek);
        const filteredUnrevisedLowEfficiency = unrevisedLowEfficiency.filter(data => getWeekNumber(data.updatedAt!, new Date()) === referenceWeek);
        const filteredUnrevisedTopics = unrevisedTopics.filter(data => getWeekNumber(data.updatedAt!, new Date()) === referenceWeek);
        console.log("4 week2")
        // Construct the backRevisionTopics array in the specified order
        backRevisionTopics = [
            ...filteredContinuousLowEfficiency,
            ...filteredUnrevisedLowEfficiency,
            ...filteredUnrevisedTopics,
            ...continuousModerateEfficiency
        ];
    }

    return backRevisionTopics;
};
