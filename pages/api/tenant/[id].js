import connectDB from "../../../lib/mongodb";
import Tenant from "../../../models/tenant";
import { verifyToken } from "../../../lib/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const { id } = req.query;

    // 🔹 Verify Token
    const decodedUser = verifyToken(req, res);
    if (!decodedUser) return;

    // 🔹 Ensure Only 'tenantowner' Can Access
    if (decodedUser.accessType !== "tenantowner") {
        return res.status(403).json({ error: "Unauthorized. Only tenant owners can perform this action." });
    }

    switch (req.method) {
        case "GET":
            return getTenantById(req, res, id);
        case "PUT":
            return updateTenant(req, res, id);
        case "DELETE":
            return deleteTenant(req, res, id);
        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
}

// 🔹 Get Tenant by ID
async function getTenantById(req, res, id) {
    try {
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }
        return res.status(200).json(tenant);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Update Tenant
async function updateTenant(req, res, id) {
    try {
        const { tenantName } = req.body;

        const updatedTenant = await Tenant.findByIdAndUpdate(
            id,
            { tenantName },
            { new: true }
        );

        if (!updatedTenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        return res.status(200).json({ message: "Tenant updated successfully", tenant: updatedTenant });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Delete Tenant (Soft Delete by Setting isActive=false)
async function deleteTenant(req, res, id) {
    try {
        const tenant = await Tenant.findOne({ _id: id, isActive: true });

        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        tenant.isActive = false;
        await tenant.save();

        return res.status(200).json({ message: "Tenant deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
