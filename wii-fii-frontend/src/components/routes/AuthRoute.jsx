import { Navigate } from "react-router-dom";

/**
 * AuthRoute component
 * Redirects to home page if user is already authenticated
 * Used for login and register pages
 */
export default function AuthRoute({ children }) {
    const token = localStorage.getItem("token");

    if (token) {
        // User is already logged in, redirect to home page
        return <Navigate to="/" replace />;
    }

    // User is not authenticated, render the auth component (login/register)
    return children;
}
