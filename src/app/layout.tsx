import "./globals.css";
import AuthProvider from "../providers/AuthProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
    title: "Billing Management System",
    description: "Manage your billing efficiently",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <html lang="en" className={inter.className}>
                <body
                    className="bg-gray-50 text-gray-900 antialiased tracking-tight leading-relaxed 
                               sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                >
                    <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                </body>
            </html>
        </AuthProvider>
    );
}
