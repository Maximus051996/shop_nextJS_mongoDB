import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company", // Foreign key reference to Company model
            required: true,
        },
        mrp: {
            type: Number,
            required: true,
        },
        mfdDate: {
            type: Date,
            required: true,
        },
        entityType: {
            type: String,
            enum: ["percentage", "direct", "formula"], // Restrict to three possible values
            required: true,
        },
        productDetails: [
            {
                category: {
                    type: String,
                    enum: ["retail", "shop", "wholesale", "specialcustomer"], // Restrict category options
                    required: true,
                },
                value: {
                    type: mongoose.Schema.Types.Mixed, // Allows flexibility for different value types
                    required: function () {
                        return this.category !== "specialcustomer"; // Value is required for non-specialcustomer categories
                    },
                },
                specialCustomers: {
                    type: [
                        {
                            personName: {
                                type: String,
                                required: true,
                            },
                            value: {
                                type: mongoose.Schema.Types.Mixed, // Allow different types for pricing
                                required: true,
                            },
                        },
                    ],
                    required: function () {
                        return this.category === "specialcustomer"; // Special Customers required if category is specialcustomer
                    },
                    default: undefined, // Prevents empty array from being saved unless explicitly set
                },
            },
        ],
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
            ref: "User", // Reference to User model
            default: null, // Nullable field
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            default: null, // Nullable field
        },
    },
    {
        collection: "tbl_products",
        timestamps: true, // Adds createdAt & updatedAt automatically
    }
);

// Prevent multiple model definitions in Next.js
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
