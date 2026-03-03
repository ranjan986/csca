import mongoose from 'mongoose';
import ProctorSession from '../models/ProctorSession.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload base64 to Cloudinary
const uploadToBase64 = async (base64String, folder = 'proctor-snapshots') => {
    try {
        const result = await cloudinary.uploader.upload(base64String, {
            folder: folder,
            resource_type: 'image'
        });
        return result.secure_url;
    } catch (error) {
        console.error('[Cloudinary] Upload error:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
};

// Upload Snapshot
export const uploadSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, snapshot } = req.body;
        const userId = req.user?._id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated' });
        if (!examId || !attemptId || !snapshot) return res.status(400).json({ message: 'Missing required fields' });
        if (!mongoose.Types.ObjectId.isValid(examId)) return res.status(400).json({ message: 'Invalid examId format' });

        // Upload to Cloudinary instead of storing base64
        const imageUrl = await uploadToBase64(snapshot, `proctor/exams/${examId}/snapshots`);

        const filter = { userId, examId, attemptId };
        const update = { lastSnapshot: imageUrl, lastUpdated: Date.now() };
        const options = { new: true, upsert: true, runValidators: true };

        let session;
        try {
            session = await ProctorSession.findOneAndUpdate(filter, update, options);
        } catch (error) {
            if (error.code === 11000) {
                session = await ProctorSession.findOneAndUpdate(filter, update, options);
            } else {
                throw error;
            }
        }

        // Return only the URL and basic info to keep response size small (Vercel limit)
        res.status(200).json({
            message: 'Snapshot uploaded',
            url: imageUrl,
            sessionId: session._id
        });
    } catch (error) {
        console.error('[Proctor] Snapshot upload error:', error);
        res.status(500).json({ message: 'Server error during snapshot upload', error: error.message });
    }
};

// Get Active Sessions for an Exam (Admin only)
export const getActiveSessions = async (req, res) => {
    try {
        const sessions = await ProctorSession.find({ examId: req.params.examId })
            .populate('userId', 'firstName lastName email')
            .sort({ lastUpdated: -1 });

        res.status(200).json(sessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload ID Snapshot
export const uploadIdSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, idSnapshot, kycData } = req.body;
        const userId = req.user?._id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated' });
        if (!examId || !attemptId || !idSnapshot) return res.status(400).json({ message: 'Missing required fields' });
        if (!mongoose.Types.ObjectId.isValid(examId)) return res.status(400).json({ message: 'Invalid examId format' });

        // Upload ID to Cloudinary
        const idUrl = await uploadToBase64(idSnapshot, `proctor/exams/${examId}/ids`);

        const filter = { userId, examId, attemptId };
        const update = { idSnapshot: idUrl, kycData, verificationStatus: 'pending', lastUpdated: Date.now() };
        const options = { new: true, upsert: true, runValidators: true };

        let session;
        try {
            session = await ProctorSession.findOneAndUpdate(filter, update, options).populate('userId', 'firstName lastName');
        } catch (error) {
            if (error.code === 11000) {
                session = await ProctorSession.findOneAndUpdate(filter, update, options).populate('userId', 'firstName lastName');
            } else {
                throw error;
            }
        }

        if (!session) throw new Error("Failed to create or update proctor session");

        // Notify proctor in real-time with the URL
        const io = req.app.get('io');
        if (io) {
            const proctorRoom = `proctor_exam_${examId}`;
            io.to(proctorRoom).emit('new_id_verification', {
                userId,
                examId,
                attemptId,
                studentName: `${session.userId?.firstName || ''} ${session.userId?.lastName || ''}`.trim(),
                sessionId: session._id,
                idSnapshot: idUrl, // This is now a Cloudinary URL
                kycData
            });
        }

        res.status(200).json({
            message: "ID Snapshot uploaded successfully",
            url: idUrl,
            sessionId: session._id
        });
    } catch (error) {
        console.error('[Proctor] ID upload error:', error);
        res.status(500).json({ message: 'Server error during ID upload', error: error.message });
    }
};

// Verify ID (Admin only)
export const verifyId = async (req, res) => {
    try {
        const { sessionId, status } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const session = await ProctorSession.findByIdAndUpdate(
            sessionId,
            { verificationStatus: status, lastUpdated: Date.now() },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Notify Student via Socket.io
        const io = req.app.get('io');
        const room = `${session.examId.toString()}_${session.userId.toString()}_${session.attemptId}`;
        console.log(`[Backend] Emitting verification_updated to room: ${room} with status: ${status}`);
        io.to(room).emit('verification_updated', { status });

        res.status(200).json({ message: `ID ${status}`, session });
    } catch (error) {
        console.error('Verify ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get My Session (Student)
export const getMySession = async (req, res) => {
    try {
        const session = await ProctorSession.findOne({
            userId: req.user._id,
            examId: req.params.examId,
            attemptId: req.params.attemptId
        });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
