import connectDB from "../../../lib/mongodb";
import User from "../../../models/user";
import { verifyToken } from "../../../lib/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const { id } = req.query;
    const decodedUser = verifyToken(req, res);
    if (!decodedUser || decodedUser.error) return;

    const actions = {
        GET: () => handleGetUserById(req, res, id),
        PUT: () => handleUpdateUser(req, res, id),
        DELETE: () => decodedUser.accessType === "tenantowner" ? handleDeactivateUser(req, res, id) : res.status(403).json({ error: "Forbidden" })
    };

    return actions[req.method] ? actions[req.method]() : res.status(405).json({ error: "Method not allowed" });
}

// ✅ GET USER BY ID
async function handleGetUserById(req, res, userId) {
    try {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// ✅ UPDATE USER
async function handleUpdateUser(req, res, userId) {
    try {
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No update data provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// ✅ DEACTIVATE USER (Set isActive: false)
async function handleDeactivateUser(req, res, userId) {
    try {
        const user = await User.findById(userId);

        if (!user || !user.isActive) {
            return res.status(404).json({ error: "Active user not found" });
        }

        user.isActive = false;
        await user.save();

        return res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
