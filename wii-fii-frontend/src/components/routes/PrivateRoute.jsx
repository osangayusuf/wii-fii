import { Navigate } from "react-router-dom";

/**
 * PrivateRoute component
 * Redirects to login page if user is not authenticated
 */
export default function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        // User is not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected component
    return children;
}
