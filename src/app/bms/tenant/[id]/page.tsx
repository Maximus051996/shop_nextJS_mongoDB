"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "../../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

// Skeleton Loader Component
const SkeletonLoader = () => (
    <div className="w-full max-w-2xl space-y-6 flex flex-col items-center animate-pulse">
        <div className="w-full h-6 bg-gray-300 rounded"></div>
        <div className="w-full h-10 bg-gray-300 rounded"></div>
        <div className="w-full flex justify-between">
            <div className="w-24 h-10 bg-gray-300 rounded"></div>
            <div className="w-32 h-10 bg-gray-300 rounded"></div>
        </div>
    </div>
);

const EditTenant = () => {
    const router = useRouter();
    const { id } = useParams();
    const [tenantName, setTenantName] = useState("");
    const [originalTenantName, setOriginalTenantName] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const response = await axiosInstance.get(`/tenant/${id}`);
                setTenantName(response.data.tenantName);
                setOriginalTenantName(response.data.tenantName);
            } catch {
                toast.error("Failed to load tenant data.");
            } finally {
                setLoading(false);
            }
        };
        fetchTenant();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tenantName.trim() === originalTenantName.trim()) return;
        setUpdating(true);
        try {
            await axiosInstance.put(`/tenant/${id}`, { tenantName });
            toast.success("Tenant updated successfully!");
            router.push("/bms/tenant"); // Redirect to tenant list
        } catch {
            toast.error("Failed to update tenant.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 bg-white overflow-hidden">
            <Toaster position="top-right" />

            {/* Page Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Update Tenant Page
            </h2>

            {/* Skeleton Loader */}
            {loading ? (
                <SkeletonLoader />
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-2xl space-y-6 flex flex-col items-center"
                >
                    {/* Tenant Name Field */}
                    <div className="w-full flex flex-col">
                        <label className="text-gray-700 font-semibold mb-1">
                            Tenant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                            placeholder="Enter Tenant Name"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Buttons Section */}
                    <div className="w-full flex justify-between">
                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => router.push("/bms/tenant")}
                            className="px-6 py-3 text-gray-700 font-semibold border border-gray-400 rounded-md hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>

                        {/* Update Tenant Button */}
                        <button
                            type="submit"
                            className={`px-6 py-3 text-white font-semibold rounded-md transition-all ${
                                tenantName.trim() === "" ||
                                tenantName.trim() ===
                                    originalTenantName.trim() ||
                                updating
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
                            }`}
                            disabled={
                                tenantName.trim() === "" ||
                                tenantName.trim() ===
                                    originalTenantName.trim() ||
                                updating
                            }
                        >
                            {updating ? "Updating..." : "Update Tenant"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditTenant;
