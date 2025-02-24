import connectDB from "../../lib/mongodb";
import { setCorsHeaders } from "../../lib/cors"

export default async function handler(req, res) {
    try {
        setCorsHeaders(res);

        if (req.method === "OPTIONS") {
            return res.status(200).end(); // ✅ Handle preflight requests
        }
        await connectDB();
        res.status(200).json({ message: "🔥 MongoDB Connected Successfully!" });
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error); // Log error
        res.status(500).json({ error: "❌ MongoDB Connection Failed!", details: error.message });
    }
}
