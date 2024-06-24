type Topic = {
    name: string;
    studiedDate: Date;
    dailyQuizScores: number[][]; 
    weeklyTestScores: number[]; 
    numberOfRevisions: number; 
    efficiency?: number;
  };
  
  const calculateEfficiency = (topics: Topic[]): void => {
    topics.forEach(topic => {
      //daily quiz score
      const totalDailyQuizScore = topic.dailyQuizScores.reduce((acc, quiz) => acc + quiz.reduce((a, b) => a + b, 0), 0);
      const totalDailyQuestions = topic.dailyQuizScores.length * 3;
      const averageDailyQuizScore = totalDailyQuestions ? (totalDailyQuizScore / totalDailyQuestions) : 0;
      const dailyQuizPercentage = averageDailyQuizScore; 
  
      //weekly test score percentage
      const totalWeeklyTestScore = topic.weeklyTestScores.reduce((a, b) => a + b, 0);
      const averageWeeklyTestScore = topic.weeklyTestScores.length ? (totalWeeklyTestScore / topic.weeklyTestScores.length) : 0;
      const weeklyTestPercentage = averageWeeklyTestScore; 
  
      //revision score percentage (out of 20%)
      const revisionPercentage = Math.min(topic.numberOfRevisions * 20, 20); 
  

      const efficiency = (0.42 * dailyQuizPercentage) + (0.38 * weeklyTestPercentage) + (0.2 * revisionPercentage);
  
      
      topic.efficiency = Math.min(efficiency, 100);
    });
  };