import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
    {
        tenantName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: "tbl_tenants",
        timestamps: true // Automatically adds createdAt & updatedAt fields
    }
);

// Prevent multiple model registrations in Next.js
const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
export default Tenant;
