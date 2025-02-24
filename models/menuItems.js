// models/menuItems.js
import { Package, UsersRound, Building2, Newspaper, ReceiptText, StickyNote, SquarePen } from "lucide-react"; // Import icons

const menuItems = [
    { label: "Company", icon: <Newspaper size={24} />, roles: ["admin", "executive"], url: "/bms/company" },
    { label: "Product", icon: <Package size={24} />, roles: ["admin", "executive"], url: "/bms/product" },
    { label: "Generate Bill", icon: <SquarePen size={24} />, roles: ["admin", "executive"], url: "/bms/tenant" },
    { label: "GST Bill", icon: <ReceiptText size={24} />, roles: ["admin", "executive"], url: "/bms/tenant" },
    { label: "Non-GST Bill", icon: <StickyNote size={24} />, roles: ["admin"], url: "/bms/tenant" },
    { label: "Tenant", icon: <Building2 size={24} />, roles: ["tenantowner"], url: "/bms/tenant" },
    { label: "Assign Admin User", icon: <UsersRound size={24} />, roles: ["tenantowner"], url: "/bms/user" },

];

export default menuItems;
