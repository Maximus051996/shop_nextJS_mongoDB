import connectDB from "../../../lib/mongodb";
import Company from "../../../models/company";
import { verifyToken } from "../../../lib/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const decodedUser = verifyToken(req, res);
    if (!decodedUser) return;

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Company ID is required" });
    }

    // 🔹 Ensure Tenant Ownership or Admin Privileges
    if (!["admin"].includes(decodedUser.accessType)) {
        return res.status(403).json({ error: "Unauthorized. Only tenant owners and admins can perform this action." });
    }

    switch (req.method) {
        case "GET":
            return getCompanyById(req, res, id, decodedUser);
        case "PUT":
            return updateCompany(req, res, id, decodedUser);
        case "DELETE":
            return deleteCompany(req, res, id, decodedUser);
        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
}

// 🔹 Get Company by ID
async function getCompanyById(req, res, id, decodedUser) {
    try {
        const company = await Company.findOne({ _id: id, tenantId: decodedUser.tenantId });

        if (!company) {
            return res.status(404).json({ error: "Company not found or access denied" });
        }

        return res.status(200).json(company);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Update Company
async function updateCompany(req, res, id, decodedUser) {
    try {
        const { companyName } = req.body;

        const company = await Company.findOneAndUpdate(
            { _id: id, tenantId: decodedUser.tenantId },
            {
                $set: {
                    companyName: companyName || undefined,
                    updatedBy: decodedUser.id,
                },
            },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ error: "Company not found or access denied" });
        }

        return res.status(200).json({ message: "Company updated successfully", company });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Deactivate Company (Only Tenant Owners)
async function deleteCompany(req, res, id, decodedUser) {
    try {

        // 🔹 Find and Update `isActive` to False
        const company = await Company.findOneAndUpdate(
            { _id: id, tenantId: decodedUser.tenantId, isActive: true },
            { $set: { isActive: false, updatedBy: decodedUser.id } },
            { new: true } // Return the updated document
        );

        if (!company) {
            return res.status(404).json({ error: "Company not found or access denied" });
        }

        return res.status(200).json({ message: "Company deactivated successfully", company });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

