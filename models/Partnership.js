import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true
    },
    websiteUrl: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    partnerType: {
        type: String,
        required: true,
        enum: ['Academic Partner', 'Training Partner', 'Technology Partner']
    },
    yearsInBusiness: {
        type: Number
    },
    estimatedStudentsPerYear: {
        type: Number
    },
    contactPersonName: {
        type: String,
        required: true
    },
    officialEmail: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'reviewed', 'approved', 'rejected']
    }
}, { timestamps: true });

const Partnership = mongoose.model("Partnership", partnershipSchema);
export default Partnership;
