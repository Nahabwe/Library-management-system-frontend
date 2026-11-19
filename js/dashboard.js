/* =================================
   AUTH / PROTECTION
================================= */

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

/* =================================
   DASHBOARD STATISTICS
================================= */

async function loadDashboard() {
    try {
        const response = await fetch("http://localhost:3000/api/dashboard", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load dashboard (${response.status})`);
        }

        const result = await response.json();

        // Safely fall back to an empty object if statistics is missing
        const stats = result.statistics || {};

        document.getElementById("totalStudents").textContent =
            stats.total_students ?? 0;

        document.getElementById("totalBooks").textContent =
            stats.total_titles ?? 0;

        document.getElementById("availableCopies").textContent =
            stats.available_copies ?? 0;

        document.getElementById("currentlyBorrowed").textContent =
            stats.currently_borrowed ?? 0;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

/* =================================
   RECENT BORROWINGS
================================= */

async function loadRecentBorrowings() {
    const tableBody = document.getElementById("recentBorrowingsBody");

    try {
        const response = await fetch(
            "http://localhost:3000/api/borrowings/history",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to retrieve borrowings (${response.status})`);
        }

        const result = await response.json();

        // Support either result.borrowings or a plain array
        const borrowings = Array.isArray(result)
            ? result
            : (result.borrowings || []);

        // Clear the loading message
        tableBody.textContent = "";

        if (borrowings.length === 0) {
            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            emptyCell.colSpan = 5;
            emptyCell.textContent = "No borrowing records found.";
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }

        borrowings.forEach(function (borrowing) {

            const row = document.createElement("tr");

            const studentCell = document.createElement("td");
            const bookCell = document.createElement("td");
            const borrowedCell = document.createElement("td");
            const dueCell = document.createElement("td");
            const statusCell = document.createElement("td");

            studentCell.textContent = borrowing.full_name || "-";
            bookCell.textContent = borrowing.book_title || "-";

            borrowedCell.textContent = borrowing.borrowed_at
                ? new Date(borrowing.borrowed_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                  })
                : "-";

            dueCell.textContent = borrowing.due_at
                ? new Date(borrowing.due_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                  })
                : "-";

            // Safe status badge class
            const statusText = String(borrowing.status || "unknown").trim();
            const statusClass = statusText.toLowerCase().replace(/\s+/g, "-");

            const badge = document.createElement("span");
            badge.textContent = statusText;
            badge.classList.add("status-badge", statusClass);

            statusCell.appendChild(badge);

            row.appendChild(studentCell);
            row.appendChild(bookCell);
            row.appendChild(borrowedCell);
            row.appendChild(dueCell);
            row.appendChild(statusCell);

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Borrowings error:", error);
        tableBody.textContent = "Failed to load borrowing records.";
    }
}

/* =================================
   LOGGED-IN USER PROFILE
================================= */

const storedUser = localStorage.getItem("user");

if (storedUser) {
    try {
        const user = JSON.parse(storedUser);

        const fullName =
            user.full_name ||
            user.name ||
            user.username ||
            user.email ||
            "Library User";

        const firstName = fullName.split(" ")[0];

        document.getElementById("loggedInUser").textContent = firstName;
        document.getElementById("userAvatar").textContent =
            firstName.charAt(0).toUpperCase();
        document.getElementById("userRole").textContent =
            user.role || "Library Staff";

    } catch (error) {
        console.error("Failed to load user information:", error);
    }
} else {
    document.getElementById("loggedInUser").textContent = "Guest";
    document.getElementById("userAvatar").textContent = "G";
}

/* =================================
   LOGOUT FUNCTIONALITY (single instance)
================================= */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

/* =================================
   INITIALISE
================================= */

loadDashboard();
loadRecentBorrowings();