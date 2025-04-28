import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication status whenever component renders
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                // Set authorization header
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;

                // Call logout endpoint
                await axios.post("https://wii-fii.test/api/v1/auth/logout");
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Clear auth data regardless of API success
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete axios.defaults.headers.common["Authorization"];

            // Update state and redirect to login
            setIsLoggedIn(false);
            navigate("/");
        }
    };

    return (
        <nav className="bg-blue-700">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link
                                to="/"
                                className="text-white text-xl font-bold"
                            >
                                Wii-Fii
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/plans"
                            className="text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Plans
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <Link
                                    to="/vouchers"
                                    className="text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Vouchers
                                </Link>
                                <Link
                                    to="/wallet"
                                    className="text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Wallet
                                </Link>
                                <Link
                                    to="/profile"
                                    className="text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium ml-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-white bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-sm font-medium ml-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/plans"
                            className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Plans
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <Link
                                    to="/vouchers"
                                    className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Vouchers
                                </Link>
                                <Link
                                    to="/wallet"
                                    className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Wallet
                                </Link>
                                <Link
                                    to="/profile"
                                    className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-white bg-red-600 hover:bg-red-700 block w-full text-center max-w-1/3 mx-auto px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
