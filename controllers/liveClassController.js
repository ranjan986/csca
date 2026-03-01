import LiveClass from '../models/LiveClass.js';
import Enrollment from '../models/Enrollment.js';

// Admin: Create/schedule a live class
export const createLiveClass = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const { course, title, instructor, scheduledAt } = req.body;
        const liveClass = new LiveClass({
            course,
            title,
            instructor: instructor || req.user.name,
            scheduledAt,
            createdBy: req.user._id
        });
        await liveClass.save();
        res.status(201).json(liveClass);
    } catch (error) {
        res.status(500).json({ message: 'Error creating live class', error: error.message });
    }
};

// Admin: Get all live classes
export const getAllLiveClasses = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const classes = await LiveClass.find().populate('course', 'title').sort({ scheduledAt: -1 });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live classes' });
    }
};

// Admin: Update status (start / end a class)
export const updateLiveClassStatus = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const { status } = req.body;
        const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        // Notify enrolled students via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`course_${liveClass.course}`).emit('live_class_update', {
                courseId: liveClass.course,
                status,
                roomId: liveClass.roomId,
                title: liveClass.title,
            });
        }

        res.json(liveClass);
    } catch (error) {
        res.status(500).json({ message: 'Error updating live class status' });
    }
};

// Admin: Delete a live class
export const deleteLiveClass = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        await LiveClass.findByIdAndDelete(req.params.id);
        res.json({ message: 'Live class deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting live class' });
    }
};

// Student/Auth: Get active or upcoming live class for a specific course
export const getCourseLiveClass = async (req, res) => {
    try {
        // Check if user is enrolled (or admin)
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin) {
            const enrollment = await Enrollment.findOne({
                user: req.user._id,
                course: req.params.courseId,
                status: 'Completed'
            });
            if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });
        }

        // Return any live or upcoming class for this course
        const liveClass = await LiveClass.findOne({
            course: req.params.courseId,
            status: { $in: ['live', 'scheduled'] }
        }).sort({ scheduledAt: 1 });

        res.json(liveClass || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live class' });
    }
};
