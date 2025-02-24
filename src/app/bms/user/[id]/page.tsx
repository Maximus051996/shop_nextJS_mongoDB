"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "../../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const AssignAdmin = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;

    const [tenant, setTenant] = useState(""); // Selected Tenant
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState(
        [] as { _id: string; tenantName: string }[]
    );

    // Fetch Active Tenants
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await axiosInstance.get("/tenant");
                const activeTenants = response.data.filter(
                    (t: { isActive: unknown }) => t.isActive
                );
                setTenants(activeTenants);
            } catch (error) {
                console.error("Error fetching tenants:", error);
            }
        };

        fetchTenants();
    }, []);

    // Fetch User Data & Set Tenant ID (if exists)
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!id) return;
            try {
                const response = await axiosInstance.get(`/user/${id}`);
                const userData = response.data;
                if (userData.tenantId) {
                    setTenant(userData.tenantId); // Set Assigned Tenant
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        fetchUserDetails();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) {
            toast.error("User ID is missing.");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.put(`/user/${id}`, {
                tenantId: tenant,
                accessType: "admin",
            });
            toast.success("Admin assigned successfully!");
            router.push("/bms/user"); // Redirect to user list
        } catch {
            toast.error("Failed to assign admin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 bg-white">
            <Toaster position="top-right" />

            {/* Page Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Assign Tenant Admin
            </h2>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl space-y-6 flex flex-col items-center"
            >
                {/* Tenant Dropdown */}
                <div className="w-full flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">
                        Select Tenant <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                        value={tenant}
                        onChange={(e) => setTenant(e.target.value)}
                        required
                    >
                        <option value="">Select Tenant</option>
                        {tenants.map((t) => (
                            <option key={t._id} value={t._id}>
                                {t.tenantName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Buttons */}
                <div className="w-full flex justify-between">
                    {/* Cancel Button */}
                    <button
                        type="button"
                        onClick={() => router.push("/bms/user")}
                        className="px-6 py-3 text-gray-700 font-semibold border border-gray-400 rounded-md hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>

                    {/* Assign Admin Button */}
                    <button
                        type="submit"
                        className={`px-6 py-3 text-white font-semibold rounded-md transition-all ${
                            tenant.trim() === "" || loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 transform hover:scale-105"
                        }`}
                        disabled={tenant.trim() === "" || loading}
                    >
                        {loading ? "Assigning..." : "Assign Admin"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignAdmin;
