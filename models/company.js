import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant", // Foreign key reference to Tenant model
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            default: null, // Nullable field
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            default: null, // Nullable field
        },
    },
    {
        collection: "tbl_companies",
        timestamps: true, // Adds createdAt & updatedAt automatically
    }
);

// Prevent multiple model definitions in Next.js
const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
export default Company;
