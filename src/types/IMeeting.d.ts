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
    isCompleted: boolean;
    gmeet: {
        tokens: Record<string, any>;
        link: string | null;
    };
    message?: string;
    createdBy: 'mentor' | 'student';
    createdAt: Date;
    updatedAt: Date;
}