import Certification from '../models/Certification.js';

// Get all active certifications
export const getCertifications = async (req, res) => {
    try {
        const certifications = await Certification.find({ isActive: true });
        res.json(certifications);
    } catch (error) {
        console.error("Error fetching certifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get a single certification by id (the custom string id)
export const getCertificationById = async (req, res) => {
    try {
        const certification = await Certification.findOne({ id: req.params.id, isActive: true });
        if (!certification) {
            return res.status(404).json({ message: "Certification not found" });
        }
        res.json(certification);
    } catch (error) {
        console.error("Error fetching certification:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Create a new certification
export const createCertification = async (req, res) => {
    try {
        const { id, title, subtitle, code, level, description, category, price, image, color, popular, isActive } = req.body;

        const existing = await Certification.findOne({ id });
        if (existing) {
            return res.status(400).json({ message: "Certification with this ID already exists" });
        }

        const newCert = new Certification({
            id, title, subtitle, code, level, description, category, price, image, color, popular, isActive
        });

        await newCert.save();
        res.status(201).json(newCert);
    } catch (error) {
        console.error("Error creating certification:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Update an existing certification
export const updateCertification = async (req, res) => {
    try {
        const cert = await Certification.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );

        if (!cert) {
            return res.status(404).json({ message: "Certification not found" });
        }

        res.json(cert);
    } catch (error) {
        console.error("Error updating certification:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Delete/Deactivate a certification
export const deleteCertification = async (req, res) => {
    try {
        const cert = await Certification.findOneAndDelete({ id: req.params.id });

        if (!cert) {
            return res.status(404).json({ message: "Certification not found" });
        }

        res.json({ message: "Certification removed" });
    } catch (error) {
        console.error("Error deleting certification:", error);
        res.status(500).json({ message: "Server error" });
    }
};
