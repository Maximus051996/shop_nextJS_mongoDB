"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { decodeToken } from "../../../lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Login = () => {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, action: "login" }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed.");

            toast.success(data.message);
            localStorage.setItem("token", data.token); // Store token
            localStorage.setItem("tenantName", data.tenantName); // Store tenantName
            const rootpath = decodeToken(data.token).rootpath; // Decode token and get rootpath
            setTimeout(() => router.push(rootpath), 1500);
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#FFDEE9] via-[#B5FFFC] to-[#EEF1FF]">
            {/* ✅ Toaster Fixed Here */}
            <Toaster position="top-right" reverseOrder={false} />

            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center drop-shadow-md">
                Billing Management System (BMS)
            </h1>
            <div className="w-full max-w-md bg-black/80 p-6 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/10">
                <h2 className="text-3xl font-bold text-center text-white mb-6">
                    Welcome Back
                </h2>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-gray-400 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-black/50 text-white placeholder-gray-500"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-gray-400 font-medium">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 pr-10 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-black/50 text-white placeholder-gray-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md flex items-center justify-center ${
                            loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                        }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Forgot Password & Register Link */}
                <div className="flex justify-between text-gray-400 mt-4 text-sm">
                    <a href="#" className="hover:text-blue-400">
                        Forgot or change Password?
                    </a>
                    <button
                        className="hover:text-blue-400"
                        onClick={() => router.push("/register")}
                    >
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
