document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
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
            alert(authData.message);
            return;
        }

        // Store token & username
        localStorage.setItem("auth_token", authData.token);
        localStorage.setItem("username", username);

        document.getElementById("welcome-message").textContent = `Hello ${username}`;
        updateLoginButton();
        await fetchAnalytics(authData.token);
        alert("Login successful");
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Login failed.");
    }
});

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

        document.getElementById("total-spending").textContent = `Total Spending: $${data.total_spending}`;
        document.getElementById("average-spending").textContent = `Average Spending: ${JSON.stringify(data.average_spending_per_category)}`;
        document.getElementById("highest-category").textContent = `Highest Spending Category: ${data.highest_spending_category}`;
        document.getElementById("monthly-report").textContent = `Monthly Report: ${JSON.stringify(data.monthly_report)}`;

        // Show analytics data and hide login message
        document.getElementById("login-message").classList.add("hidden");
        document.getElementById("analytics-data").classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching analytics:", error);
        alert("Error fetching analytics data.");
    }
}

// Update login/logout button
function updateLoginButton() {
    const loginButton = document.getElementById("login-button");
    const isLoggedIn = localStorage.getItem("auth_token");

    if (isLoggedIn) {
        loginButton.textContent = "Logout";
        loginButton.replaceWith(loginButton.cloneNode(true)); 
        document.getElementById("login-button").addEventListener("click", handleLogout);
    } else {
        loginButton.textContent = "Login";
        loginButton.replaceWith(loginButton.cloneNode(true));
        document.getElementById("login-button").addEventListener("click", () => {
            location.reload(); 
        });
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("username");
    document.getElementById("welcome-message").textContent = "";
    updateLoginButton();
    location.reload();
    alert("Logged out successfully");
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
    }
};