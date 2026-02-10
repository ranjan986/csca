import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText: { type: String },
    selectedOption: { type: String },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean, required: true },
    marksObtained: { type: Number, default: 0 }
});

const resultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    examTitle: { type: String },
    responses: [responseSchema],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['Pass', 'Fail'], default: 'Fail' },
    timeTaken: { type: Number }, // in seconds
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Result', resultSchema);
