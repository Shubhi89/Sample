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
    
    let isEditing = false;
    let editExpenseId = null;
    let allExpenses = []; 

    // Redirect if not logged in
    if (document.body.contains(document.querySelector('.dashboard-container')) && !token) {
        alert("Please login first!");
        window.location.href = "index.html";
    }

    function resetForm() {
        expenseForm.reset(); 
        isEditing = false;
        editExpenseId = null;
        expenseForm.querySelector("button[type='submit']").textContent = "Add Expense";

        // Remove the cancel button if it exists
        const cancelBtn = document.getElementById("cancelEditBtn");
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    // Add Expense
    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("title").value;
            const amount = document.getElementById("amount").value;
            const category = document.getElementById("category").value;

            const expenseData = { title, amount, category };
            let url = "";
            let method = "";

            if (isEditing) {
                // --- UPDATE LOGIC ---
                url = `http://localhost:5000/api/expense/${editExpenseId}`;
                method = "PUT";
            } else {
                // --- ADD LOGIC (from our fix) ---
                url = "http://localhost:5000/api/expense/add";
                method = "POST";
            }
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(expenseData)
            });
            
            const data = await res.json();
            if (res.ok) {
                alert(isEditing ? "Expense updated!" : "Expense added!");
                resetForm(); // Use new reset function
                loadExpenses();
            } else {
                alert(data.message || "Failed to submit expense!");
            }
        });
    }

    // Load Expenses
    async function loadExpenses() {
        const res = await fetch(`http://localhost:5000/api/expense/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        allExpenses = await res.json(); // <-- Store expenses
        expenseItems.innerHTML = "";
        
        allExpenses.forEach(exp => {
            const li = document.createElement("li");
            // --- Add Edit Button ---
            li.innerHTML = `
                <span>${exp.title} - ₹${exp.amount} (${exp.category})</span>
                <div>
                    <button class="edit-btn" data-id="${exp._id}">Edit</button>
                    <button class="delete-btn" data-id="${exp._id}">X</button>
                </div>
            `;
            expenseItems.appendChild(li);
        });
    }

    // --- UPDATED: Click listener now handles DELETE and EDIT ---
    expenseItems.addEventListener("click", async (e) => {
        // DELETE LOGIC (no change)
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
        
        // --- NEW: EDIT LOGIC ---
        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.dataset.id;
            // Find the expense from our stored array
            const expenseToEdit = allExpenses.find(exp => exp._id === id);
            if (!expenseToEdit) return;

            // 1. Populate the form
            document.getElementById("title").value = expenseToEdit.title;
            document.getElementById("amount").value = expenseToEdit.amount;
            document.getElementById("category").value = expenseToEdit.category;

            // 2. Set editing state
            isEditing = true;
            editExpenseId = id;

            // 3. Change button text
            expenseForm.querySelector("button[type='submit']").textContent = "Update Expense";

            // 4. Add a Cancel button
            let cancelBtn = document.getElementById("cancelEditBtn");
            if (!cancelBtn) {
                cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.id = "cancelEditBtn";
                cancelBtn.type = "button"; // Prevents form submission
                cancelBtn.onclick = resetForm; // Calls our reset function
                expenseForm.appendChild(cancelBtn);
            }
        }
    });

    // Logout (no change)
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            alert("Logged out successfully!");
            window.location.href = "index.html";
        });
    }

    // Load data on start (no change)
    if (expenseItems) loadExpenses();
});
