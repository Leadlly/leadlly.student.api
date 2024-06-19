import { Document } from "mongoose";

interface IUser extends Document {
  name: string; 
  email: string;
  phone?: {
    personal?: number; 
    other?: number; 
  };
  password: string; 
  avatar?: {
    public_id?: string;
    url?: string;
  };
  about: {
    standard: number;
    school?: string;
    dob?: string;
    schedule: string;
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
    dateOfActivation?: Date
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
