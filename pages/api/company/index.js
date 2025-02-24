import connectDB from "../../../lib/mongodb";
import Company from "../../../models/company";
import { verifyToken } from "../../../lib/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    // 🔹 Verify Token
    const decodedUser = verifyToken(req, res);
    if (!decodedUser) return;

    // 🔹 Ensure Tenant Ownership or Admin Privileges
    if (!["admin"].includes(decodedUser.accessType)) {
        return res.status(403).json({ error: "Unauthorized. Only tenant admins can perform this action." });
    }

    switch (req.method) {
        case "POST":
            return createCompany(req, res, decodedUser);
        case "GET":
            return getAllCompanies(req, res, decodedUser);
        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
}

// 🔹 Create a New Company
async function createCompany(req, res, decodedUser) {
    try {
        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({ error: "Company name is required" });
        }

        // 🔹 Check if company already exists under the same tenant
        const existingCompany = await Company.findOne({ companyName, tenantId: decodedUser.tenantId });
        if (existingCompany) {
            return res.status(400).json({ error: "Company name already exists within this tenant" });
        }

        const newCompany = await Company.create({
            companyName,
            tenantId: decodedUser.tenantId, // Ensure company belongs to the user's tenant
            createdBy: decodedUser.id, // Store creator ID
        });

        return res.status(201).json({ message: "Company created successfully", company: newCompany });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Get All Companies for a Specific Tenant
async function getAllCompanies(req, res, decodedUser) {
    try {
        const companies = await Company.find({ tenantId: decodedUser.tenantId });
        return res.status(200).json(companies);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
