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
    attemptId: {
        type: String,
        required: true
    },
    lastSnapshot: {
        type: String, // Base64 string
        required: true
    },
    idSnapshot: {
        type: String, // Base64 string of student ID
        required: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    kycData: {
        idType: String,
        idNumber: String,
        fullName: String
    },
    messages: [
        {
            sender: String, // 'student' or 'proctor'
            text: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure we can quickly find a specific attempt session
proctorSessionSchema.index({ userId: 1, examId: 1, attemptId: 1 }, { unique: true });

const ProctorSession = mongoose.model('ProctorSession', proctorSessionSchema);
export default ProctorSession;
