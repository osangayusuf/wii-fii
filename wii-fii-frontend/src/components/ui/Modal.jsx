import { useEffect, useRef } from "react";

/**
 * Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size (sm, md, lg, xl)
 * @returns {React.ReactNode}
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
}) {
    const modalRef = useRef(null);

    // Handle escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Handle clicking outside the modal
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                isOpen
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    // Map size to width classes
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby={title}
            role="dialog"
            aria-modal="true"
        >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity -z-10 bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                ></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                {/* Modal panel */}
                <div
                    ref={modalRef}
                    className={`inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}
                    style={{ maxHeight: "calc(100vh - 100px)" }}
                >
                    {/* Modal header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {title}
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 bg-gray-50 rounded-md hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg
                                className="w-6 h-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal content */}
                    <div
                        className="px-4 pt-5 pb-4 overflow-y-auto bg-white sm:p-6 sm:pb-4"
                        style={{ maxHeight: "70vh" }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
