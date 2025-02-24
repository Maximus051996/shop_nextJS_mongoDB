import React from "react";
import Sidebar from "../ui/bms/sidebar/sidebar";

const layout = ({ children }) => {
    return (
        <div>
            <Sidebar />
            <main className="max-w-5xl mx-auto">{children}</main>
        </div>
    );
};

export default layout;
