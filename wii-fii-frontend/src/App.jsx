import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar";

// Route Components
import PrivateRoute from "./components/routes/PrivateRoute";
import AuthRoute from "./components/routes/AuthRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Plans from "./pages/Plans";
import Vouchers from "./pages/Vouchers";

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex-grow">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />

                        {/* Auth routes - Redirect to home if user is already logged in */}
                        <Route
                            path="/login"
                            element={
                                <AuthRoute>
                                    <Login />
                                </AuthRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <AuthRoute>
                                    <Register />
                                </AuthRoute>
                            }
                        />

                        {/* Protected routes - Redirect to login if user is not logged in */}
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/wallet"
                            element={
                                <PrivateRoute>
                                    <Wallet />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/plans" element={<Plans />} />
                        <Route
                            path="/vouchers"
                            element={
                                <PrivateRoute>
                                    <Vouchers />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
                <footer className="bg-gray-800 text-white py-6">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-sm">
                            © 2025 Wii-Fii - Premium WiFi Service. All rights
                            reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
