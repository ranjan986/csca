import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String }, // Cloudinary URL
    pdfUrl: { type: String },   // Cloudinary URL
    isPreview: { type: Boolean, default: false }, // Whether this is a free demo
    order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String }, // Cloudinary URL
    price: { type: Number, default: 0 },
    category: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
    isActive: { type: Boolean, default: true },
    chapters: [chapterSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
