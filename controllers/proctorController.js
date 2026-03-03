import mongoose from 'mongoose';
import ProctorSession from '../models/ProctorSession.js';

// Upload Snapshot
export const uploadSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, snapshot } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!examId || !attemptId || !snapshot) {
            return res.status(400).json({ message: 'Missing examId, attemptId or snapshot' });
        }

        // Validate ObjectId format for examId to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ message: 'Invalid examId format' });
        }

        console.log(`[Proctor] Snapshot update for exam: ${examId}, attempt: ${attemptId}, user: ${userId}`);

        const session = await ProctorSession.findOneAndUpdate(
            { userId: userId, examId, attemptId },
            { lastSnapshot: snapshot, lastUpdated: Date.now() },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: 'Snapshot uploaded', sessionId: session._id });
    } catch (error) {
        console.error('[Proctor] Snapshot upload error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate session detection. Please try again.' });
        }

        res.status(500).json({
            message: 'Server error during snapshot upload',
            error: error.message,
            type: error.name
        });
    }
};

// Get Active Sessions for an Exam (Admin only)
export const getActiveSessions = async (req, res) => {
    try {
        // Optional: Check if req.user.role === 'admin'

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

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!examId || !attemptId || !idSnapshot) {
            return res.status(400).json({ message: 'Missing examId, attemptId or idSnapshot' });
        }

        // Validate ObjectId format for examId to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ message: 'Invalid examId format' });
        }

        console.log(`[Proctor] ID Upload for exam: ${examId}, attempt: ${attemptId}, user: ${userId}`);

        const session = await ProctorSession.findOneAndUpdate(
            { userId: userId, examId, attemptId },
            { idSnapshot, kycData, verificationStatus: 'pending', lastUpdated: Date.now() },
            { new: true, upsert: true, runValidators: true }
        ).populate('userId', 'firstName lastName');

        if (!session) {
            throw new Error("Failed to create or update proctor session");
        }

        // Notify proctor in real-time
        const io = req.app.get('io');
        if (io) {
            const proctorRoom = `proctor_exam_${examId}`;
            io.to(proctorRoom).emit('new_id_verification', {
                userId: userId,
                examId,
                attemptId,
                studentName: `${session.userId?.firstName || ''} ${session.userId?.lastName || ''}`.trim(),
                sessionId: session._id,
                idSnapshot,
                kycData
            });
            console.log(`[Socket] Emitted new_id_verification to room ${proctorRoom}`);
        }

        console.log(`[Proctor] ID upload successful for user: ${userId}, Session: ${session._id}`);
        res.status(200).json({ message: "ID Snapshot uploaded successfully", session });
    } catch (error) {
        console.error('[Proctor] ID upload error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        if (error.code === 11000) {
            return res.status(409).json({ message: 'Session already exists or is being updated. Please try again.' });
        }

        res.status(500).json({
            message: 'Server error during ID upload',
            error: error.message,
            type: error.name
        });
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
