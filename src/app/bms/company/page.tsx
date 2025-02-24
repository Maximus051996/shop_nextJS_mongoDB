"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import SkeletonLoader from "../../../components/skeletonLoader";

const Company = () => {
    const router = useRouter();
    const [companies, setCompanies] = useState<
        { _id: string; companyName: string; isActive: boolean }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const companiesPerPage = 5;

    // Fetch Companies from API
    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/company");
            setCompanies(response.data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // Handle Edit
    const handleEdit = (id: string) => {
        router.push(`/bms/company/${id}`);
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        try {
            const result = await axiosInstance.delete(`/company/${id}`);
            toast.success(result.data.message);
            fetchCompanies();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = companies.slice(
        indexOfFirstCompany,
        indexOfLastCompany
    );
    const totalPages = Math.ceil(companies.length / companiesPerPage);

    return (
        <div className="container mx-auto p-6">
            <Toaster position="top-right" reverseOrder={false} />

            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Company Information
            </h1>

            {/* ✅ Add Company Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => router.push("/bms/company/add")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all"
                >
                    + Add Company
                </button>
            </div>

            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-sm uppercase">
                        <tr>
                            <th className="py-4 px-6 text-left">
                                Company Name
                            </th>
                            <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-md">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <SkeletonLoader key={i} />
                            ))
                        ) : companies.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="py-6 text-center text-gray-500"
                                >
                                    No companies found.
                                </td>
                            </tr>
                        ) : (
                            currentCompanies.map((company, index) => (
                                <tr
                                    key={company._id}
                                    className={`border-b ${
                                        index % 2 === 0
                                            ? "bg-gray-100"
                                            : "bg-white"
                                    } hover:bg-gray-200 transition-all ${
                                        !company.isActive ? "opacity-50" : ""
                                    }`}
                                >
                                    <td className="py-4 px-6">
                                        {company.companyName}
                                    </td>
                                    <td className="py-4 px-6 flex items-center justify-center gap-4">
                                        {!company.isActive ? (
                                            <span className="text-red-500 font-semibold">
                                                Deleted
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(company._id)
                                                    }
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            company._id
                                                        )
                                                    }
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {companies.length > companiesPerPage && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={`px-4 py-2 flex items-center gap-1 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all ${
                            currentPage === 1
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={18} />
                        Prev
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        className={`px-4 py-2 flex items-center gap-1 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all ${
                            currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Company;
