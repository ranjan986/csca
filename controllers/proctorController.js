import ProctorSession from '../models/ProctorSession.js';

// Upload Snapshot
export const uploadSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, snapshot } = req.body;
        const userId = req.user.id;

        if (!examId || !attemptId || !snapshot) {
            return res.status(400).json({ message: 'Missing examId, attemptId or snapshot' });
        }

        // upsert: true -> create if not exists, update if exists
        const session = await ProctorSession.findOneAndUpdate(
            { userId, examId, attemptId },
            { lastSnapshot: snapshot, lastUpdated: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Snapshot uploaded', sessionId: session._id });
    } catch (error) {
        console.error('Snapshot upload error:', error);
        res.status(500).json({ message: 'Server error' });
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
        const userId = req.user.id;

        if (!examId || !attemptId || !idSnapshot) {
            return res.status(400).json({ message: 'Missing examId, attemptId or idSnapshot' });
        }

        const session = await ProctorSession.findOneAndUpdate(
            { userId, examId, attemptId },
            { idSnapshot, kycData, verificationStatus: 'pending', lastUpdated: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'ID uploaded', sessionId: session._id });
    } catch (error) {
        console.error('ID upload error:', error);
        res.status(500).json({ message: 'Server error' });
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
            userId: req.user.id,
            examId: req.params.examId,
            attemptId: req.params.attemptId
        });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
