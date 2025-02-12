document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-button").addEventListener("click", handleLogin);
});

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showAlert("Please enter both username and password.", "error");
        return;
    }

    try {
        const authResponse = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const authData = await authResponse.json();

        if (!authResponse.ok) {
            showAlert(authData.message || "Login failed.", "error");
            return;
        }

        // Store token & username
        localStorage.setItem("auth_token", authData.token);
        localStorage.setItem("username", username);

        document.getElementById("welcome-message").textContent = `Hello ${username}`;
        
        updateLoginButton();
        await fetchAnalytics(authData.token);
        showAlert("Login successful", "success");
    } catch (error) {
        console.error("Login error:", error);
        showAlert("Login failed. Try again later.", "error");
    }
};

// Fetch and display analytics data
async function fetchAnalytics(token) {
    try {
        console.log("Fetching analytics with token:", `Bearer ${token}`);

        const response = await fetch("http://localhost:5002/analytics", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch analytics - Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received Analytics Data:", data); 

        document.getElementById("total-spending").textContent = `$${data?.total_spending || "N/A"}`;
        // Remove brackets
        document.getElementById("average-spending").innerHTML = 
            Object.entries(data?.average_spending_per_category || {})
                .map(([category, amount]) => `${category}: $${amount}`)
                .join("<br>");
        document.getElementById("highest-category").textContent = `${data?.highest_spending_category || "N/A"}`;
        document.getElementById("monthly-report").textContent = 
            Object.entries(data.monthly_report)
                .map(([month, amount]) => {
                    // Extract only the month part
                    let [year, monthNumber] = month.split("-");
                    
                    // Convert month number to name
                    const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    
                    return `$${amount} in ${monthNames[parseInt(monthNumber, 10) - 1]}`;
                })
                .join(", "); 

        // Show analytics data and hide login message
        document.getElementById("login-message").classList.add("hidden");
        document.getElementById("analytics-data").classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching analytics:", error);
        showAlert("Error fetching analytics data.", "error");
    }
}

// Update login/logout button
function updateLoginButton() {
    const loginForm = document.getElementById("login-form");
    const loginButton = document.getElementById("login-button");
    const isLoggedIn = localStorage.getItem("auth_token");

    loginButton.removeEventListener("click", handleLogin);
    loginButton.removeEventListener("click", handleLogout);

    if (isLoggedIn) {
        loginButton.textContent = "Logout";
        loginButton.classList.remove("bg-blue-500");
        loginButton.classList.add("bg-red-500");
        loginForm.style.display = "none";

        loginButton.addEventListener("click", handleLogout);
    } else {
        loginButton.textContent = "Login";
        loginButton.classList.add("bg-blue-500");
        loginButton.classList.remove("bg-red-500");

        loginForm.style.display = "flex";
        loginButton.addEventListener("click", handleLogin);
    }
}


// Handle logout
function handleLogout() {
    localStorage.clear(); // Clear all stored data (token, username, etc.)

    document.getElementById("welcome-message").textContent = "";
    updateLoginButton();

    showAlert("Logged out successfully", "success");

    setTimeout(() => {
        location.reload();
    }, 500);
}

// Load stored username
window.onload = async function () {
    const token = localStorage.getItem("auth_token");
    const username = localStorage.getItem("username");

    if (username) {
        document.getElementById("welcome-message").textContent = `Hello ${username}`;
        updateLoginButton();
    }

    if (token) {
        await fetchAnalytics(token);
        document.getElementById("login-form").style.display = "none";
    }
};

// Update analytics when "Update Results" button is clicked
document.getElementById("update-results").addEventListener("click", async function () {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        showAlert("Please log in first.", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5003/update-analytics", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to update analytics.");
        }

        showAlert("Analytics updated successfully!", "success");
        await fetchAnalytics(token);
    } catch (error) {
        console.error("Error updating analytics:", error);
        showAlert("Error updating analytics.", "error");
    }
});

function showAlert(message, type) {
    const alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.className = `absolute left-1/2 top-full mt-5 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-semibold z-50 ${
        type === "success" ? "bg-blue-500" : "bg-red-500"
    }`;

    const navbar = document.querySelector("nav");
    if (navbar) {
        navbar.style.position = "relative";
        navbar.appendChild(alertBox);
    } else {
        document.body.appendChild(alertBox);
    }

    setTimeout(() => {
        alertBox.remove();
    }, 2000);
}