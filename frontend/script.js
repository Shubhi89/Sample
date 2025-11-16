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

    // --- State variables (from previous step) ---
    let isEditing = false;
    let editExpenseId = null;
    let allExpenses = []; 

    // Redirect if not logged in
    if (document.body.contains(expenseForm) && !token) {
        alert("Please login first!");
        window.location.href = "index.html";
    }

    // --- Helper function to reset the form ---
    function resetForm() {
        expenseForm.reset(); 
        isEditing = false;
        editExpenseId = null;
        
        // --- UPDATED to style new button ---
        const submitBtn = expenseForm.querySelector("button[type='submit']");
        submitBtn.textContent = "Add Expense";
        submitBtn.classList.remove("btn-warning"); // Remove update color
        submitBtn.classList.add("btn-primary");   // Add default color

        const cancelBtn = document.getElementById("cancelEditBtn");
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    // --- Form handles ADD and EDIT ---
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
                url = `http://localhost:5000/api/expense/${editExpenseId}`;
                method = "PUT";
            } else {
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
                resetForm();
                loadExpenses();
            } else {
                alert(data.message || "Failed to submit expense!");
            }
        });
    }

    // --- UPDATED: Load Expenses ---
    async function loadExpenses() {
        const res = await fetch(`http://localhost:5000/api/expense/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        allExpenses = await res.json(); 
        expenseItems.innerHTML = ""; // Clear old items
        
        if (allExpenses.length === 0) {
            expenseItems.innerHTML = "<li class='list-group-item text-center text-muted'>No expenses found.</li>";
            return;
        }

        allExpenses.forEach(exp => {
            const li = document.createElement("li");
            // --- NEW: Create Bootstrap list item ---
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
                <div>
                    <strong class="d-block">${exp.title}</strong>
                    <small class="text-muted">${exp.category} - ₹${exp.amount}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${exp._id}">
                        <i class="fas fa-pencil-alt"></i> </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${exp._id}">
                        <i class="fas fa-trash"></i> </button>
                </div>
            `;
            expenseItems.appendChild(li);
        });
    }

    // --- CRITICAL UPDATE: Click listener ---
    expenseItems.addEventListener("click", async (e) => {
        
        // Use .closest() to find the button, even if the icon (<i>) was clicked
        const editBtn = e.target.closest(".edit-btn");
        const deleteBtn = e.target.closest(".delete-btn");

        // --- DELETE LOGIC ---
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (!confirm("Are you sure you want to delete this expense?")) return; // Added confirm

            const res = await fetch(`http://localhost:5000/api/expense/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Expense deleted!");
                loadExpenses();
            }
        }
        
        // --- EDIT LOGIC ---
        if (editBtn) {
            const id = editBtn.dataset.id;
            const expenseToEdit = allExpenses.find(exp => exp._id === id);
            if (!expenseToEdit) return;

            // 1. Populate form
            document.getElementById("title").value = expenseToEdit.title;
            document.getElementById("amount").value = expenseToEdit.amount;
            document.getElementById("category").value = expenseToEdit.category;

            // 2. Set editing state
            isEditing = true;
            editExpenseId = id;

            // 3. Change button text and color
            const submitBtn = expenseForm.querySelector("button[type='submit']");
            submitBtn.textContent = "Update Expense";
            submitBtn.classList.remove("btn-primary");
            submitBtn.classList.add("btn-warning"); // Yellow for update

            // 4. Add Cancel button
            let cancelBtn = document.getElementById("cancelEditBtn");
            if (!cancelBtn) {
                cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.id = "cancelEditBtn";
                cancelBtn.type = "button";
                // --- NEW: Add Bootstrap classes ---
                cancelBtn.className = "btn btn-secondary w-100 mt-2"; 
                cancelBtn.onclick = resetForm;
                expenseForm.appendChild(cancelBtn);
            }
        }
    });

    // --- Logout (no change) ---
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