import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PaystackPop from "@paystack/inline-js";
import Modal from "../components/ui/Modal";
import TransactionDetails from "../components/wallet/TransactionDetails";
import { formatNumberWithCommas } from "../utils";

// Common CSS classes (DRY approach)
const tableHeaderClass =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
const tableDataClass = "px-6 py-4 whitespace-nowrap text-sm";
const buttonClass =
    "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
const primaryButtonClass = `${buttonClass} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
const secondaryButtonClass = `${buttonClass} text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500`;
const dangerButtonClass = `${buttonClass} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
const successButtonClass = `${buttonClass} text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400`;

export default function Wallet() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState("");
    const [topupLoading, setTopupLoading] = useState(false);
    const navigate = useNavigate();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [updatedTransactionId, setUpdatedTransactionId] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            navigate("/login");
            return;
        }
        // Check if token is valid
        if (!token) {
            navigate("/login");
            return;
        }

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch wallet data
        fetchWalletData(user);
    }, [navigate]);

    // Extract fetch wallet data into separate function for reusability
    const fetchWalletData = async (user) => {
        try {
            console.log(user);
            setLoading(true);
            // Check if user.wallet exists
            if (!user.wallet || !user.wallet.id) {
                setError("Wallet information not found");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `https://wii-fii.test/api/v1/wallet/${user.wallet.id}`
            );

            if (response.data && response.data.data) {
                setWallet(response.data.data);

                // Ensure transactions is always an array and process the data
                let transactionsList = response.data.data.transactions || [];

                // Pre-process transactions to ensure all required fields are present
                transactionsList = transactionsList.map((transaction) => ({
                    id: transaction.id || `temp_${Date.now()}`,
                    amount: parseFloat(transaction.amount || 0),
                    description: transaction.description || "No description",
                    status: transaction.status || "unknown",
                    reference: transaction.reference || "N/A",
                    created_at:
                        transaction.created_at || new Date().toISOString(),
                    metadata: transaction.metadata || null,
                }));

                setTransactions(transactionsList);
                console.log("Processed transactions:", transactionsList);

                // If a transaction was updated, reflect the changes in the modal
                if (updatedTransactionId && isModalOpen) {
                    const updatedTransaction = transactionsList.find(
                        (transaction) => transaction.id === updatedTransactionId
                    );

                    if (updatedTransaction) {
                        setSelectedTransaction(updatedTransaction);
                    }

                    // Reset the updated transaction ID
                    setUpdatedTransactionId(null);
                }
            } else {
                setError("Invalid wallet data received");
                console.error("Invalid wallet data:", response.data);
            }
        } catch (err) {
            setError("Failed to load wallet data");
            console.error("Wallet fetch error:", err);
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

    const handleTopup = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            setTopupLoading(true);
            setError(null);
            const topupData = await axios.post(
                `https://wii-fii.test/api/v1/wallet/${wallet["id"]}/fund`,
                {
                    amount: parseFloat(amount),
                }
            );

            const popup = new PaystackPop();
            const payment = popup.resumeTransaction(
                topupData.data.transaction.metadata.access_code
            );

            payment.onSuccess = async (transaction) => {
                console.log("Paystack onSuccess:", transaction);
                if (transaction.status === "success") {
                    try {
                        // Use the reference from the Paystack transaction response
                        const verifyTransaction = await axios.get(
                            "https://wii-fii.test/api/v1/wallet/verify-funding",
                            {
                                params: {
                                    reference:
                                        transaction.reference ||
                                        topupData.data.transaction.metadata
                                            .reference,
                                },
                            }
                        );
                        console.log(
                            "Backend verification response:",
                            verifyTransaction.data
                        );
                        if (verifyTransaction.data.status === "success") {
                            // Assuming your backend returns a 'status'
                            console.log("Payment successful and verified!");
                            setError(null);
                            // Refresh wallet data *after* successful verification
                            refreshWalletData();
                            setAmount(""); // Reset amount
                        } else {
                            setError(
                                "Payment verification failed on the server."
                            );
                        }
                    } catch (verificationError) {
                        console.error(
                            "Error verifying transaction:",
                            verificationError
                        );
                        setError("Error verifying payment with the server.");
                    }
                } else {
                    setError("Payment failed. Please try again.");
                }
                setTopupLoading(false); // Move loading state reset here for clarity in this flow
            };

            payment.onFailure = (error) => {
                console.error("Paystack onFailure:", error);
                setError("Payment failed. Please try again.");
                setTopupLoading(false);
            };

            payment.onClose = () => {
                console.log("Paystack popup closed.");
                setTopupLoading(false); // Ensure loading is off if user closes
            };
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to initiate top up. Please try again."
            );
            console.error(err);
            setTopupLoading(false);
        }
    };

    // Handle viewing transaction details
    const handleViewDetails = (transaction) => {
        if (!transaction) {
            setModalError("Cannot view details: No transaction selected");
            return;
        }

        try {
            console.log("Viewing details for transaction:", transaction);

            // Reset any previous modal errors
            setModalError(null);

            // Set the selected transaction first (forcing re-render of modal)
            setSelectedTransaction(transaction);

            // Then open the modal
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error displaying transaction details:", err);
            setModalError("Error displaying transaction details");
        }
    };

    // Refresh wallet data after verification with improved transaction updating
    const refreshWalletData = async () => {
        try {
            // Store the current transaction ID to update the modal after refresh
            if (selectedTransaction) {
                setUpdatedTransactionId(selectedTransaction.id);
            }

            const user = JSON.parse(localStorage.getItem("user") || "null");
            if (user && user.wallet) {
                await fetchWalletData(user);
            } else {
                console.error("Cannot refresh wallet: User data missing");
            }
        } catch (err) {
            console.error("Error refreshing wallet data:", err);
        }
    };

    // Format date for table display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return "Invalid date";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-700">
                        Loading wallet information...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    My Wallet
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="bg-blue-600 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Wallet Balance
                        </h2>
                        <div className="text-4xl font-bold text-white mt-2">
                            ₦
                            {formatNumberWithCommas(
                                wallet?.balance?.toFixed(2) || "0.00"
                            )}
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleTopup} className="mb-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-grow">
                                    <label
                                        htmlFor="amount"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Top up amount (₦)
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                                        placeholder="Enter amount"
                                        min="1"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={topupLoading}
                                        className={successButtonClass}
                                    >
                                        {topupLoading
                                            ? "Processing..."
                                            : "Top Up"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Recent Transactions
                            </h3>
                            {transactions.length === 0 ? (
                                <p className="text-gray-500">
                                    No transactions yet
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className={tableHeaderClass}
                                                >
                                                    Date
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={tableHeaderClass}
                                                >
                                                    Description
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={`${tableHeaderClass} text-right`}
                                                >
                                                    Amount
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={`${tableHeaderClass} text-right`}
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={`${tableHeaderClass} text-right`}
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.map(
                                                (transaction, index) => (
                                                    <tr
                                                        key={
                                                            transaction.id ||
                                                            index
                                                        }
                                                        className={
                                                            updatedTransactionId ===
                                                            transaction.id
                                                                ? "bg-green-50 transition-colors duration-1000"
                                                                : ""
                                                        }
                                                    >
                                                        <td
                                                            className={`${tableDataClass} text-gray-500`}
                                                        >
                                                            {formatDate(
                                                                transaction.created_at
                                                            )}
                                                        </td>
                                                        <td
                                                            className={`${tableDataClass} text-gray-900`}
                                                        >
                                                            {
                                                                transaction.description
                                                            }
                                                        </td>
                                                        <td
                                                            className={`${tableDataClass} font-medium text-right ${
                                                                parseFloat(
                                                                    transaction.amount
                                                                ) > 0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {parseFloat(
                                                                transaction.amount
                                                            ) > 0
                                                                ? "+"
                                                                : ""}
                                                            ₦
                                                            {formatNumberWithCommas(
                                                                Math.abs(
                                                                    parseFloat(
                                                                        transaction.amount ||
                                                                            0
                                                                    )
                                                                ).toFixed(2)
                                                            )}
                                                        </td>
                                                        <td
                                                            className={`${tableDataClass} text-right`}
                                                        >
                                                            <span
                                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    transaction.status ===
                                                                    "completed"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : transaction.status ===
                                                                          "pending"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800"
                                                                }`}
                                                            >
                                                                {
                                                                    transaction.status
                                                                }
                                                                {updatedTransactionId ===
                                                                    transaction.id &&
                                                                    transaction.status ===
                                                                        "completed" && (
                                                                        <svg
                                                                            className="ml-1 h-3 w-3 text-green-600"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                            </span>
                                                        </td>
                                                        <td
                                                            className={`${tableDataClass} text-right`}
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    handleViewDetails(
                                                                        transaction
                                                                    )
                                                                }
                                                                className={
                                                                    secondaryButtonClass
                                                                }
                                                                type="button"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {(isModalOpen || selectedTransaction) && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        // Clear selection after modal closes to prevent stale data
                        setTimeout(() => {
                            setSelectedTransaction(null);
                            setUpdatedTransactionId(null);
                        }, 300);
                    }}
                    title="Transaction Details"
                    size="lg"
                >
                    {modalError ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {modalError}
                        </div>
                    ) : selectedTransaction ? (
                        <TransactionDetails
                            key={`${selectedTransaction.id}-${selectedTransaction.status}`} // Key with status to force re-render on status change
                            transaction={selectedTransaction}
                            onVerificationSuccess={refreshWalletData}
                            walletId={wallet?.id}
                        />
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-500">
                                No transaction selected
                            </p>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
