"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../../../../lib/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";

interface Company {
    _id: string;
    companyName: string;
    isActive: boolean;
}

type CompanyOption = {
    label: string;
    value: string;
};

interface SpecialCustomer {
    personName: string;
    value: string;
}

const AddProduct = () => {
    const router = useRouter();
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [companyId, setCompanyId] = useState<string>("");
    const [productName, setProductName] = useState("");
    const [mfdDate, setMfdDate] = useState("");
    const [mrp, setMrp] = useState("");
    const [entityType, setEntityType] = useState("");
    const [categoryValues, setCategoryValues] = useState({
        retail: "",
        shop: "",
        wholesale: "",
    });
    const [specialCustomers, setSpecialCustomers] = useState<SpecialCustomer[]>(
        []
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axiosInstance.get("/company");
                setCompanies(
                    response.data
                        .filter((c: Company) => c.isActive)
                        .map((c: Company) => ({
                            label: c.companyName,
                            value: c._id,
                        }))
                );
            } catch (err) {
                console.error(err);
            }
        };
        fetchCompanies();
    }, []);

    const handleAddSpecialCustomer = () => {
        setSpecialCustomers([
            ...specialCustomers,
            { personName: "", value: "" },
        ]);
    };

    const handleRemoveSpecialCustomer = (index: number) => {
        const updatedCustomers = specialCustomers.filter((_, i) => i !== index);
        setSpecialCustomers(updatedCustomers);
    };

    const handleSpecialCustomerChange = (
        index: number,
        field: keyof SpecialCustomer,
        value: string
    ) => {
        const updatedCustomers = [...specialCustomers];
        updatedCustomers[index][field] = value;
        setSpecialCustomers(updatedCustomers);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const productDetails = [
            ...Object.entries(categoryValues).map(([category, value]) => ({
                category,
                value: entityType === "formula" ? value : parseFloat(value),
            })),
            ...(specialCustomers.length > 0
                ? [
                      {
                          category: "specialcustomer",
                          specialCustomers: specialCustomers.map((sc) => ({
                              personName: sc.personName,
                              value:
                                  entityType === "formula"
                                      ? sc.value
                                      : parseFloat(sc.value),
                          })),
                      },
                  ]
                : []),
        ];

        const payload = {
            productName,
            companyId,
            mrp: parseFloat(mrp),
            mfdDate,
            entityType,
            productDetails,
        };

        try {
            await axiosInstance.post("/product", payload);
            toast.success("Product added successfully!");
            router.push("/bms/product");
        } catch {
            toast.error("Failed to add product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-6 bg-white overflow-hidden">
            <Toaster position="top-right" />
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Add Product
            </h2>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl space-y-6"
            >
                {/* Company Selection */}
                <div>
                    <label className="text-gray-700 font-semibold mb-1">
                        Company Name
                    </label>
                    <Select
                        options={companies}
                        onChange={(option) => setCompanyId(option?.value || "")}
                        isSearchable
                    />
                </div>

                {/* Product Name */}
                <div>
                    <label className="text-gray-700 font-semibold mb-1">
                        Product Name
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />
                </div>

                {/* MFD Date */}
                <div>
                    <label className="text-gray-700 font-semibold mb-1">
                        MFD Date
                    </label>
                    <input
                        type="date"
                        className="w-full px-4 py-2 border rounded-md"
                        value={mfdDate}
                        onChange={(e) => setMfdDate(e.target.value)}
                        required
                    />
                </div>

                {/* MRP */}
                <div>
                    <label className="text-gray-700 font-semibold mb-1">
                        MRP
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-2 border rounded-md"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        required
                    />
                </div>

                {/* Entity Type Selection */}
                <div>
                    <label className="text-gray-700 font-semibold mb-1">
                        Entity Type
                    </label>
                    <select
                        className="w-full px-4 py-2 border rounded-md"
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        required
                    >
                        <option value="">Select Entity Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="formula">Formula</option>
                        <option value="direct">Direct Price</option>
                    </select>
                </div>

                {/* Category Prices */}
                {entityType && (
                    <div className="space-y-4">
                        {Object.keys(categoryValues).map((key) => (
                            <div
                                key={key}
                                className="flex items-center space-x-4"
                            >
                                <label className="w-1/2 text-gray-700 font-semibold capitalize">
                                    {key} Price ({entityType})
                                </label>
                                <input
                                    type={
                                        entityType === "formula"
                                            ? "text"
                                            : "number"
                                    }
                                    step={
                                        entityType === "formula"
                                            ? undefined
                                            : "0.01"
                                    }
                                    className="w-1/2 px-4 py-2 border rounded-md"
                                    value={
                                        categoryValues[
                                            key as keyof typeof categoryValues
                                        ]
                                    }
                                    onChange={(e) =>
                                        setCategoryValues((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Special Customers */}
                <div>
                    <label className="text-gray-700 font-semibold">
                        Special Customers
                    </label>
                    {specialCustomers.map((sc, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-4 mb-2"
                        >
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="w-1/2 px-4 py-2 border rounded-md"
                                value={sc.personName}
                                onChange={(e) =>
                                    handleSpecialCustomerChange(
                                        index,
                                        "personName",
                                        e.target.value
                                    )
                                }
                                required
                            />
                            <input
                                type="number"
                                placeholder="Enter Value"
                                className="w-1/2 px-4 py-2 border rounded-md"
                                value={sc.value}
                                onChange={(e) =>
                                    handleSpecialCustomerChange(
                                        index,
                                        "value",
                                        e.target.value
                                    )
                                }
                                required
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveSpecialCustomer(index)
                                }
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddSpecialCustomer}
                        className="text-blue-600"
                    >
                        + Add Special Customer
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={() => router.push("/bms/product")}
                        className="px-6 py-3 border rounded-md text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 text-white bg-green-600 rounded-md"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Save Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
