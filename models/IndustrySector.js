import mongoose from 'mongoose';

const industrySectorSchema = new mongoose.Schema({
    id: { type: String, required: true }, // e.g., 'bfsi'
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    desc: { type: String, required: true },
    roles: { type: String },
    risks: { type: String },
    rec: { type: String },
    icon: { type: String, required: true }, // lucide-react icon name
    color: { type: String, required: true }, // e.g., 'from-blue-600/10 to-transparent'
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('IndustrySector', industrySectorSchema);
