"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Function to decode and validate JWT
    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split(".")[1]; // Extract payload
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = JSON.parse(atob(base64));

            // 🔹 Check token expiration
            if (decoded.exp * 1000 < Date.now()) {
                console.warn("Token expired");
                return null;
            }

            return decoded;
        } catch (error) {
            console.error("Invalid token", error);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isAuthPage =
            pathname === "/login" ||
            pathname === "/register" ||
            pathname === "/";

        if (token) {
            const decodedToken = decodeToken(token);
            if (!isAuthPage) {
                localStorage.setItem("lastPage", pathname);
            }
            if (decodedToken) {
                setIsAuthenticated(true);

                // 🔹 If user is on login/register but already authenticated, stay on last page
                if (isAuthPage) {
                    router.push(
                        localStorage.getItem("lastPage") || "/bms/user"
                    );
                }
            } else {
                // 🔹 Invalid or expired token → Logout user
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                router.replace("/login");
            }
        } else {
            setIsAuthenticated(false);

            // 🔹 Save last visited page (except auth pages)
            if (!isAuthPage) {
                localStorage.setItem("lastPage", pathname);
            }

            // 🔹 Redirect to login if not authenticated
            if (!isAuthPage) {
                router.replace("/login");
            }
        }
    }, [pathname, router]);

    return <>{children}</>;
};

export default AuthProvider;
