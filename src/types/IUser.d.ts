import { Document } from "mongoose";

interface IUser extends Document {
  firstname: string; 
  lastname?: string; 
  email: string;
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
  parent: {
    name?: string;
    phone?: string;
  }
  address:{
    country?:string;
    addressLine?:string;
    pincode?:number;
  },
  academic:{
    standard: number;
    competitiveExam?: string;
    subjects?: Array;
    schedule?: string;
    coachingMode?: string;
    coachingName?: string;
    coachingAddress?: string;
    schoolOrCollegeName?: string;
    schoolOrCollegeAddress?: string
  }
  about: {
    dateOfBirth?: string;
    gender: string;
  };
  role?: string;
  details?: {
    level?: number;
    points?: number;
    streak?: number;
    mood?: Array<{
      day: String;
      emoji: String;
    }>;
  };
  badges?: Array<{
    name: string;
    url: string;
  }>;
  points?: number; 
  subscription: {
    type?: string; 
    id?: string;
    status?: string; 
    dateOfActivation?: Date;
    freeTrialAvailed?: boolean;
  };
  refund: {
    type?: string;
    subscriptionType?: string;
    status?: string;
    amount?: string;
  };
  quiz?: {
    minor?: any[]; 
    major?: any[]; 
  };
  resetPasswordToken?: string | null;
  resetTokenExpiry?: string | null;
  createdAt?: Date; // Optional as it has a default value
  comparePassword(candidatePassword: string): Promise<boolean>;
  getToken(): Promise<string>;
}


export default IUser;
