document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }
    
    const authResponse = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
        alert(authData.message);
        return;
    }
    
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('username', username);
    document.getElementById('welcome-message').textContent = `Hello ${username}`;
    document.getElementById('login-button').textContent = "Logout";
    document.getElementById('login-button').removeEventListener('click', handleLogin);
    document.getElementById('login-button').addEventListener('click', handleLogout);
    alert("Login successful");
});

document.getElementById('expense-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
        alert("Please login first");
        return;
    }
    
    const date = document.getElementById('date').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const paymentMethod = document.getElementById('payment-method').value;
    
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
});

// Handle Logout
function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    
    document.getElementById('welcome-message').textContent = "";
    document.getElementById('login-button').textContent = "Login";
    
    // Remove all event listeners before adding login event
    const loginButton = document.getElementById('login-button');
    loginButton.replaceWith(loginButton.cloneNode(true)); 
    
    document.getElementById('login-button').addEventListener('click', () => {
        location.reload(); // Reload the page to reset the login form properly
    });

    alert("Logged out successfully");
}

// Handle Login Button Click (if needed later)
function handleLogin() {
    document.getElementById('login-form').dispatchEvent(new Event('submit'));
}

// Load stored username on page load
window.onload = function() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('welcome-message').textContent = `Hello ${username}`;
        document.getElementById('login-button').textContent = "Logout";
        document.getElementById('login-button').removeEventListener('click', handleLogin);
        document.getElementById('login-button').addEventListener('click', handleLogout);
    }
};