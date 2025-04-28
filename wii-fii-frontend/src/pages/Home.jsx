import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
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
                setPlans(response.data.data.slice(0, 3)); // Show only first 3 plans on homepage
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

            const response = await axios.post("https://wii-fii.test/api/v1/vouchers/purchase", {
                service_plan_id: selectedPlan.id,
            });

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
            {/* Hero Section */}
            <div className="relative bg-blue-700 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-blue-700 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <div className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">
                                        Fast, Reliable
                                    </span>{" "}
                                    <span className="block text-blue-300 xl:inline">
                                        WiFi Service
                                    </span>
                                </h1>
                                <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Enjoy seamless internet connectivity with
                                    our premium WiFi hotspot service. Connect to
                                    our network, choose a plan that suits your
                                    needs, and start browsing.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to={
                                                isLoggedIn
                                                    ? "/plans"
                                                    : "/register"
                                            }
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
                                        >
                                            {isLoggedIn
                                                ? "View Plans"
                                                : "Get Started"}
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to={
                                                isLoggedIn
                                                    ? "/profile"
                                                    : "/login"
                                            }
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
                                        >
                                            {isLoggedIn
                                                ? "My Account"
                                                : "Sign In"}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-blue-600">
                    <div className="h-full flex items-center justify-center">
                        <svg
                            className="h-64 w-64 text-blue-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M1.5 9l1.5 1.5L9 4.5 6 1.5 1.5 6l3 3z" />
                            <path d="M12 19.5L1.5 9 12 19.5z" />
                            <path d="M12 19.5L22.5 9 12 19.5z" />
                            <path d="M19.5 6L15 1.5 12 4.5l7.5 7.5 1.5-1.5-3-3z" />
                            <path d="M12 4.5L9 1.5 12 4.5z" />
                            <path d="M12 4.5L15 1.5 12 4.5z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Featured Plans Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                            Pricing
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Choose Your WiFi Plan
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            We offer flexible plans to meet all your internet
                            needs, from quick browsing to extended usage.
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
                        <div className="mt-10">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="px-4 py-5 sm:p-6">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {plan.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {plan.description}
                                            </p>
                                            <p className="mt-4 text-3xl font-extrabold text-gray-900">
                                                ₦{plan.price}
                                            </p>
                                            <dl className="mt-4 space-y-2">
                                                <div className="flex items-center">
                                                    <dt className="text-sm font-medium text-gray-500 flex-1">
                                                        Duration
                                                    </dt>
                                                    <dd className="text-sm text-gray-900">
                                                        {plan.duration_hours}{" "}
                                                        hours
                                                    </dd>
                                                </div>
                                                <div className="flex items-center">
                                                    <dt className="text-sm font-medium text-gray-500 flex-1">
                                                        Data Limit
                                                    </dt>
                                                    <dd className="text-sm text-gray-900">
                                                        {plan.data_limit_mb} MB
                                                    </dd>
                                                </div>
                                            </dl>
                                            <div className="mt-6">
                                                {isLoggedIn ? (
                                                    <button
                                                        onClick={() =>
                                                            handlePurchaseClick(
                                                                plan
                                                            )
                                                        }
                                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Purchase
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to="/login"
                                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Sign in to purchase
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 text-center">
                                <Link
                                    to="/plans"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                    View all plans
                                    <svg
                                        className="ml-2 -mr-1 h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                            Features
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A better way to connect
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Our WiFi service is designed to provide you with the
                            best internet experience.
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        High-Speed Connection
                                    </h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Enjoy fast download and upload speeds
                                        for all your online activities.
                                    </p>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Secure Network
                                    </h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Our network is secured with the latest
                                        encryption technology to protect your
                                        data.
                                    </p>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <svg
                                            className="h-6 w-6"
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
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Flexible Payment Options
                                    </h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Pay for only what you need with our
                                        range of affordable plans.
                                    </p>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        24/7 Support
                                    </h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Our customer support team is available
                                        round the clock to assist you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
