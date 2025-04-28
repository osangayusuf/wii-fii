import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "./ui/Modal";
import { formatNumberWithCommas } from "../utils";

export default function ServicePlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);
    const [purchaseError, setPurchaseError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    "https://wii-fii.test/api/v1/plans"
                );
                setPlans(response.data.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch service plans");
                setLoading(false);
                console.error(err);
            }
        };

        fetchPlans();
    }, []);

    // Handle plan selection for purchase
    const handlePlanSelect = (plan) => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", {
                state: {
                    message: "Please log in to purchase a plan",
                    returnTo: "/plans",
                },
            });
            return;
        }

        setSelectedPlan(plan);
        setIsModalOpen(true);
        setPurchaseError(null);
        setPurchaseSuccess(null);
    };

    // Handle voucher purchase
    const handlePurchase = async () => {
        try {
            setIsPurchasing(true);
            setPurchaseError(null);

            // Set authorization header
            const token = localStorage.getItem("token");
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const response = await axios.post(
                "https://wii-fii.test/api/v1/vouchers/purchase",
                {
                    service_plan_id: selectedPlan.id,
                }
            );

            setPurchaseSuccess(response.data);

            // Wait 1.5 seconds to show success message before redirect
            setTimeout(() => {
                setIsModalOpen(false);
                // Navigate to vouchers page with the newly created voucher
                navigate("/vouchers", {
                    state: {
                        newVoucher: response.data.data,
                        message: "Voucher purchased successfully!",
                    },
                });
            }, 1500);
        } catch (err) {
            console.error("Purchase error:", err);

            if (err.response?.status === 401) {
                // Handle unauthorized
                setPurchaseError(
                    "You need to log in again to complete this purchase."
                );
                localStorage.removeItem("token");
            } else if (err.response?.status === 400) {
                // Handle insufficient funds
                setPurchaseError(
                    err.response.data.message ||
                        "Insufficient funds in wallet. Please top up your wallet and try again."
                );
            } else {
                // Handle other errors
                setPurchaseError(
                    err.response?.data?.message ||
                        "Failed to purchase voucher. Please try again."
                );
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-700">
                        Loading service plans...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
            >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Available Service Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="bg-blue-600 text-white font-bold text-xl p-4">
                            {plan.name}
                        </div>
                        <div className="p-6">
                            <p className="text-gray-500 text-sm mb-4">
                                {plan.description}
                            </p>
                            <div className="flex justify-between items-center text-sm mb-4 gap-10">
                                <div className="text-left">
                                    <p className="text-gray-700">
                                        <span className="font-medium">
                                            Duration:
                                        </span>{" "}
                                        {plan.duration_hours} hours
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">
                                            Data Limit:
                                        </span>{" "}
                                        {plan.data_limit_mb} MB
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-blue-600">
                                    ₦{formatNumberWithCommas(plan.price)}
                                </p>
                            </div>
                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                onClick={() => handlePlanSelect(plan)}
                            >
                                Purchase Plan
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Purchase Confirmation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isPurchasing && setIsModalOpen(false)}
                title="Confirm Purchase"
                size="md"
            >
                {selectedPlan && (
                    <div className="space-y-4">
                        {/* Success message */}
                        {purchaseSuccess && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                                <p className="font-medium">
                                    Voucher purchased successfully!
                                </p>
                                <p className="text-sm">
                                    Redirecting to your vouchers...
                                </p>
                            </div>
                        )}

                        {/* Error message */}
                        {purchaseError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <p>{purchaseError}</p>
                                {purchaseError.includes("funds") && (
                                    <button
                                        className="mt-2 text-sm underline text-red-700 hover:text-red-800"
                                        onClick={() => navigate("/wallet")}
                                    >
                                        Go to wallet
                                    </button>
                                )}
                            </div>
                        )}

                        {!purchaseSuccess && (
                            <>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {selectedPlan.name}
                                    </h3>
                                    <p className="text-gray-500 mb-3">
                                        {selectedPlan.description}
                                    </p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Duration:
                                        </span>
                                        <span className="font-medium">
                                            {selectedPlan.duration_hours} hours
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Data Limit:
                                        </span>
                                        <span className="font-medium">
                                            {selectedPlan.data_limit_mb} MB
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">
                                            Price:
                                        </span>
                                        <span className="font-medium text-blue-600">
                                            ₦{selectedPlan.price}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm">
                                    Your account will be charged ₦
                                    {selectedPlan.price}. This amount will be
                                    deducted from your wallet balance.
                                </p>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isPurchasing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
                                        onClick={handlePurchase}
                                        disabled={isPurchasing}
                                    >
                                        {isPurchasing ? (
                                            <div className="flex items-center">
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
                                                Processing...
                                            </div>
                                        ) : (
                                            "Confirm Purchase"
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
