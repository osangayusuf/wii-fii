/**
 * Hotspot landing page functionality
 * Handles voucher code authentication
 */

export default function initLandingPage() {
    const form = document.getElementById("voucher-form");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Clear messages
        errorMessage.classList.add("hidden");
        successMessage.classList.add("hidden");

        // Get form data
        const voucherCode = document.getElementById("voucher_code").value;
        const deviceId = document.getElementById("device_id").value;

        // Disable submit button
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = "Authenticating...";

        // Send API request
        fetch("/api/v1/hotspot/authenticate", {
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
                device_info: {
                    ip_address: document.getElementById("device_ip").value,
                    user_agent: navigator.userAgent,
                },
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message && (data.voucher || data.device_session)) {
                    // Success
                    successMessage.textContent = data.message;
                    successMessage.classList.remove("hidden");

                    // Redirect to status page
                    setTimeout(() => {
                        window.location.href = `/hotspot/status?device_id=${deviceId}&voucher_code=${voucherCode}`;
                    }, 1500);
                } else {
                    // Error with message
                    errorMessage.textContent =
                        data.message || "Failed to authenticate voucher";
                    errorMessage.classList.remove("hidden");
                }
            })
            .catch((error) => {
                errorMessage.textContent =
                    "An error occurred. Please try again.";
                errorMessage.classList.remove("hidden");
                console.error("Error:", error);
            })
            .finally(() => {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
    });
}
