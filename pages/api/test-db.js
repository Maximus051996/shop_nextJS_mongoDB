import connectDB from "../../lib/mongodb";

export default async function handler(req, res) {
    try {
        await connectDB();
        res.status(200).json({ message: "🔥 MongoDB Connected Successfully!" });
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error); // Log error
        res.status(500).json({ error: "❌ MongoDB Connection Failed!", details: error.message });
    }
}
