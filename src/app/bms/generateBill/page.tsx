"use client";
import POSBill from "@/components/POSBill";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

const GenerateBill = () => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [invoiceNumber] = useState(123);
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [customerPaid, setCustomerPaid] = useState(0);
    const [billingType, setBillingType] = useState("");
    const billRef = useRef<HTMLDivElement | null>(null);

    interface ProductRow {
        company: string;
        product: string;
        mrp: number;
        mfdDate: string;
        entityType: string;
        entityTypeValue: string; // Can be a string like "10%" or a number
        quantity: number;
        sellingValue: number;
    }

    // Initialize productRows with one default row
    const [productRows, setProductRows] = useState<ProductRow[]>([
        {
            company: "",
            product: "",
            mrp: 0,
            mfdDate: "",
            entityType: "",
            entityTypeValue: "",
            quantity: 0,
            sellingValue: 0,
        },
    ]);

    const addProductRow = () => {
        setProductRows((prevRows) => [
            ...prevRows,
            {
                company: "",
                product: "",
                mrp: 0,
                mfdDate: "",
                entityType: "",
                entityTypeValue: "",
                quantity: 0,
                sellingValue: 0,
            },
        ]);
    };

    const handleProductRowChange = (
        index: number,
        field: keyof ProductRow,
        value: string | number
    ) => {
        const updatedRows = [...productRows];
        updatedRows[index] = {
            ...updatedRows[index],
            [field]: value,
        };

        // Convert to number for calculation (default to 0 if empty)
        const mrp = parseFloat(updatedRows[index].mrp.toString()) || 0;
        const quantity =
            parseFloat(updatedRows[index].quantity.toString()) || 0;
        const entityTypeValue = updatedRows[index].entityTypeValue;

        let effectiveEntityValue = 0;

        // Check if entityTypeValue contains '%'
        if (
            typeof entityTypeValue === "string" &&
            entityTypeValue.includes("%")
        ) {
            const percentageValue =
                parseFloat(entityTypeValue.replace("%", "")) || 0;
            effectiveEntityValue = (mrp * percentageValue) / 100; // Convert percentage to value
        } else {
            effectiveEntityValue = parseFloat(entityTypeValue) || 0;
        }

        // Auto-calculate sellingValue
        updatedRows[index].sellingValue =
            (mrp - effectiveEntityValue) * quantity;

        setProductRows(updatedRows);
    };

    const removeProductRow = (index: number) => {
        const updatedRows = productRows.filter((_, i) => i !== index);
        setProductRows(updatedRows);
    };

    // Calculate total selling value
    const totalSellingValue = productRows.reduce(
        (total, row) => total + row.sellingValue,
        0
    );

    const downloadPDF = async () => {
        if (!billRef.current) return;
        const canvas = await html2canvas(billRef.current);
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("POS_Bill.pdf");
    };

    return (
        <div className="w-full flex flex-col items-center justify-start p-6 bg-white overflow-hidden">
            <Toaster position="top-right" />

            <div className="w-full flex flex-col mb-4">
                <label className="text-gray-700 font-semibold mb-1">
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    className="w-full md:w-2/5 px-4 py-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                >
                    <option value="">Select Category</option>
                    <option value="retail">Retail</option>
                    <option value="shop">Shop</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="specialcustomer">Special Customer</option>
                </select>
            </div>

            <div className="w-full flex flex-col gap-6 md:gap-4">
                <label className="text-gray-700 font-semibold mb-1">
                    Customer Details
                </label>
                <div className="w-full flex flex-col gap-6 md:flex-row md:gap-4">
                    <input
                        type="text"
                        className="w-full md:w-1/3 px-4 py-2 border rounded-md"
                        placeholder="Enter Name *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <input
                        type="tel"
                        className="w-full md:w-1/3 px-4 py-2 border rounded-md"
                        placeholder="Enter Phone No *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    <input
                        type="text"
                        className="w-full md:w-1/3 px-4 py-2 border rounded-md"
                        placeholder="Enter Address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                </div>
            </div>
            <div className="w-full my-4 flex flex-col gap-6 md:flex-row md:gap-4">
                {/* Billing Type */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">
                        Billing Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full px-4 py-2 border rounded-md"
                        value={billingType}
                        onChange={(e) => setBillingType(e.target.value)}
                        required
                    >
                        <option value="">Select Billing Type</option>
                        <option value="GST">GST</option>
                        <option value="NON-GST">Non-GST</option>
                    </select>
                </div>

                {/* Payment Method */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">
                        Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full px-4 py-2 border rounded-md"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                    >
                        <option value="">Select Payment Method</option>
                        <option value="online">Online</option>
                        <option value="cash">Cash</option>
                        <option value="partial">
                            Partial Online Partial Cash
                        </option>
                    </select>
                </div>
            </div>

            <div className="w-full flex flex-col mt-5">
                <div className="flex items-center justify-between w-full mb-4">
                    <label className="text-gray-700 font-semibold">
                        Product Calculation
                    </label>
                    <button
                        onClick={addProductRow}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg text-sm md:text-md shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                        Add Row
                    </button>
                </div>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-max">
                        {productRows.map((row, index) => (
                            <div key={index} className="flex gap-4 mb-2">
                                <select
                                    className="w-45 px-4 py-2 border rounded-md"
                                    value={row.company}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "company",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Select Company</option>
                                    <option value="company1">Company 1</option>
                                    <option value="company2">Company 2</option>
                                </select>
                                <select
                                    className="w-45 px-4 py-2 border rounded-md"
                                    value={row.product}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "product",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Select Product</option>
                                    <option value="product1">Product 1</option>
                                    <option value="product2">Product 2</option>
                                </select>
                                <input
                                    type="text"
                                    className="w-24 px-4 py-2 border rounded-md"
                                    placeholder="MFD"
                                    value={row.mfdDate}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "mfdDate",
                                            e.target.value
                                        )
                                    }
                                />
                                <input
                                    type="text"
                                    className="w-24 px-4 py-2 border rounded-md"
                                    placeholder="MRP"
                                    value={row.mrp}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "mrp",
                                            e.target.value
                                        )
                                    }
                                />

                                <input
                                    type="text"
                                    className="w-36 px-4 py-2 border rounded-md"
                                    placeholder="Entity Type"
                                    value={row.entityType}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "entityType",
                                            e.target.value
                                        )
                                    }
                                />
                                <input
                                    type="text"
                                    className="w-44 px-4 py-2 border rounded-md"
                                    placeholder="Entity Type Value (e.g., 10 or 10%)"
                                    value={row.entityTypeValue}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "entityTypeValue",
                                            e.target.value
                                        )
                                    }
                                />

                                <input
                                    type="text"
                                    className="w-24 px-4 py-2 border rounded-md"
                                    placeholder="Quantity"
                                    value={row.quantity}
                                    onChange={(e) =>
                                        handleProductRowChange(
                                            index,
                                            "quantity",
                                            e.target.value
                                        )
                                    }
                                />
                                <input
                                    type="text"
                                    className="w-30 px-4 py-2 border rounded-md"
                                    placeholder="Selling Value"
                                    value={row.sellingValue}
                                    readOnly
                                />
                                <button onClick={() => removeProductRow(index)}>
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Total Value Section */}
            <div className="w-full flex justify-end mt-6">
                <div className="flex flex-col items-end">
                    <h2 className="text-lg font-semibold">Total Value:</h2>
                    <p className="text-xl font-bold text-green-600">
                        ₹ {totalSellingValue.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Customer Paid Input */}
            <div className="w-full flex justify-end mt-4">
                <div className="flex flex-col items-end">
                    <label className="text-gray-700 font-semibold">
                        Customer Paid:
                    </label>
                    <input
                        type="text"
                        className="w-full md:w-3/5 px-4 py-2 border rounded-md"
                        placeholder="Customer Paid"
                        value={customerPaid}
                        onChange={(e) =>
                            setCustomerPaid(Number(e.target.value) || 0)
                        }
                    />
                </div>
            </div>

            {/* Payment Due (Only Show If Due Amount Exists) */}
            {Number(customerPaid) < totalSellingValue && (
                <div className="w-full flex justify-end mt-2">
                    <div className="flex flex-col items-end">
                        <h2 className="text-lg font-semibold text-red-600">
                            Payment Due:
                        </h2>
                        <p className="text-xl font-bold text-red-500">
                            ₹{" "}
                            {(totalSellingValue - Number(customerPaid)).toFixed(
                                2
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Hidden POS Bill for PDF Generation */}
            <div className="absolute -left-[9999px]">
                <div ref={billRef}>
                    <POSBill
                        productRows={productRows}
                        totalSellingValue={totalSellingValue}
                        customerPaid={customerPaid}
                        customerName={customerName}
                        invoiceNumber={invoiceNumber}
                    />
                </div>
            </div>

            {/* Download Button */}
            <button
                onClick={downloadPDF}
                className="mt-6 w-full md:w-2/2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
                🧾 Generate Bill
            </button>
        </div>
    );
};

export default GenerateBill;
