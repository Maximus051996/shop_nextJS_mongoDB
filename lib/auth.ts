"use client";

// Function to decode JWT and extract user details
export const decodeToken = (token: string) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decoded = decodeToken(token);
    return decoded !== null;
};

// Function to get the logged-in user's details
export const getUserDetails = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return decodeToken(token);
};

// Function to log out the user
export const logoutUser = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page
};
