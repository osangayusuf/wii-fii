import { useState, useEffect } from "react";
import axios from "axios";

/**
 * TransactionDetails component
 * Displays transaction details and allows verifying pending transactions
 */
export default function TransactionDetails({
    transaction,
    onVerificationSuccess,
    walletId,
}) {
    const [verifying, setVerifying] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState(null);
    const [verificationError, setVerificationError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [transactionData, setTransactionData] = useState(null);
    const [transactionVerified, setTransactionVerified] = useState(false);

    // Initialize transaction data safely
    useEffect(() => {
        const initializeTransactionData = () => {
            try {
                console.log("Initializing transaction data:", transaction);

                if (!transaction) {
                    throw new Error("No transaction data provided");
                }

                // Reset verification states when transaction changes
                setVerificationMessage(null);
                setVerificationError(null);
                setTransactionVerified(false);

                // Verify all required fields exist
                setTransactionData({
                    id: transaction.id || "N/A",
                    amount: parseFloat(transaction.amount || 0),
                    description: transaction.description || "No description",
                    status: transaction.status || "unknown",
                    reference: transaction.reference || "N/A",
                    created_at:
                        transaction.created_at || new Date().toISOString(),
                    metadata: transaction.metadata || null,
                });
            } catch (error) {
                console.error("Error initializing transaction data:", error);
                setVerificationError(
                    "Error loading transaction details: " + error.message
                );
            } finally {
                setIsLoading(false);
            }
        };

        initializeTransactionData();
    }, [transaction]);

    // Format date with day, month, year, hour and minute
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

    // Function to retry verification for pending transactions
    const retryVerification = async () => {
        if (!transaction || !transaction.metadata.reference) {
            setVerificationError("No transaction reference found");
            return;
        }

        try {
            setVerifying(true);
            setVerificationError(null);
            setVerificationMessage(null);
          
            const response = await axios.get(
                "https://wii-fii.test/api/v1/wallet/verify-funding",
                {
                    params: {
                        reference: transaction.metadata.reference,
                    },
                }
            );

            if (response.data.status === "success") {
                console.log(
                    "Transaction verified successfully:",
                    response.data
                );
                // Update transaction status in local state
                setTransactionData((prevData) => ({
                    ...prevData,
                    status: "completed",
                }));

                setVerificationMessage(
                    "Transaction verified successfully! Your funds have been credited to your wallet."
                );
                setTransactionVerified(true);

                // Refresh wallet data
                if (onVerificationSuccess) {
                    onVerificationSuccess();
                }
            } else {
                setVerificationError(
                    "Verification failed. Status: " + response.data.status
                );
            }
        } catch (error) {
            console.error("Error verifying transaction:", error);
            setVerificationError(
                error.response?.data?.message || "Error verifying transaction"
            );
        } finally {
            setVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-700">
                        Loading transaction details...
                    </p>
                </div>
            </div>
        );
    }

    if (verificationError && !transactionData) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {verificationError}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Verification success message with icon and better styling */}
            {verificationMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-start">
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
                        <p className="font-medium">{verificationMessage}</p>
                        {transactionVerified && (
                            <p className="text-sm mt-1">
                                The status has been updated below.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Verification error message */}
            {verificationError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start">
                    <div className="flex-shrink-0 mr-2">
                        <svg
                            className="h-5 w-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p>{verificationError}</p>
                </div>
            )}

            {/* Transaction details */}
            {transactionData && (
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                        transactionVerified
                            ? "border border-green-200 p-4 rounded bg-green-50"
                            : ""
                    }`}
                >
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">
                            Transaction ID
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                            {transactionData.id}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">
                            Reference
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                            {transactionData.reference}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">
                            Date
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatDate(transactionData.created_at)}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">
                            Amount
                        </h4>
                        <p
                            className={`mt-1 text-sm font-medium ${
                                transactionData.amount > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {transactionData.amount > 0 ? "+" : ""}₦
                            {Math.abs(transactionData.amount).toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">
                            Description
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                            {transactionData.description}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">
                            Status
                        </h4>
                        <span
                            className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                                transactionData.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : transactionData.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {transactionData.status}
                            {transactionVerified &&
                                transactionData.status === "completed" && (
                                    <svg
                                        className="ml-1 h-4 w-4 text-green-600"
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
                    </div>

                    {transactionData.metadata && (
                        <div className="col-span-2">
                            <h4 className="text-sm font-medium text-gray-500">
                                Additional Information
                            </h4>
                            <pre className="mt-1 text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-auto">
                                {JSON.stringify(
                                    transactionData.metadata,
                                    null,
                                    2
                                )}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {/* Retry verification button for pending transactions */}
            {transactionData &&
                transactionData.status === "pending" &&
                transactionData.amount > 0 && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={retryVerification}
                            disabled={verifying}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                        >
                            {verifying ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                "Retry Verification"
                            )}
                        </button>
                    </div>
                )}
        </div>
    );
}
