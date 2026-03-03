import mongoose from 'mongoose';
import ProctorSession from '../models/ProctorSession.js';

// Upload Snapshot
export const uploadSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, snapshot } = req.body;
        const userId = req.user?._id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated' });
        if (!examId || !attemptId || !snapshot) return res.status(400).json({ message: 'Missing examId, attemptId or snapshot' });
        if (!mongoose.Types.ObjectId.isValid(examId)) return res.status(400).json({ message: 'Invalid examId format' });

        const filter = { userId, examId, attemptId };
        const update = { lastSnapshot: snapshot, lastUpdated: Date.now() };
        const options = { new: true, upsert: true, runValidators: true };

        let session;
        try {
            session = await ProctorSession.findOneAndUpdate(filter, update, options);
        } catch (error) {
            if (error.code === 11000) {
                // Race condition: retry once if document was just created by another process
                console.warn('[Proctor] Snapshot upsert race condition detected, retrying...');
                session = await ProctorSession.findOneAndUpdate(filter, update, options);
            } else {
                throw error;
            }
        }

        res.status(200).json({ message: 'Snapshot uploaded', sessionId: session._id });
    } catch (error) {
        console.error('[Proctor] Snapshot upload error:', error);
        res.status(500).json({ message: 'Server error during snapshot upload', error: error.message });
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

        if (!userId) return res.status(401).json({ message: 'User not authenticated' });
        if (!examId || !attemptId || !idSnapshot) return res.status(400).json({ message: 'Missing examId, attemptId or idSnapshot' });
        if (!mongoose.Types.ObjectId.isValid(examId)) return res.status(400).json({ message: 'Invalid examId format' });

        const filter = { userId, examId, attemptId };
        const update = { idSnapshot, kycData, verificationStatus: 'pending', lastUpdated: Date.now() };
        const options = { new: true, upsert: true, runValidators: true };

        let session;
        try {
            session = await ProctorSession.findOneAndUpdate(filter, update, options).populate('userId', 'firstName lastName');
        } catch (error) {
            if (error.code === 11000) {
                console.warn('[Proctor] ID upload upsert race condition detected, retrying...');
                session = await ProctorSession.findOneAndUpdate(filter, update, options).populate('userId', 'firstName lastName');
            } else {
                throw error;
            }
        }

        if (!session) throw new Error("Failed to create or update proctor session");

        // Notify proctor in real-time
        const io = req.app.get('io');
        if (io) {
            const proctorRoom = `proctor_exam_${examId}`;
            io.to(proctorRoom).emit('new_id_verification', {
                userId,
                examId,
                attemptId,
                studentName: `${session.userId?.firstName || ''} ${session.userId?.lastName || ''}`.trim(),
                sessionId: session._id,
                idSnapshot,
                kycData
            });
        }

        res.status(200).json({ message: "ID Snapshot uploaded successfully", session });
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
