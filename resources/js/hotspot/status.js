/**
 * Hotspot status page functionality
 * Handles checking status, refreshing, and disconnecting
 */

export default function initStatusPage() {
    const deviceId = document.getElementById("device-id")?.textContent;
    const voucherCode = document.getElementById("voucher-code-hidden")?.value;

    if (!deviceId || !voucherCode) return;

    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");
    const loading = document.getElementById("loading");
    const statusContainer = document.getElementById("status-container");
    const refreshBtn = document.getElementById("refresh-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");

    // Format date function
    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    // Get status function
    function getStatus() {
        // Show loading
        loading.classList.remove("hidden");
        statusContainer.classList.add("hidden");
        errorMessage.classList.add("hidden");
        successMessage.classList.add("hidden");

        // Send API request
        fetch("/api/v1/hotspot/status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify({
                voucher_code: voucherCode,
                device_id: deviceId,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Hide loading
                loading.classList.add("hidden");

                if (data.voucher && data.is_valid !== undefined) {
                    // Show status container
                    statusContainer.classList.remove("hidden");

                    // Update voucher details
                    document.getElementById("voucher-code").textContent =
                        data.voucher.code;
                    document.getElementById("voucher-status").textContent =
                        data.voucher.status;
                    document.getElementById("service-plan").textContent =
                        data.voucher.service_plan?.name || "-";
                    document.getElementById("remaining-hours").textContent =
                        data.voucher.remaining_hours || 0;
                    document.getElementById(
                        "active-devices"
                    ).textContent = `${data.voucher.active_devices}/${data.voucher.allowed_devices}`;

                    // Update device info
                    if (data.device_session) {
                        document.getElementById("connected-at").textContent =
                            formatDate(data.device_session.connected_at);
                    }

                    // Update connection status
                    const connectionIcon =
                        document.getElementById("connection-icon");
                    const connectionStatus =
                        document.getElementById("connection-status");
                    const connectionMessage =
                        document.getElementById("connection-message");

                    if (data.is_connected && data.is_valid) {
                        connectionIcon.classList.remove(
                            "bg-red-100",
                            "text-red-500"
                        );
                        connectionIcon.classList.add(
                            "bg-green-100",
                            "text-green-500"
                        );
                        connectionStatus.textContent = "Connected";
                        connectionStatus.classList.remove("text-red-800");
                        connectionStatus.classList.add("text-blue-800");
                        connectionMessage.textContent =
                            "You are connected to the internet.";
                    } else if (!data.is_valid) {
                        connectionIcon.classList.remove(
                            "bg-green-100",
                            "text-green-500"
                        );
                        connectionIcon.classList.add(
                            "bg-red-100",
                            "text-red-500"
                        );
                        connectionStatus.textContent = "Expired";
                        connectionStatus.classList.remove("text-blue-800");
                        connectionStatus.classList.add("text-red-800");
                        connectionMessage.textContent =
                            "Your voucher has expired.";
                    } else {
                        connectionIcon.classList.remove(
                            "bg-green-100",
                            "text-green-500"
                        );
                        connectionIcon.classList.add(
                            "bg-red-100",
                            "text-red-500"
                        );
                        connectionStatus.textContent = "Disconnected";
                        connectionStatus.classList.remove("text-blue-800");
                        connectionStatus.classList.add("text-red-800");
                        connectionMessage.textContent =
                            "You are not connected to the internet.";
                    }
                } else {
                    // Show error
                    errorMessage.textContent =
                        data.message || "Failed to get status";
                    errorMessage.classList.remove("hidden");
                }
            })
            .catch((error) => {
                // Hide loading
                loading.classList.add("hidden");

                // Show error
                errorMessage.textContent =
                    "An error occurred. Please try again.";
                errorMessage.classList.remove("hidden");
                console.error("Error:", error);
            });
    }

    // Disconnect function
    function disconnect() {
        // Show loading
        loading.classList.remove("hidden");
        statusContainer.classList.add("hidden");
        errorMessage.classList.add("hidden");
        successMessage.classList.add("hidden");

        // Send API request
        fetch("/api/v1/hotspot/disconnect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify({
                voucher_code: voucherCode,
                device_id: deviceId,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Hide loading
                loading.classList.add("hidden");

                if (data.message) {
                    // Show success message
                    successMessage.textContent = data.message;
                    successMessage.classList.remove("hidden");

                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = "/hotspot";
                    }, 2000);
                } else {
                    // Show error
                    errorMessage.textContent = "Failed to disconnect";
                    errorMessage.classList.remove("hidden");

                    // Show status container
                    statusContainer.classList.remove("hidden");
                }
            })
            .catch((error) => {
                // Hide loading
                loading.classList.add("hidden");

                // Show error
                errorMessage.textContent =
                    "An error occurred. Please try again.";
                errorMessage.classList.remove("hidden");
                console.error("Error:", error);

                // Show status container
                statusContainer.classList.remove("hidden");
            });
    }

    // Get initial status
    getStatus();

    // Add event listeners
    if (refreshBtn) refreshBtn.addEventListener("click", getStatus);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnect);

    // Refresh status every 30 seconds
    const refreshInterval = setInterval(getStatus, 30000);

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
        clearInterval(refreshInterval);
    });
}
