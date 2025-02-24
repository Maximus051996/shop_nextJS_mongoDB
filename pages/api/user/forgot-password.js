import connectDB from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    await connectDB();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, newPassword, confirmPassword } = req.body;

    // 🔹 Validate input fields
    if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // 🔹 Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 🔹 Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 🔹 Update user password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
