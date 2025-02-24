"use client";

import React, { useState, useEffect } from "react";
import { Pencil, SquareMinus, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import SkeletonLoader from "../../../components/skeletonLoader";

const User = () => {
    const router = useRouter();
    const [users, setUsers] = useState<
        {
            _id: string;
            tenantName: string;
            email: string;
            isActive: boolean;
            accessType: string;
        }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                "/user?queryType=usersWithTenants"
            );
            const activeUsers = response.data.filter(
                (user: { isActive: unknown }) => user.isActive
            );
            setUsers(activeUsers);
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
        fetchUsers();
    }, []);

    // Handle Edit
    const handleEdit = (id: string) => {
        router.push(`/bms/user/${id}`);
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        try {
            await axiosInstance.put(
                `/user/${id}`,
                { tenantId: null, accessType: "executive" }, // Request body
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            toast.success("Tenant unassigned successfully!");
            fetchUsers();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        }
    };

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    return (
        <div className="container mx-auto p-6">
            <Toaster position="top-right" reverseOrder={false} />

            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                User Details
            </h1>

            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-sm uppercase">
                        <tr>
                            <th className="py-4 px-6 text-left">Email</th>
                            <th className="py-4 px-6 text-left">Tenant Name</th>
                            <th className="py-4 px-6 text-left">Access Type</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-md">
                        {loading
                            ? [...Array(5)].map((_, i) => (
                                  <SkeletonLoader key={i} />
                              ))
                            : currentUsers.map((user, index) => (
                                  <tr
                                      key={user._id}
                                      className={`border-b ${
                                          index % 2 === 0
                                              ? "bg-gray-100"
                                              : "bg-white"
                                      } hover:bg-gray-200 transition-all ${
                                          !user.isActive ? "opacity-50" : ""
                                      }`}
                                  >
                                      <td className="py-4 px-6">
                                          {user.email}
                                      </td>
                                      <td className="py-4 px-6">
                                          {user.tenantName}
                                      </td>
                                      <td className="py-4 px-6">
                                          {user.accessType || "N/A"}
                                      </td>
                                      <td className="py-4 px-6 flex items-center justify-center gap-4">
                                          <button
                                              onClick={() =>
                                                  handleEdit(user._id)
                                              }
                                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
                                          >
                                              <Pencil size={18} />
                                          </button>
                                          <button
                                              onClick={() =>
                                                  handleDelete(user._id)
                                              }
                                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md"
                                          >
                                              <SquareMinus size={18} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>

            {users.length > usersPerPage && (
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
                        <ChevronLeft size={18} /> Prev
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
                        Next <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default User;
