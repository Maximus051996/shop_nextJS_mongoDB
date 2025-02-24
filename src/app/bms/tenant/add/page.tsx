"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const AddTenant = () => {
    const router = useRouter();
    const [tenantName, setTenantName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post("/tenant", { tenantName });
            toast.success("Tenant added successfully!");
            router.push("/bms/tenant"); // Redirect to tenant list
        } catch {
            toast.error("Failed to add tenant.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 bg-white overflow-hidden">
            <Toaster position="top-right" />

            {/* Page Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Add Tenant Page
            </h2>

            {/* Form Container */}
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

                    {/* Save Tenant Button */}
                    <button
                        type="submit"
                        className={`px-6 py-3 text-white font-semibold rounded-md transition-all ${
                            tenantName.trim() === "" || loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 transform hover:scale-105"
                        }`}
                        disabled={tenantName.trim() === "" || loading}
                    >
                        {loading ? "Adding..." : "Save Tenant"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTenant;
