import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: 1 },
});

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // in minutes
    totalQuestions: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    questions: [questionSchema], // Array of questions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
