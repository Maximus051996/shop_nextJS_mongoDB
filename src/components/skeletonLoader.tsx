import React from "react";

const SkeletonLoader = () => (
    <tr className="animate-pulse bg-gray-100">
        <td className="py-4 px-6">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </td>
        <td className="py-4 px-6 flex items-center justify-center gap-4">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
        </td>
    </tr>
);

export default SkeletonLoader;
