import Partnership from "../models/Partnership.js";

// @desc    Submit a partnership application
// @route   POST /api/partnerships
// @access  Public
export const submitApplication = async (req, res) => {
    try {
        const {
            organizationName,
            websiteUrl,
            country,
            partnerType,
            yearsInBusiness,
            estimatedStudentsPerYear,
            contactPersonName,
            officialEmail,
            phoneNumber,
            message
        } = req.body;

        const application = await Partnership.create({
            organizationName,
            websiteUrl,
            country,
            partnerType,
            yearsInBusiness,
            estimatedStudentsPerYear,
            contactPersonName,
            officialEmail,
            phoneNumber,
            message
        });

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all partnership applications
// @route   GET /api/partnerships
// @access  Admin
export const getAllApplications = async (req, res) => {
    try {
        const applications = await Partnership.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// @desc    Update application status
// @route   PATCH /api/partnerships/:id
// @access  Admin
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Partnership.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
