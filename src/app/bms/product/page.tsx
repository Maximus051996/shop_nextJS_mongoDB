"use client";

import React, { useState, useEffect, ChangeEvent, ReactNode } from "react";
import { ResizableBox } from "react-resizable";
import {
    Pencil,
    Trash2,
    Search,
    SquareChartGantt,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import axiosInstance from "../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import "react-resizable/css/styles.css";
import Modal from "../../../components/modal"; // 🔹 Import Reusable Modal
import SkeletonLoader from "../../../components/skeletonLoader";

// Define Product Interface
interface Product {
    _id: string;
    productName: string;
    mrp: number;
    mfdDate: string;
    entityType: string;
    companyId?: Company;
    productDetails: ProductDetail[];
    isActive: boolean;
    tenantId: string;
    createdBy: string;
    updatedBy?: string | null;
    createdAt: string;
    updatedAt: string | null;
}

interface SpecialCustomer {
    _id: string;
    personName: string;
    value: number;
}

interface ProductDetail {
    _id: string;
    category: string;
    value?: number | string; // Can be a number or formula (string)
    specialCustomers?: SpecialCustomer[];
}

interface Company {
    _id: string;
    companyName: string;
}

const Product = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState<ReactNode>(null);

    const handleOpenModal = (product: Product) => {
        const specialCategory = product.productDetails.find(
            (detail) => detail.category === "specialcustomer"
        );

        if (specialCategory && specialCategory.specialCustomers) {
            setModalTitle("Special Customer Details");
            setModalContent(
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg shadow-sm">
                        <thead className="bg-blue-600 text-white text-left">
                            <tr>
                                <th className="py-3 px-4">Person Name</th>
                                <th className="py-3 px-4">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {specialCategory.specialCustomers.map(
                                (customer) => (
                                    <tr
                                        key={customer._id}
                                        className="hover:bg-gray-100"
                                    >
                                        <td className="py-3 px-4 font-medium text-gray-800">
                                            {customer.personName}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {customer.value}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            setModalTitle("No Special Customers");
            setModalContent(<p>No special customer data available.</p>);
        }

        setIsModalOpen(true);
    };

    // Column widths
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
        companyName: 150,
        productName: 200,
        mrp: 100,
        mfdDate: 120,
        entityType: 150,
        wholesale: 100,
        retail: 100,
        shop: 100,
        specialCustomer: 150,
        actions: 120,
    });

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/product");
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Search functionality with debounce
    const handleSearch = debounce((query: string) => {
        if (!query.trim()) {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(
                products.filter((product) =>
                    product.productName
                        .toLowerCase()
                        .includes(query.toLowerCase())
                )
            );
        }
        setCurrentPage(1);
    }, 300);

    // Extract category value function
    const getCategoryValue = (product: Product, category: string) => {
        const detail = product.productDetails.find(
            (d) => d.category === category
        );
        return detail ? detail.value : "N/A";
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mx-auto p-6">
            <Toaster position="top-right" reverseOrder={false} />
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Product Information
            </h1>

            {/* Search Bar */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => router.push("/bms/product/add")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    + Add Product
                </button>

                <div className="relative w-1/3">
                    <Search
                        className="absolute left-3 top-2.5 text-gray-500"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search product..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleSearch(e.target.value)
                        }
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-center text-red-500">{error}</p>}

            {/* Product Table */}
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="w-full border-collapse">
                    <thead className="bg-blue-600 text-white text-sm uppercase sticky top-0 z-10">
                        <tr>
                            {Object.keys(columnWidths).map((key) => (
                                <th key={key} className="py-4 px-2 text-left">
                                    <ResizableBox
                                        width={columnWidths[key]}
                                        height={30}
                                        axis="x"
                                        minConstraints={[50, 30]}
                                        maxConstraints={[400, 30]}
                                        onResizeStop={(e, { size }) =>
                                            setColumnWidths((prev) => ({
                                                ...prev,
                                                [key]: size.width,
                                            }))
                                        }
                                    >
                                        <span className="block px-2">
                                            {key.replace(/([A-Z])/g, " $1")}
                                        </span>
                                    </ResizableBox>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="text-gray-700 text-md">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <SkeletonLoader key={i} />
                            ))
                        ) : paginatedProducts.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={10}
                                    className="py-6 text-center text-gray-500"
                                >
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map((product, index) => (
                                <tr
                                    key={product._id}
                                    className={`border-b ${
                                        index % 2 === 0
                                            ? "bg-gray-100"
                                            : "bg-white"
                                    } hover:bg-gray-200 transition-all ${
                                        !product.isActive ? "opacity-50" : ""
                                    }`}
                                >
                                    <td className="py-4 px-2 text-center">
                                        {product.companyId?.companyName ||
                                            "N/A"}
                                    </td>
                                    <td className="py-4 px-2 font-semibold text-center">
                                        {product.productName}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {product.mrp}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {new Date(
                                            product.mfdDate
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {product.entityType}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {getCategoryValue(product, "wholesale")}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {getCategoryValue(product, "retail")}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {getCategoryValue(product, "shop")}
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <button
                                            onClick={() =>
                                                handleOpenModal(product)
                                            }
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <SquareChartGantt size={26} />
                                        </button>
                                    </td>
                                    <td className="py-4 px-2 flex items-center justify-center gap-2">
                                        {!product.isActive ? (
                                            <span className="text-red-500 font-semibold">
                                                Deleted
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/bms/product/${product._id}`
                                                        )
                                                    }
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        await axiosInstance.delete(
                                                            `/product/${product._id}`
                                                        );
                                                        toast.success(
                                                            "Product deleted"
                                                        );
                                                        fetchProducts();
                                                    }}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
            {filteredProducts.length > itemsPerPage && (
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
            {/* Reusable Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
            >
                {modalContent}
            </Modal>
        </div>
    );
};

export default Product;
