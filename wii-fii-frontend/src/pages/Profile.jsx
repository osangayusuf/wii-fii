import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { formatNumberWithCommas } from "../utils";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch user data
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    "https://wii-fii.test/api/v1/auth/profile"
                );
                const userData = response.data.user;
                setUser(userData);
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                });
                setWallet(userData.wallet);
            } catch (err) {
                setError("Failed to load profile data");
                console.error(err);
                // If unauthorized, redirect to login
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUpdateLoading(true);

        // Validate password confirmation if changing password
        if (
            formData.new_password &&
            formData.new_password !== formData.new_password_confirmation
        ) {
            setError("New passwords do not match");
            setUpdateLoading(false);
            return;
        }

        try {
            // Update profile data
            const dataToSend = {
                name: formData.name,
                email: formData.email,
            };

            // Only include password fields if user is changing password
            if (formData.current_password && formData.new_password) {
                dataToSend.current_password = formData.current_password;
                dataToSend.new_password = formData.new_password;
                dataToSend.new_password_confirmation =
                    formData.new_password_confirmation;
            }

            const response = await axios.put(
                `https://wii-fii.test/api/v1/users/${user.id}`,
                dataToSend
            );

            // Update user data in state and localStorage
            setUser(response.data.data);
            localStorage.setItem("user", JSON.stringify(response.data.data));

            // Clear password fields
            setFormData((prev) => ({
                ...prev,
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            }));

            setSuccess("Profile updated successfully");
            setIsEditing(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to update profile. Please try again."
            );
            console.error(err);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];

        // Redirect to login
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-700">
                        Loading profile information...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    My Profile
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                        {success}
                    </div>
                )}

                {/* Wallet Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            My Wallet
                        </h2>

                        {wallet ? (
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-gray-600 block">
                                        Current Balance:
                                    </span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        ₦{formatNumberWithCommas(wallet.balance?.toFixed(2) || "0.00")}
                                    </span>
                                </div>
                                <Link
                                    to="/wallet"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                >
                                    Manage Wallet
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-3">
                                <div className="animate-pulse rounded-full h-6 w-24 bg-gray-200 mx-auto mb-2"></div>
                                <Link
                                    to="/wallet"
                                    className="text-blue-600 hover:underline mt-2 inline-block"
                                >
                                    View Wallet
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border ${
                                            !isEditing ? "bg-gray-100" : ""
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border ${
                                            !isEditing ? "bg-gray-100" : ""
                                        }`}
                                    />
                                </div>

                                {isEditing && (
                                    <>
                                        <div className="border-t border-gray-200 pt-5">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                Change Password (optional)
                                            </h3>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="current_password"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                id="current_password"
                                                name="current_password"
                                                value={
                                                    formData.current_password
                                                }
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="new_password"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="new_password"
                                                name="new_password"
                                                value={formData.new_password}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="new_password_confirmation"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="new_password_confirmation"
                                                name="new_password_confirmation"
                                                value={
                                                    formData.new_password_confirmation
                                                }
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between pt-5">
                                    {isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsEditing(false)
                                                }
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={updateLoading}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-blue-400"
                                            >
                                                {updateLoading
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                            >
                                                Logout
                                            </button>
                                            <span
                                                // type="button"
                                                onClick={() =>
                                                    setIsEditing(true)
                                                }
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                            >
                                                Edit Profile
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
