// REGISTER USER
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    // Register
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const res = await fetch("http://localhost:5000/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            alert(data.message || "Registration successful!");
            if (res.ok) window.location.href = "index.html";
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const res = await fetch("http://localhost:5000/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user._id);
                alert("Login successful!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Login failed!");
            }
        });
    }
});
// DASHBOARD FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseItems = document.getElementById("expenseItems");
    const logoutBtn = document.getElementById("logoutBtn");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // Redirect if not logged in
    if (document.body.contains(document.querySelector('.dashboard-container')) && !token) {
        alert("Please login first!");
        window.location.href = "index.html";
    }

    // Add Expense
    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("title").value;
            const amount = document.getElementById("amount").value;
            const category = document.getElementById("category").value;

            const res = await fetch("http://localhost:5000/api/expense/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId, title, amount, category })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Expense added!");
                expenseForm.reset();
                loadExpenses();
            } else {
                alert(data.message || "Failed to add expense!");
            }
        });
    }

    // Load Expenses
    async function loadExpenses() {
        const res = await fetch(`http://localhost:5000/api/expense/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        expenseItems.innerHTML = "";
        data.forEach(exp => {
            const li = document.createElement("li");
            li.innerHTML = `
        ${exp.title} - ₹${exp.amount} (${exp.category})
        <button class="delete-btn" data-id="${exp._id}">X</button>
      `;
            expenseItems.appendChild(li);
        });
    }

    // Delete Expense
    expenseItems.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
            const res = await fetch(`http://localhost:5000/api/expense/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Expense deleted!");
                loadExpenses();
            }
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            alert("Logged out successfully!");
            window.location.href = "index.html";
        });
    }

    // Load data on start
    if (expenseItems) loadExpenses();
});


