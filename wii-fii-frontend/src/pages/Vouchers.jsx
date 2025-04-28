import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "../components/ui/Modal";

// Common CSS classes (DRY approach)
const tableHeaderClass =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
const tableDataClass = "px-6 py-4 whitespace-nowrap text-sm";
const buttonClass =
    "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
const primaryButtonClass = `${buttonClass} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
const secondaryButtonClass = `${buttonClass} text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500`;

export default function Vouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [highlightedVoucherId, setHighlightedVoucherId] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Handle redirect from plan purchase
        if (location.state?.message) {
            setSuccess(location.state.message);
            if (location.state.newVoucher) {
                setHighlightedVoucherId(location.state.newVoucher.id);
            }

            // Clear the location state to prevent showing the message on page refresh
            window.history.replaceState({}, document.title);
        }

        fetchVouchers();
    }, [navigate, location]);

    // Function to fetch vouchers
    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "https://wii-fii.test/api/v1/vouchers"
            );
            setVouchers(response.data.data);
            console.log("Fetched vouchers:", response.data.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch vouchers");
            setLoading(false);
            console.error(err);
            // If unauthorized, redirect to login
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
        }
    };

    // Function to view voucher details
    const viewVoucherDetails = (voucher) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    // Function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Function to display time used based on remaining_hours from API
    const displayTimeUsed = (voucher) => {
        if (!voucher.service_plan) return "Not used yet";

        // Use the remaining_hours from API directly
        const remainingHours = voucher.remaining_hours;
        const totalHours = voucher.service_plan.duration_hours;

        return `${totalHours - remainingHours} / ${totalHours} hours`;
    };

    // Function to calculate percentage of time used based on remaining_hours
    const calculateTimePercentage = (voucher) => {
        if (!voucher.start_time || !voucher.service_plan) return 0;

        // Use the remaining_hours from API directly
        const remainingHours = voucher.remaining_hours;
        const totalHours = voucher.service_plan.duration_hours;

        // Calculate used percentage based on remaining hours
        return Math.min(
            100,
            Math.round(((totalHours - remainingHours) / totalHours) * 100)
        );
    };

    // Function to handle copying voucher code
    const handleCopyCode = (code) => {
        window.navigator.clipboard
            .writeText(code)
            .then(() => {
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy code: ", err);
            });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading vouchers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Vouchers
                    </h1>
                    <button
                        onClick={() => navigate("/plans")}
                        className={primaryButtonClass}
                    >
                        Browse Plans
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-start">
                        <div className="flex-shrink-0 mr-2">
                            <svg
                                className="h-5 w-5 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div>
                            <p>{success}</p>
                        </div>
                        <button
                            onClick={() => setSuccess(null)}
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        >
                            <svg
                                className="fill-current h-6 w-6 text-green-500"
                                role="button"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <title>Close</title>
                                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                            </svg>
                        </button>
                    </div>
                )}

                {vouchers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
                        <p className="text-gray-500 mb-4">
                            You don't have any vouchers yet.
                        </p>
                        <button
                            onClick={() => navigate("/plans")}
                            className={primaryButtonClass.replace(
                                "px-3 py-2",
                                "px-4 py-2"
                            )}
                        >
                            Browse Plans
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className={tableHeaderClass}
                                        >
                                            Voucher Code
                                        </th>
                                        <th
                                            scope="col"
                                            className={tableHeaderClass}
                                        >
                                            Service Plan
                                        </th>
                                        <th
                                            scope="col"
                                            className={tableHeaderClass}
                                        >
                                            Time Used
                                        </th>
                                        <th
                                            scope="col"
                                            className={tableHeaderClass}
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className={tableHeaderClass}
                                        >
                                            Devices
                                        </th>
                                        <th
                                            scope="col"
                                            className={tableHeaderClass}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vouchers.map((voucher) => (
                                        <tr
                                            key={voucher.id}
                                            className={
                                                highlightedVoucherId ===
                                                voucher.id
                                                    ? "bg-green-50"
                                                    : ""
                                            }
                                        >
                                            <td className={tableDataClass}>
                                                <span className="font-medium text-gray-900">
                                                    {voucher.code}
                                                </span>
                                            </td>
                                            <td className={tableDataClass}>
                                                {voucher.service_plan
                                                    ? voucher.service_plan.name
                                                    : "N/A"}
                                            </td>
                                            <td className={tableDataClass}>
                                                <div className="flex flex-col space-y-1">
                                                    <span>
                                                        {displayTimeUsed(
                                                            voucher
                                                        )}
                                                    </span>
                                                    {voucher.start_time && (
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-blue-600 h-2.5 rounded-full"
                                                                style={{
                                                                    width: `${calculateTimePercentage(
                                                                        voucher
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={tableDataClass}>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${
                                                        voucher.status ===
                                                        "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : voucher.status ===
                                                              "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {voucher.status}
                                                </span>
                                            </td>
                                            <td className={tableDataClass}>
                                                {voucher.active_devices} /{" "}
                                                {voucher.allowed_devices}
                                            </td>
                                            <td className={tableDataClass}>
                                                <button
                                                    onClick={() =>
                                                        viewVoucherDetails(
                                                            voucher
                                                        )
                                                    }
                                                    className={
                                                        secondaryButtonClass
                                                    }
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Voucher Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Voucher Details"
                size="lg"
            >
                {selectedVoucher && (
                    <div className="space-y-6">
                        {/* Header and status */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Voucher:{" "}
                                    <span className="font-bold">
                                        {selectedVoucher.code}
                                    </span>
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Created on{" "}
                                    {formatDate(selectedVoucher.created_at)}
                                </p>
                            </div>
                            <span
                                className={`px-2 py-1 mt-2 md:mt-0 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${
                                    selectedVoucher.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : selectedVoucher.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {selectedVoucher.status}
                            </span>
                        </div>

                        {/* Service Plan Info */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Service Plan
                            </h4>
                            {selectedVoucher.service_plan ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedVoucher.service_plan.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {
                                                selectedVoucher.service_plan
                                                    .description
                                            }
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                            Duration:{" "}
                                            {
                                                selectedVoucher.service_plan
                                                    .duration_hours
                                            }{" "}
                                            hours
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Data:{" "}
                                            {
                                                selectedVoucher.service_plan
                                                    .data_limit_mb
                                            }{" "}
                                            MB
                                        </p>
                                        <p className="text-sm font-medium text-blue-600">
                                            ₦
                                            {selectedVoucher.service_plan.price}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No service plan attached
                                </p>
                            )}
                        </div>

                        {/* Usage details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">
                                    Usage Time
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Start Time:
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {formatDate(
                                                selectedVoucher.start_time
                                            ) || "Not started yet"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            End Time:
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {formatDate(
                                                selectedVoucher.end_time
                                            ) || "Not ended yet"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Time Used:
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {displayTimeUsed(selectedVoucher)}
                                        </span>
                                    </div>
                                    {selectedVoucher.start_time && (
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{
                                                    width: `${calculateTimePercentage(
                                                        selectedVoucher
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">
                                    Device Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Active Devices:
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {selectedVoucher.active_devices} of{" "}
                                            {selectedVoucher.allowed_devices}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Last Used:
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {formatDate(
                                                selectedVoucher.last_used_at
                                            ) || "Never"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connected Devices */}
                        {selectedVoucher.devices &&
                            selectedVoucher.devices.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                                        Connected Devices
                                    </h4>
                                    <div className="bg-gray-50 rounded-md border border-gray-200">
                                        <ul className="divide-y divide-gray-200">
                                            {selectedVoucher.devices.map(
                                                (device) => (
                                                    <li
                                                        key={device.id}
                                                        className="px-4 py-3"
                                                    >
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {device.name ||
                                                                        device.mac_address}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        device.mac_address
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500">
                                                                    Connected
                                                                    since
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {formatDate(
                                                                        device.connected_at
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}

                        {/* Copy code section */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-center">
                                <button
                                    className={`${buttonClass} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 relative`}
                                    onClick={() =>
                                        handleCopyCode(selectedVoucher.code)
                                    }
                                    disabled={copyFeedback}
                                >
                                    {copyFeedback ? (
                                        <>
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                            Code Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path>
                                                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"></path>
                                            </svg>
                                            Copy Voucher Code
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="mt-3 text-xs text-center text-gray-500">
                                Use this code to connect to the hotspot from any
                                device
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
