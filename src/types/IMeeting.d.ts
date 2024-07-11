export interface IMeeting extends Document {
    date: Date;
    time: string;
    student: mongoose.Types.ObjectId;
    mentor: mongoose.Types.ObjectId;
    accepted: boolean;
    rescheduled: {
        isRescheduled: boolean;
        date?: Date;
        time?: string;
    };
    gmeet: {
        tokens: Record<string, any>;
        link: string | null;
    };
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}