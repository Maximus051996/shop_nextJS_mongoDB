import connectDB from "../../../lib/mongodb";
import Product from "../../../models/product";
import { verifyToken } from "../../../lib/authMiddleware";
import Company from "../../../models/company";
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
            return createProduct(req, res, decodedUser);
        case "GET":
            return getAllProducts(req, res, decodedUser);
        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
}

// 🔹 Create a New Product
async function createProduct(req, res, decodedUser) {
    try {
        const { productName, companyId, mrp, mfdDate, entityType, productDetails } = req.body;

        // 🔹 Validate required fields
        if (!productName || !companyId || !mrp || !mfdDate || !entityType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 🔹 Validate entityType values
        const validEntityTypes = ["percentage", "direct", "formula"];
        if (!validEntityTypes.includes(entityType)) {
            return res.status(400).json({ error: "Invalid entityType value" });
        }

        // 🔹 Check if the companyId exists in the Company table
        const existingCompany = await Company.findOne({ _id: companyId, tenantId: decodedUser.tenantId });
        if (!existingCompany) {
            return res.status(400).json({ error: "Invalid companyId. Company not found." });
        }

        // 🔹 Check if product already exists under the same tenant
        const existingProduct = await Product.findOne({ productName, tenantId: decodedUser.tenantId, companyId: companyId });
        if (existingProduct) {
            return res.status(400).json({ error: "Product name already exists within this tenant" });
        }

        const newProduct = await Product.create({
            productName,
            companyId,
            mrp,
            mfdDate,
            entityType,
            productDetails,
            tenantId: decodedUser.tenantId, // Ensure product belongs to the user's tenant
            createdBy: decodedUser.id, // Store creator ID
        });

        return res.status(200).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Get All Products for a Specific Tenant
async function getAllProducts(req, res, decodedUser) {
    try {
        const products = await Product.find({ tenantId: decodedUser.tenantId }).populate("companyId", "companyName");
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
