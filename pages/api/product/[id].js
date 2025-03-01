import connectDB from "../../../lib/mongodb";
import Product from "../../../models/product";
import { verifyToken } from "../../../lib/authMiddleware";
import Company from "../../../models/company";
export default async function handler(req, res) {
    await connectDB();

    const decodedUser = verifyToken(req, res);
    if (!decodedUser) return;

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    // 🔹 Ensure Tenant Ownership or Admin Privileges
    if (!["admin"].includes(decodedUser.accessType)) {
        return res.status(403).json({ error: "Unauthorized. Only tenant owners and admins can perform this action." });
    }

    switch (req.method) {
        case "GET":
            return getProductById(req, res, id, decodedUser);
        case "PUT":
            return updateProduct(req, res, id, decodedUser);
        case "DELETE":
            return deleteProduct(req, res, id, decodedUser);
        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
}

// 🔹 Get Product by ID
async function getProductById(req, res, id, decodedUser) {
    try {
        const product = await Product.findOne({ _id: id, tenantId: decodedUser.tenantId }).populate("companyId", "companyName");

        if (!product) {
            return res.status(404).json({ error: "Product not found or access denied" });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Update Product
async function updateProduct(req, res, id, decodedUser) {
    try {
        const { productName, companyId, mrp, mfdDate, entityType, productDetails } = req.body;

        const existingCompany = await Company.findOne({ _id: companyId, tenantId: decodedUser.tenantId });
        if (!existingCompany) {
            return res.status(400).json({ error: "Invalid companyId. Company not found." });
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, tenantId: decodedUser.tenantId },
            {
                $set: {
                    productName: productName || undefined,
                    companyId: companyId || undefined,
                    mrp: mrp || undefined,
                    mfdDate: mfdDate || undefined,
                    entityType: entityType || undefined,
                    productDetails: productDetails || undefined,
                    updatedBy: decodedUser.id,
                },
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found or access denied" });
        }

        return res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// 🔹 Deactivate Product (Soft Delete)
async function deleteProduct(req, res, id, decodedUser) {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: id, tenantId: decodedUser.tenantId, isActive: true },
            { $set: { isActive: false, updatedBy: decodedUser.id } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found or access denied" });
        }

        return res.status(200).json({ message: "Product deactivated successfully", product });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
