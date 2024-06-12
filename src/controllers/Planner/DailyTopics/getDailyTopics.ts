const getDailyTopics = (
  continuousRevisionTopics: any,
  backRevisionTopics: any
) => {
  const dailyTopics = [];

  // Add 3 continuous revision topics

  if (continuousRevisionTopics.length > 0) {
    dailyTopics.push(continuousRevisionTopics.shift());
    // Add 2 back revision topics
    for (let i = 0; i < 2; i++) {
      if (backRevisionTopics.length > 0) {
        dailyTopics.push(backRevisionTopics.shift());
      }
    }
  } else {
    for (let i = 0; i < 3; i++) {
      dailyTopics.push(backRevisionTopics.shift());
    }
  }

  return dailyTopics;
};
