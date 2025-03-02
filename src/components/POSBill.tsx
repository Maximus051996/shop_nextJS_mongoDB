import React, { forwardRef } from "react";

interface ProductRow {
    company: string;
    product: string;
    mrp: number;
    mfdDate: string;
    entityType: string;
    entityTypeValue: string; // Percentage like "10%" or value
    quantity: number;
    sellingValue: number;
}

interface POSBillProps {
    productRows: ProductRow[];
    totalSellingValue: number;
    customerPaid: number;
    customerName: string;
    invoiceNumber: number;
}

const POSBill = forwardRef<HTMLDivElement, POSBillProps>(
    (
        {
            productRows,
            totalSellingValue,
            customerPaid,
            customerName,
            invoiceNumber,
        },
        ref
    ) => {
        // Get today's date
        const today = new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        return (
            <div
                ref={ref}
                className="w-full max-w-md mx-auto p-6 bg-white border shadow-lg rounded-lg text-sm"
            >
                {/* Store Header */}
                <h2 className="text-2xl font-bold text-center text-blue-600">
                    🛒 POS Invoice
                </h2>
                <p className="text-center text-gray-600">
                    {invoiceNumber ? `INV-${invoiceNumber}` : "Invoice"}
                </p>

                <hr className="my-3 border-gray-300" />

                {/* Customer Details */}
                <div className="mb-3 text-gray-700">
                    <p>
                        <strong>Customer:</strong>{" "}
                        {customerName || "Walk-in Customer"}
                    </p>
                    <p>
                        <strong>Date:</strong> {today}
                    </p>
                </div>

                {/* Product Table */}
                <table className="w-full border-collapse text-gray-700">
                    <thead>
                        <tr className="border-b bg-gray-200">
                            <th className="text-left py-2 px-2">Product</th>
                            <th className="text-center py-2 px-2">Qty</th>
                            <th className="text-left py-2 px-2">MRP</th>
                            <th className="text-right py-2 px-2">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productRows.map((row, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2 px-2">
                                    {row.product} ({row.entityTypeValue})
                                </td>
                                <td className="text-center py-2 px-2">
                                    {row.quantity}
                                </td>
                                <td className="text-center py-2 px-2">
                                    {row.mrp}
                                </td>
                                <td className="text-right py-2 px-2">
                                    ₹ {row.sellingValue.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total & Payment */}
                <div className="mt-4 text-gray-700">
                    <p className="text-right font-semibold text-lg">
                        Total: ₹ {totalSellingValue.toFixed(2)}
                    </p>
                    <p className="text-right font-semibold text-green-600">
                        Paid: ₹ {customerPaid || 0}
                    </p>
                    {customerPaid < totalSellingValue && (
                        <p className="text-right font-semibold text-red-600">
                            Due: ₹{" "}
                            {(totalSellingValue - customerPaid).toFixed(2)}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <hr className="my-3 border-gray-300" />
                <p className="text-center text-gray-500">
                    ✨ Thank you for shopping with us! Visit again! ✨
                </p>
            </div>
        );
    }
);

// ✅ Set display name to avoid warning
POSBill.displayName = "POSBill";

export default POSBill;
