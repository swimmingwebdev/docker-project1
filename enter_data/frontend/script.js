document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-button").addEventListener("click", handleLogin);
});

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert("Please enter both username and password.", "error");
        return;
    }
    
    try {
        const authResponse = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const authData = await authResponse.json();

        if (!authResponse.ok) {
            showAlert(authData.message || "Login failed.", "error");
            return;
        }

        // Store token & username
        localStorage.setItem('auth_token', authData.token);
        localStorage.setItem('username', username);

        const verifyResponse = await fetch("http://localhost:5000/auth/verify", {
            method: "GET",
            headers: { "Authorization": `Bearer ${authData.token}` },
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyResponse.ok) {
            showAlert(verifyData.message || "Token verification failed.", "error");
            return;
        }

        document.getElementById('welcome-message').textContent = `Hello ${username}`;
        updateLoginButton();
        showAlert("Login successful", "success");

    } catch (error) {
        console.error("Login error:", error);
        showAlert("Login failed. Try again later.", "error");
    }
};

document.getElementById('expense-form')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
        showAlert("Please login first.", "error");
        return;
    }
    
    const date = document.getElementById('date').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const paymentMethod = document.getElementById('payment-method').value;
    
    try {
        const expenseResponse = await fetch('http://localhost:5001/expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ date, amount, category, payment_method: paymentMethod })
        });
        
        const expenseData = await expenseResponse.json();
        document.getElementById('message').textContent = expenseData.message;
        showAlert("Expense submitted successfully", "success");
    } catch (error) {
        console.error("Expense submission error:", error);
        showAlert("Error submitting expense.", "error");
    }
});

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

// Handle Logout
function handleLogout() {
    localStorage.clear(); 
    
    document.getElementById("welcome-message").textContent = "";
    updateLoginButton();

    showAlert("Logged out successfully", "success");

    setTimeout(() => {
        location.reload();
    }, 500);
}


// Load stored username on page load
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