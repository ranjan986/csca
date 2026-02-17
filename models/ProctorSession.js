import mongoose from 'mongoose';

const proctorSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    lastSnapshot: {
        type: String, // Base64 string
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure we can quickly find the session for a user in an exam
proctorSessionSchema.index({ userId: 1, examId: 1 }, { unique: true });

const ProctorSession = mongoose.model('ProctorSession', proctorSessionSchema);
export default ProctorSession;
