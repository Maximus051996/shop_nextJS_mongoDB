import connectDB from "../../../lib/mongodb";
import Tenant from "../../../models/tenant";
import { verifyToken } from "../../../lib/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    // 🔹 Verify Token
    const decodedUser = verifyToken(req, res);
    if (!decodedUser) return;

    switch (req.method) {
        case "POST":
            // Restrict tenant creation to 'tenantowner'
            if (decodedUser.accessType == "tenantowner") {
                return createTenant(req, res);
            }
        case "GET":
            if (decodedUser.accessType == "tenantowner") {
                return getAllTenants(req, res);
            }

        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
}

// 🔹 Create a New Tenant (Only for tenantowner)
async function createTenant(req, res) {
    try {
        const { tenantName } = req.body;
        if (!tenantName) {
            return res.status(400).json({ error: "Tenant name is required" });
        }

        const existingTenant = await Tenant.findOne({ tenantName });
        if (existingTenant) {
            return res.status(400).json({ error: "Tenant name already exists" });
        }

        const newTenant = await Tenant.create({ tenantName, isActive: true });
        return res.status(200).json({ message: "Tenant created successfully", tenant: newTenant });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Get All Tenants (Accessible by all authenticated users)
async function getAllTenants(req, res) {
    try {
        const tenants = await Tenant.find();
        return res.status(200).json(tenants);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
