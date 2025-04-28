/**
 * Hotspot module initialization
 * This file registers all hotspot-related JavaScript functionality
 */

import initLandingPage from "./landing";
import initStatusPage from "./status";

// Initialize hotspot modules based on the current page
document.addEventListener("DOMContentLoaded", () => {
    // Initialize landing page if relevant elements exist
    initLandingPage();

    // Initialize status page if relevant elements exist
    initStatusPage();
});
