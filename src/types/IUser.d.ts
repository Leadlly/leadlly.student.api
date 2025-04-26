import { Document, ObjectId } from "mongoose";
import { Institute } from "../models/intitutesModel";

export interface ISubject {
  name: string;
  overall_efficiency?: number;
  overall_progress?: number;
  total_questions_solved: { 
    number?: number;
    percentage?: number;
  };
}

interface IAcademic {
  standard: number;
  competitiveExam?: string | null;
  subjects: ISubject[];
  schedule?: string | null;
  coachingMode?: string | null;
  coachingName?: Institute | null;
  coachingAddress?: string | null;
  schoolOrCollegeName?: string | null;
  schoolOrCollegeAddress?: string | null;
}

interface IUser extends Document {
  firstname: string;
  lastname?: string;
  email: string;
  category: string | null;
  phone: {
    personal?: number;
    other?: number;
  };
  password: string;
  salt: string;
  avatar?: {
    public_id?: string;
    url?: string;
  };
  planner: boolean;
  preferences: {
    continuousData: { nextDay: boolean }; 
    dailyQuestions: number; 
    backRevisionTopics: number;   
  },
  parent: {
    name?: string;
    phone?: string;
  };
  mentor: {
    _id: ObjectId;
  };
  institute: {
    _id: ObjectId;
    name?: string;
    logo?: {
      key?: string;
      url?: string;
    };
  };
  batches: Array<{
    _id: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    requestedAt: Date;
  }>;
  classes: Array<{
    _id: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    requestedAt: Date;
  }>;
  address: {
    country?: string;
    addressLine?: string;
    pincode?: number;
  };
  academic: IAcademic;
  about: {
    dateOfBirth?: string;
    gender: string;
  };
  role?: string;
  details: {
    level?: { number: number};
    points?: { number: number};
    streak?: { number: number, updatedAt: Date};
    mood?: Array<{
      day: string;
      date: string | null;
      emoji: string | null;
    }>;
    report?: {
      dailyReport?: {
        date: Date,
        session:  number,
        quiz:  number,
        overall?: number
      }
    }    
  };
  badges?: Array<{
    name: string;
    url: string;
  }>;
  points?: number;
  subscription: {
    id?: string; 
    status: string; 
    planId: string; 
    duration: number; 
    dateOfActivation: Date | undefined; 
    dateOfDeactivation: Date | undefined; 
    coupon?: string;
  
    upgradation?: {
      previousPlanId?: string; 
      previousDuration?: number; 
      dateOfUpgradation?: Date; 
      addedDuration?: number; 
    };
  };
  freeTrial: {
    availed?: boolean;
    active?: boolean;
    dateOfActivation?: Date;
    dateOfDeactivation?: Date;
  };
  refund: {
    type?: string;
    subscriptionType?: string;
    status?: string;
    amount?: string;
  };
  disabled: boolean;
  resetPasswordToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date; 
  updatedAt?: Date; 
  comparePassword(candidatePassword: string): Promise<boolean>;
  getToken(): Promise<string>;
}

export default IUser;
