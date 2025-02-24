"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Register = () => {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        phoneNumber: "",
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
                body: JSON.stringify({ ...formData, action: "register" }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed.");
            router.push("/login");
            toast.success(data.message);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Something went wrong. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#FFDEE9] via-[#B5FFFC] to-[#EEF1FF]">
            {/* Page Title */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center drop-shadow-md">
                Billing Management System (BMS)
            </h1>
            <div className="w-full max-w-md bg-black/80 p-6 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/10">
                <div>
                    <Toaster />
                    <h2 className="text-3xl font-bold text-center text-white mb-6">
                        Create an Account
                    </h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email */}
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

                        {/* Phone Number */}
                        <div>
                            <label className="block text-gray-400 font-medium">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Enter your phone number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-black/50 text-white placeholder-gray-500"
                                required
                            />
                        </div>

                        {/* Password with Eye Toggle */}
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${
                                loading
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                            }`}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center text-gray-400 mt-4">
                        Already have an account?{" "}
                        <button
                            className="text-blue-400 font-medium hover:underline"
                            onClick={() => router.push("/login")}
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
