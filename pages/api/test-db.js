import connectDB from "../../lib/mongodb";

export default async function handler(req, res) {
    try {
        // ✅ Set CORS Headers Correctly
        res.setHeader("Access-Control-Allow-Origin", "*"); // Change to frontend URL in production
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // ✅ Handle CORS Preflight Requests
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
        await connectDB();
        res.status(200).json({ message: "🔥 MongoDB Connected Successfully!" });
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error); // Log error
        res.status(500).json({ error: "❌ MongoDB Connection Failed!", details: error.message });
    }
}
