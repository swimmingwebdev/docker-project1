document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-button").addEventListener("click", handleLogin);
    document.getElementById("register-button").addEventListener("click", handleRegister);
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
}

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showAlert("Please enter both username and password to register.", "error");
        return;
    }

    try {
        const registerResponse = await fetch("http://localhost:5000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
            showAlert(registerData.message || "Registration failed.", "error");
            return;
        }

        showAlert("Registration successful! Please log in.", "success");
    } catch (error) {
        console.error("Registration error:", error);
        showAlert("Registration failed. Try again later.", "error");
    }
}

async function fetchAnalytics(token) {
    try {
        const response = await fetch("http://localhost:5002/analytics", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            if (response.status === 401) {
                showAlert("Unauthorized. Please login again.", "error");
                localStorage.clear();
                location.reload();
            }
            return;
        }

        const data = await response.json();

        document.getElementById("total-spending").textContent = `$${data?.total_spending || "N/A"}`;
        document.getElementById("average-spending").innerHTML = 
            Object.entries(data?.average_spending_per_category || {})
                  .map(([category, amount]) => `${category}: $${parseFloat(amount).toFixed(2)}`)
                  .join("<br>");
        document.getElementById("highest-category").textContent = `${data?.highest_spending_category || "N/A"}`;

        const monthlyEntries = Object.entries(data.monthly_report || {});
        if (monthlyEntries.length > 0) {
            const [latestMonth, latestAmount] = monthlyEntries.sort().reverse()[0];
            const [year, monthNumber] = latestMonth.split("-");
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            document.getElementById("monthly-report").textContent = `$${latestAmount} in ${monthNames[parseInt(monthNumber, 10) - 1]}`;
        } else {
            document.getElementById("monthly-report").textContent = "No data available";
        }

        document.getElementById("login-message").classList.add("hidden");
        document.getElementById("analytics-data").classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching analytics:", error);
        showAlert("Error fetching analytics data.", "error");
    }
}

function updateLoginButton() {
    const loginForm = document.getElementById("login-form");
    const loginButton = document.getElementById("login-button");
    const registerButton = document.getElementById("register-button");
    const enterDataLink = document.getElementById("enter-data-link");
    const token = localStorage.getItem("auth_token");  // ✅ Fix here
    const isLoggedIn = token;

    if (token) {
        enterDataLink.href = `http://localhost:8080/?token=${token}`;
        enterDataLink.classList.remove("hidden");
    } else {
        enterDataLink.classList.add("hidden");
    }

    loginButton.removeEventListener("click", handleLogin);
    loginButton.removeEventListener("click", handleLogout);

    if (isLoggedIn) {
        loginButton.textContent = "Logout";
        loginButton.classList.remove("bg-blue-500");
        loginButton.classList.add("bg-red-500");
        loginForm.style.display = "none";
        registerButton.classList.add("hidden");
        loginButton.addEventListener("click", handleLogout);
    } else {
        loginButton.textContent = "Login";
        loginButton.classList.add("bg-blue-500");
        loginButton.classList.remove("bg-red-500");
        loginForm.style.display = "flex";
        registerButton.classList.remove("hidden");
        loginButton.addEventListener("click", handleLogin);
    }
}

function handleLogout() {
    localStorage.clear();

    document.getElementById("welcome-message").textContent = "";
    document.getElementById("analytics-data").classList.add("hidden");
    document.getElementById("login-message").classList.remove("hidden");
    updateLoginButton();

    showAlert("Logged out successfully", "success");

    setTimeout(() => {
        location.reload();
    }, 500);
}

window.onload = async function () {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');

    if (tokenFromURL) {
        localStorage.setItem("auth_token", tokenFromURL);
    }

    const token = localStorage.getItem("auth_token");
    const username = localStorage.getItem("username"); // optional, for greeting

    if (username) {
        document.getElementById("welcome-message").textContent = `Hello ${username}`;
    }

    updateLoginButton(); // make sure button appearance updates

    if (token) {
        await fetchAnalytics(token);
        document.getElementById("login-form").style.display = "none";
    }

    // Remove the token from the URL
    if (window.location.search.includes("token")) {
    window.history.replaceState({}, document.title, "/");
    }
};

document.getElementById("update-results").addEventListener("click", async function () {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        showAlert("Please log in first.", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:5002/update-analytics", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
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
