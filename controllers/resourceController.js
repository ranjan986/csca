import Resource from '../models/Resource.js';

// @desc    Get all active resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Error fetching resources", error: error.message });
    }
};

// @desc    Get all resources (Admin only)
// @route   GET /api/resources/admin
// @access  Private/Admin
export const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Error fetching resources", error: error.message });
    }
};

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
export const createResource = async (req, res) => {
    try {
        const resource = new Resource({
            ...req.body,
            createdBy: req.user.id
        });
        const savedResource = await resource.save();
        res.status(201).json(savedResource);
    } catch (error) {
        res.status(500).json({ message: "Error creating resource", error: error.message });
    }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
export const updateResource = async (req, res) => {
    try {
        const updatedResource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedResource) return res.status(404).json({ message: "Resource not found" });
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: "Error updating resource", error: error.message });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
export const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting resource", error: error.message });
    }
};
