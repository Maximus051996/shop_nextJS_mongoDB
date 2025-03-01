"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

type ProductDetail = {
    category: "retail" | "shop" | "wholesale" | "specialcustomer";
    value?: number; // Only for retail, shop, wholesale
    specialCustomers?: SpecialCustomer[]; // Only for specialcustomer
};

const EditProduct = () => {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string | undefined;

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
    const [, setError] = useState("");
    const [specialCustomers, setSpecialCustomers] = useState<SpecialCustomer[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch Companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axiosInstance.get("/company");
                setCompanies(
                    response.data.map((c: Company) => ({
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

    // Function to handle updates in special customer input fields
    const handleSpecialCustomerChange = (
        index: number,
        field: string,
        value: string | number
    ) => {
        const updatedCustomers = [...specialCustomers];
        updatedCustomers[index] = {
            ...updatedCustomers[index],
            [field]: value,
        };
        setSpecialCustomers(updatedCustomers);
    };

    // Function to add a new special customer entry
    const handleAddSpecialCustomer = () => {
        setSpecialCustomers([
            ...specialCustomers,
            { personName: "", value: "" },
        ]);
    };

    // Function to remove a special customer entry
    const handleRemoveSpecialCustomer = (index: number) => {
        const updatedCustomers = specialCustomers.filter((_, i) => i !== index);
        setSpecialCustomers(updatedCustomers);
    };

    // Fetch Product Details
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get(
                    `/product/${productId}`
                );
                const product = response.data;

                setProductName(product.productName);
                setCompanyId(product.companyId._id);
                setMfdDate(product.mfdDate);
                setMrp(product.mrp.toString());
                setEntityType(product.entityType);

                // Map category values
                const categoryData: Record<
                    "retail" | "shop" | "wholesale",
                    string
                > = {
                    retail: "",
                    shop: "",
                    wholesale: "",
                };
                product.productDetails.forEach((detail: ProductDetail) => {
                    if (
                        ["retail", "shop", "wholesale"].includes(
                            detail.category
                        ) &&
                        detail.value !== undefined
                    ) {
                        categoryData[
                            detail.category as keyof typeof categoryData
                        ] = detail.value.toString();
                    }
                });
                setCategoryValues(categoryData);

                // Extract special customer data properly
                const specialCustomerData = product.productDetails.find(
                    (d: ProductDetail) => d.category === "specialcustomer"
                );

                if (specialCustomerData) {
                    setSpecialCustomers(specialCustomerData.specialCustomers);
                } else {
                    setSpecialCustomers([]);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdating(true);

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
            await axiosInstance.put(`/product/${productId}`, payload);
            toast.success("Product updated successfully!");
            router.push("/bms/product");
        } catch {
            toast.error("Failed to update product.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-6 bg-white overflow-hidden">
            <Toaster position="top-right" />
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Edit Product
            </h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
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
                            value={companies.find(
                                (option) => option.value === companyId
                            )}
                            onChange={(option) =>
                                setCompanyId(option?.value || "")
                            }
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
                            value={
                                mfdDate
                                    ? new Date(mfdDate)
                                          .toISOString()
                                          .split("T")[0]
                                    : ""
                            }
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

                    {/* Wholesale, Retailer, Shop Pricing */}
                    {Object.keys(categoryValues).map((key) => (
                        <div key={key} className="flex items-center space-x-4">
                            <label className="w-1/2 text-gray-700 font-semibold capitalize">
                                {key} Price ({entityType})
                            </label>
                            <input
                                type={
                                    entityType === "formula" ? "text" : "number"
                                }
                                className="w-1/2 px-4 py-2 border rounded-md"
                                value={
                                    categoryValues[
                                        key as keyof typeof categoryValues
                                    ]
                                }
                                onChange={(e) =>
                                    setCategoryValues({
                                        ...categoryValues,
                                        [key]: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                    ))}

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
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveSpecialCustomer(index)
                                    }
                                    className="text-red-500 font-bold"
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddSpecialCustomer}
                            className="text-blue-600 mt-2"
                        >
                            + Add Special Customer
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 text-white bg-green-600 rounded-md"
                        disabled={updating}
                    >
                        {updating ? "Updating..." : "Save Changes"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default EditProduct;
