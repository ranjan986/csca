import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    instructor: { type: String, default: 'Instructor' },
    scheduledAt: { type: Date, required: true },
    roomId: { type: String, unique: true }, // Jitsi room ID (auto-generated)
    status: {
        type: String,
        enum: ['scheduled', 'live', 'ended'],
        default: 'scheduled'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate roomId before saving
liveClassSchema.pre('save', function (next) {
    if (!this.roomId) {
        const slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        this.roomId = `csca-${slug}-${Date.now()}`;
    }
    next();
});

export default mongoose.model('LiveClass', liveClassSchema);
