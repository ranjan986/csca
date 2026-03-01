import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// --- Public Controllers ---

// Get all active courses
export const getActiveCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).select('title description thumbnail price category level');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching courses" });
    }
};

// Get user's enrolled courses
export const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user._id, status: 'Completed' }).populate('course');
        res.json(enrollments.map(e => e.course));
    } catch (error) {
        res.status(500).json({ message: "Server error fetching your courses" });
    }
};

// Get course details (basic info)
export const getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Strip videoUrl and pdfUrl unless chapter isPreview
        const publicCourse = course.toObject();
        if (publicCourse.chapters) {
            publicCourse.chapters = publicCourse.chapters.map(ch => {
                ch.hasVideo = !!ch.videoUrl;
                ch.hasPdf = !!ch.pdfUrl;
                if (!ch.isPreview) {
                    delete ch.videoUrl;
                    delete ch.pdfUrl;
                }
                return ch;
            });
        }
        res.json(publicCourse);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching course details" });
    }
};

// --- Protected Controllers (Enrolled Users) ---

// Get full course content (videos/pdfs)
export const getCourseContent = async (req, res) => {
    try {
        // Check if user is admin or enrolled
        const isAdmin = req.user.role === 'admin';
        const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id, status: 'Completed' });

        if (!isAdmin && !enrollment) {
            return res.status(403).json({ message: "Access denied. Course not purchased." });
        }

        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching course content" });
    }
};

// Enroll in a free course
export const enrollFreeCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.price > 0) {
            return res.status(400).json({ message: "This course is not free." });
        }

        const existingEnrollment = await Enrollment.findOne({ user: req.user._id, course: course._id, status: 'Completed' });
        if (existingEnrollment) {
            return res.status(400).json({ message: "Already enrolled." });
        }

        const newEnrollment = new Enrollment({
            user: req.user._id,
            course: course._id,
            paymentId: 'FREE_ENROLLMENT',
            orderId: 'FREE_ENROLLMENT',
            amount: 0,
            status: 'Completed'
        });
        await newEnrollment.save();

        res.status(200).json({ message: "Enrolled successfully", enrollment: newEnrollment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error enrolling in free course" });
    }
};


// --- Admin Controllers ---

// Create a new course
export const createCourse = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    try {
        const newCourse = new Course({ ...req.body, createdBy: req.user._id });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: "Error creating course", error: error.message });
    }
};

// Update a course
export const updateCourse = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    try {
        const updateData = { ...req.body };

        // If chapters are being updated, merge them with existing data to prevent content loss.
        if (updateData.chapters && Array.isArray(updateData.chapters)) {
            const existingCourse = await Course.findById(req.params.id);
            if (existingCourse && existingCourse.chapters) {
                updateData.chapters = updateData.chapters.map((incomingChapter, idx) => {
                    const existingChapter = existingCourse.chapters[idx];
                    if (existingChapter) {
                        return {
                            ...incomingChapter,
                            videoUrl: incomingChapter.videoUrl || existingChapter.videoUrl || '',
                            pdfUrl: incomingChapter.pdfUrl || existingChapter.pdfUrl || ''
                        };
                    }
                    return incomingChapter;
                });
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: "Error updating course" });
    }
};

// Delete a course
export const deleteCourse = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting course" });
    }
};
