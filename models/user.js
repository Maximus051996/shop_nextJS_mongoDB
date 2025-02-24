import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        accessType: {
            type: String,
            required: true,
            enum: ["tenantowner", "admin", "executive"],
        },
        lastLoggedIn: {
            type: Date,
            default: null,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,  // Foreign key reference
            ref: "Tenant", // Refers to the Tenant model
            default: null, // Nullable field
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        collection: "tbl_users",
        timestamps: true,
    }
);

// Prevent multiple model definitions in Next.js
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
