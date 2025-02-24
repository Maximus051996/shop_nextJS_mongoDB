import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../providers/AuthProvider"; // ✅ Fixed import path

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
    title: "Billing Management System",
    description: "Manage your billing efficiently",
    icons: {
        icon: "/favicon.ico", // ✅ Ensure 'favicon.ico' is inside 'public/' folder
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <html lang="en">
                <body className={`${inter.className} highlighter-context`}>
                    <main>{children}</main>
                </body>
            </html>
        </AuthProvider>
    );
}
