import connectDB from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../../../lib/authMiddleware";
import Tenant from "../../../models/tenant";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        const { action } = req.body;

        if (action === "register") {
            return await handleRegister(req, res);
        } else if (action === "login") {
            return await handleLogin(req, res);
        } else {
            return res.status(400).json({ error: "Invalid action." });
        }
    } else if (req.method === "GET") {
        const decodedUser = verifyToken(req, res);
        if (!decodedUser || decodedUser.error) return;

        if (decodedUser.accessType === "tenantowner") {
            const { queryType } = req.query;
            return queryType === "usersWithTenants"
                ? await handleGetUsersWithTenant(req, res)
                : await handleGetAllUsers(req, res);
        }

        return res.status(403).json({ error: "Unauthorized access." });
    } else {
        return res.status(405).json({ error: "Method not allowed." });
    }
}

// ✅ REGISTER USER
async function handleRegister(req, res) {
    try {
        const { password, phoneNumber, email, tenantId, accessType } = req.body;

        if (!password || !phoneNumber || !email) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // 🔹 Generate a userName from email and phone
        const emailPrefix = email.split("@")[0];
        const phonePrefix = phoneNumber.substring(0, 4);
        const userName = `${emailPrefix}${phonePrefix}`;

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            userName,
            password: hashedPassword,
            firstName: "",
            lastName: "",
            phoneNumber,
            email,
            accessType: accessType || "executive",
            tenantId: tenantId || null,
            isActive: true
        });

        return res.status(201).json({ message: "Account created successfully!" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error.", details: error.message });
    }
}

// ✅ LOGIN USER
async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const tenant = await Tenant.findById(user.tenantId).select("tenantName");
        const token = generateToken(user);
        await User.findByIdAndUpdate(
            user._id,
            { lastLoggedIn: new Date() }, // Only update lastLoggedIn
            { new: true, runValidators: true } // Return updated doc & apply validation
        );
        return res.status(200).json({
            message: "Login successful.",
            tenantName: tenant ? tenant.tenantName : null,
            token
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error.", details: error.message });
    }
}

// ✅ GET ALL USERS
async function handleGetAllUsers(req, res) {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error.", details: error.message });
    }
}


async function handleGetUsersWithTenant(req, res) {
    try {
        const usersWithTenant = await User.aggregate([
            {
                $match: {
                    accessType: { $ne: "tenantowner" } // Exclude "tenantowner"
                }
            },
            {
                $lookup: {
                    from: "tbl_tenants", // Lookup tenants
                    localField: "tenantId",
                    foreignField: "_id",
                    as: "tenantDetails"
                }
            },
            {
                $addFields: {
                    tenantName: {
                        $cond: {
                            if: { $gt: [{ $size: "$tenantDetails" }, 0] }, // If tenant exists
                            then: { $arrayElemAt: ["$tenantDetails.tenantName", 0] },
                            else: null // If no tenant found, set null
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1, // Exclude _id
                    email: 1,
                    accessType: 1,
                    tenantName: 1,
                    isActive: 1,

                }
            }
        ]);

        return res.status(200).json(usersWithTenant);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

