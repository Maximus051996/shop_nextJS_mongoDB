export function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Change to FE URL in production
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
