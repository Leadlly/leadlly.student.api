import { Document } from 'mongoose';

interface IUser extends Document {
  name: string;                       // required in the schema
  email: string;                      // required and unique in the schema
  phone?: {
    personal?: number;                // optional and unique in the schema
    other?: number;                   // optional in the schema
  };
  password: string;                   // required in the schema but not selected by default
  avatar?: {
    public_id?: string;
    url?: string;
  };
  about?: {
    standard?: number;
    school?: string;
    dob?: string;
  };
  role?: string;
  badges?: Array<{
    name: string;
    url: string;
  }>;
  points?: number;                    // Any type or specify a more detailed type if known
  subscription: {
    type?: string;                    // Any type or specify a more detailed type if known
    id?: string;
    status?: string                    // Any type or specify a more detailed type if known
  };
  refund: {
    type?: string,
    subscriptionType?: string
    status?: string,
    amount?: string
  };
  quiz?: {
    minor?: any[];                    // Any type or specify a more detailed type if known
    major?: any[];                    // Any type or specify a more detailed type if known
  };
  resetPasswordToken?: string | null;
  resetTokenExpiry?: string | null,
  createdAt?: Date;                   // Optional as it has a default value
  comparePassword(candidatePassword: string): Promise<boolean>;
  getToken(): Promise<string>;
}

export default IUser;