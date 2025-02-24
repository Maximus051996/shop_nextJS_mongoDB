import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_req: NextRequest) {
    // ✅ Fixed (underscore `_` to indicate unused)
    const response = NextResponse.next();

    // Set CORS Headers
    response.headers.set("Access-Control-Allow-Origin", "*"); // Change to your frontend URL for security
    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    return response;
}

// Apply middleware ONLY to API routes
export const config = {
    matcher: "/api/:path*",
};
