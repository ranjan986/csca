import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Add the custom 'id' for front-end matching (like 'cvs-apt')
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    code: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    color: { type: String, required: true },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Certification', certificationSchema);
