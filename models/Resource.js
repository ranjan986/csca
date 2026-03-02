import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['Blog', 'Whitepaper', 'Blueprint', 'Handbook', 'Case Study']
    },
    tag: { type: String }, // e.g., 'SECURITY', 'INFRASTRUCTURE'
    outcome: { type: String }, // e.g., 'STRATEGIC_DEFENSE'
    details: [{
        label: String,
        value: String
    }], // Key-value pairs like "READ_TIME: 12 MIN"
    link: { type: String }, // URL to the resource or internal route
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
