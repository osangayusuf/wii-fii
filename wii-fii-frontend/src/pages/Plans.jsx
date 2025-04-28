import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseError, setPurchaseError] = useState(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

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

    const handlePurchaseClick = (plan) => {
        if (!isLoggedIn) return;
        setSelectedPlan(plan);
        setShowPurchaseDialog(true);
        setPurchaseError(null);
        setPurchaseSuccess(false);
    };

    const handleConfirmPurchase = async () => {
        if (!selectedPlan) return;

        setPurchaseLoading(true);
        setPurchaseError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setPurchaseError("You must be logged in to make a purchase");
                setPurchaseLoading(false);
                return;
            }

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const response = await axios.post(
                "https://wii-fii.test/api/v1/vouchers/purchase",
                {
                    service_plan_id: selectedPlan.id,
                }
            );

            setPurchaseSuccess(true);
            setTimeout(() => {
                setShowPurchaseDialog(false);
                setPurchaseSuccess(false);
            }, 2000);
            navigate("/vouchers", {
                state: {
                    newVoucher: response.data.data,
                    message: "Voucher purchased successfully!",
                },
            });
        } catch (err) {
            setPurchaseError(
                err.response?.data?.message ||
                    "Failed to complete purchase. Please try again."
            );
            console.error(err);
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setShowPurchaseDialog(false);
        setSelectedPlan(null);
        setPurchaseError(null);
        setPurchaseSuccess(false);
    };

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        WiFi Service Plans
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose the perfect plan for your internet needs. From
                        quick browsing sessions to extended usage, we've got you
                        covered.
                    </p>
                </div>

                {loading ? (
                    <div className="mt-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="mt-12 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                ) : (
                    <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="px-6 py-8">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    <p className="mt-2 text-gray-500">
                                        {plan.description}
                                    </p>
                                    <p className="mt-4 text-4xl font-extrabold text-gray-900">
                                        ₦{plan.price}
                                    </p>

                                    <ul className="mt-6 space-y-4">
                                        <li className="flex items-center">
                                            <svg
                                                className="h-5 w-5 text-green-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-2 text-gray-600">
                                                {plan.duration_hours} hours of
                                                usage
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg
                                                className="h-5 w-5 text-green-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-2 text-gray-600">
                                                {plan.data_limit_mb} MB data
                                                limit
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg
                                                className="h-5 w-5 text-green-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="ml-2 text-gray-600">
                                                High-speed connection
                                            </span>
                                        </li>
                                    </ul>

                                    <div className="mt-8">
                                        {isLoggedIn ? (
                                            <button
                                                onClick={() =>
                                                    handlePurchaseClick(plan)
                                                }
                                                className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Purchase
                                            </button>
                                        ) : (
                                            <Link
                                                to="/login"
                                                className="w-full flex justify-center bg-blue-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Sign in to purchase
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Purchase Confirmation Dialog */}
            {showPurchaseDialog && selectedPlan && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 -z-10 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                        &#8203;
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-headline"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg
                                            className="h-6 w-6 text-blue-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                            className="text-lg leading-6 font-medium text-gray-900"
                                            id="modal-headline"
                                        >
                                            Confirm Purchase
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to
                                                purchase the {selectedPlan.name}{" "}
                                                plan for ₦{selectedPlan.price}?
                                            </p>
                                            <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    Plan Details
                                                </h4>
                                                <dl className="mt-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <dt className="text-gray-500">
                                                            Duration:
                                                        </dt>
                                                        <dd className="font-medium text-gray-900">
                                                            {
                                                                selectedPlan.duration_hours
                                                            }{" "}
                                                            hours
                                                        </dd>
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <dt className="text-gray-500">
                                                            Data Limit:
                                                        </dt>
                                                        <dd className="font-medium text-gray-900">
                                                            {
                                                                selectedPlan.data_limit_mb
                                                            }{" "}
                                                            MB
                                                        </dd>
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <dt className="text-gray-500">
                                                            Price:
                                                        </dt>
                                                        <dd className="font-medium text-gray-900">
                                                            ₦
                                                            {selectedPlan.price}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>

                                        {purchaseError && (
                                            <div className="mt-3 bg-red-50 p-3 rounded-md">
                                                <p className="text-sm text-red-600">
                                                    {purchaseError}
                                                </p>
                                            </div>
                                        )}

                                        {purchaseSuccess && (
                                            <div className="mt-3 bg-green-50 p-3 rounded-md">
                                                <p className="text-sm text-green-600">
                                                    Purchase successful!
                                                    Redirecting...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleConfirmPurchase}
                                    disabled={
                                        purchaseLoading || purchaseSuccess
                                    }
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                                        purchaseLoading || purchaseSuccess
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {purchaseLoading ? (
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
                                            Processing...
                                        </>
                                    ) : purchaseSuccess ? (
                                        "Completed"
                                    ) : (
                                        "Confirm Purchase"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
