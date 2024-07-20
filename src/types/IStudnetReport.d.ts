import { Document, Schema, model } from "mongoose";

interface IReport {
    session: number;
    quiz: number;
    overall: number;
  }
  
  interface IDailyReport extends IReport {}
  
  interface IWeeklyReport extends IReport {
    day: string;
    date: Date;
  }
  
  interface IMonthlyReport extends IReport {}
  
  interface IOverallReport extends IReport {}
  
  export interface IStudentReport extends Document {
    user: Schema.Types.ObjectId;
    dailyReport: IDailyReport;
    weeklyReport: IWeeklyReport[];
    monthlyReport: IMonthlyReport[];
    overallReport: IOverallReport[];
    createdAt: Date;
    updatedAt: Date;
  }