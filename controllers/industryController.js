import IndustrySector from '../models/IndustrySector.js';

// Get all active industry sectors
export const getIndustrySectors = async (req, res) => {
    try {
        const sectors = await IndustrySector.find({ isActive: true });
        res.json(sectors);
    } catch (error) {
        console.error("Error fetching industry sectors:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Create a new industry sector
export const createIndustrySector = async (req, res) => {
    try {
        const { id, title, tagline, desc, icon, color, isActive } = req.body;
        const existing = await IndustrySector.findOne({ id });
        if (existing) return res.status(400).json({ message: "Sector with this ID already exists" });

        const newSector = new IndustrySector({ id, title, tagline, desc, icon, color, isActive });
        await newSector.save();
        res.status(201).json(newSector);
    } catch (error) {
        console.error("Error creating industry sector:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Update an existing industry sector
export const updateIndustrySector = async (req, res) => {
    try {
        const sector = await IndustrySector.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!sector) return res.status(404).json({ message: "Industry sector not found" });
        res.json(sector);
    } catch (error) {
        console.error("Error updating industry sector:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// (Admin) Delete an industry sector
export const deleteIndustrySector = async (req, res) => {
    try {
        const sector = await IndustrySector.findOneAndDelete({ id: req.params.id });
        if (!sector) return res.status(404).json({ message: "Industry sector not found" });
        res.json({ message: "Industry sector removed" });
    } catch (error) {
        console.error("Error deleting industry sector:", error);
        res.status(500).json({ message: "Server error" });
    }
};
