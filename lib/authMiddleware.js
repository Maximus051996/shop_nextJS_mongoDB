import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}

// ✅ Verify JWT Token - No Middleware Approach
export function verifyToken(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // ✅ Return the decoded token
    } catch (error) {
        return res.status(403).json({ error: error.message });
    }
}



// ✅ Generate JWT Token
export function generateToken(user) {
    const rootPaths = {
        tenantowner: "bms/tenant",
        admin: "bms/company",
        executive: "bms/company",
    };

    return jwt.sign(
        {
            id: user._id,
            userName: user.userName,
            accessType: user.accessType,
            tenantId: user.tenantId,
            rootpath: rootPaths[user.accessType] || "bms/default",
        },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
}

// ✅ Decode JWT Token
export function decodeToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
    }
}
