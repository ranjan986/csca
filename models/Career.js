import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // lucide-react icon name
    categories: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Career', careerSchema);
