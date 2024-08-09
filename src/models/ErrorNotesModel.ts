import mongoose, { Schema } from 'mongoose';

const ErrorNotesSchema: Schema = new mongoose.Schema({
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	note: { type: String, require: true },
	isCompleted: { type: Boolean, default: false },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const ErrorNotes = mongoose.model('ErrorNotes', ErrorNotesSchema);

export default ErrorNotes;
