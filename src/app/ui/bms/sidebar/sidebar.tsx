"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut, Menu, X } from "lucide-react";
import menuItems from "../../../../../models/menuItems";
import Link from "next/link";
import { decodeToken } from "../../../../../lib/auth";

const Header = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const router = useRouter();
    const [user, setUser] = useState<{
        username: string;
        accessType: string;
        tenantName: string;
    }>({
        username: "",
        accessType: "",
        tenantName: "",
    });

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const tenantName = localStorage.getItem("tenantName") ?? "";
        console.log(tenantName);
        if (storedToken) {
            const decoded = decodeToken(storedToken);
            if (decoded) {
                setUser({
                    username: decoded.userName,
                    accessType: decoded.accessType,
                    tenantName:
                        tenantName == "null" ? "Tenant Owner" : tenantName,
                });
            }
        }
    }, []);

    // Handle Logout
    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        router.push("/login");
    }, [router]);

    // Toggle Sidebar
    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
        document.body.classList.toggle("overflow-hidden", !isSidebarOpen);
    }, [isSidebarOpen]);

    // Handle outside click for sidebar
    useEffect(() => {
        if (!isSidebarOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById("sidebar");
            const menuButton = document.getElementById("menu-button");

            if (
                sidebar &&
                !sidebar.contains(event.target as Node) &&
                menuButton &&
                !menuButton.contains(event.target as Node)
            ) {
                setSidebarOpen(false);
                document.body.classList.remove("overflow-hidden");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isSidebarOpen]);

    return (
        <header className="bg-sky-600 text-white shadow-lg">
            <div
                className={`container mx-auto flex items-center py-4 px-6 transition-all duration-300 ${
                    isSidebarOpen ? "ml-[280px]" : "ml-0"
                }`}
            >
                {/* Left Side: Menu Button & Title */}
                <div className="flex items-center gap-4">
                    <button
                        id="menu-button"
                        onClick={toggleSidebar}
                        className="text-white p-2 rounded-md bg-sky-700 hover:bg-sky-800 transition duration-300"
                    >
                        <Menu size={24} />
                    </button>

                    <h1 className="text-xl md:text-2xl font-bold cursor-pointer transition-all duration-300">
                        <span className="mt-2">Billing Management System</span>
                    </h1>
                    <span className="hidden sm:inline-block my-3 bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md border border-gray-400">
                        {user.tenantName}
                    </span>
                </div>
            </div>

            {/* Sidebar */}
            <aside
                id="sidebar"
                className={`fixed top-0 left-0 h-screen w-[280px] bg-gray-900 text-white shadow-lg z-50 transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out flex flex-col`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <UserCircle size={24} className="text-gray-400" />
                        <h2 className="text-lg font-bold">{user.username}</h2>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Role-Based Sidebar Menu */}
                <nav className="flex flex-col flex-grow p-4 space-y-4">
                    {menuItems
                        .filter((item) => item.roles.includes(user.accessType)) // ✅ Show allowed items
                        .map((item) => (
                            <Link
                                key={item.label}
                                href={item.url}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
                            >
                                {item.icon} <span>{item.label}</span>
                            </Link>
                        ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-700 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full md:w-auto 
                   bg-red-500 text-white px-4 py-3 md:px-6 md:py-3 
                   rounded-lg font-semibold text-lg shadow-lg 
                   hover:bg-red-600 active:scale-95 transition-all duration-300"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </header>
    );
};

export default Header;
