
const token = localStorage.getItem("token");

// Protect the page from users who are not logged in
if (!token) {
    window.location.href = "login.html";
}


// HTML elements
const staffForm = document.getElementById("staffForm");

const staffName = document.getElementById("staffName");
const staffEmail = document.getElementById("staffEmail");
const staffPassword = document.getElementById("staffPassword");
const staffRole = document.getElementById("staffRole");

const staffMessage = document.getElementById("staffMessage");
const staffCount = document.getElementById("staffCount");
const staffTableBody = document.getElementById("staffTableBody");

const createStaffBtn = document.getElementById("createStaffBtn");
const logoutBtn = document.getElementById("logoutBtn");


// API address
const API_URL = "http://localhost:3000/api/users";


// Get currently logged-in user from localStorage
let currentUser = null;

try {
    currentUser = JSON.parse(localStorage.getItem("user"));
} catch (error) {
    console.error("Could not read logged-in user:", error);
}


// LOGOUT
logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// FORMAT DATE
function formatDate(dateValue) {
    if (!dateValue) {
        return "N/A";
    }

    return new Date(dateValue).toLocaleDateString();
}


// LOAD STAFF ACCOUNTS
async function loadStaff() {
    try {
        staffTableBody.innerHTML = `
            <tr>
                <td colspan="6">Loading staff accounts...</td>
            </tr>
        `;

        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to load staff accounts"
            );
        }

        staffTableBody.innerHTML = "";

        staffCount.textContent =
            `${result.count} staff account(s)`;

        if (result.users.length === 0) {
            staffTableBody.innerHTML = `
                <tr>
                    <td colspan="6">No staff accounts found.</td>
                </tr>
            `;

            return;
        }

        result.users.forEach(function (staff) {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            const emailCell = document.createElement("td");
            const roleCell = document.createElement("td");
            const statusCell = document.createElement("td");
            const createdCell = document.createElement("td");
            const actionsCell = document.createElement("td");


            nameCell.textContent = staff.full_name;
            emailCell.textContent = staff.email;

            // Display role in a more readable way
            roleCell.textContent =
                staff.role === "admin" ? "Admin" : "Librarian";

            statusCell.textContent =
                staff.is_active ? "Active" : "Inactive";

            createdCell.textContent =
                formatDate(staff.created_at);


            // Create activate/deactivate button
            const actionButton = document.createElement("button");

            actionButton.classList.add("action-button");


            // Check if this staff account belongs to the logged-in user
            const isCurrentUser =
                currentUser && Number(currentUser.id) === Number(staff.id);


            if (staff.is_active) {

                actionButton.textContent = "Deactivate";
                actionButton.classList.add("deactivate-button");

                // Prevent self-deactivation from the frontend
                if (isCurrentUser) {
                    actionButton.disabled = true;
                    actionButton.title =
                        "You cannot deactivate your own account";
                } else {
                    actionButton.addEventListener("click", function () {
                        changeStaffStatus(staff.id, "deactivate");
                    });
                }

            } else {

                actionButton.textContent = "Activate";
                actionButton.classList.add("activate-button");

                actionButton.addEventListener("click", function () {
                    changeStaffStatus(staff.id, "activate");
                });

            }


            actionsCell.appendChild(actionButton);

            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(roleCell);
            row.appendChild(statusCell);
            row.appendChild(createdCell);
            row.appendChild(actionsCell);

            staffTableBody.appendChild(row);

        });

    } catch (error) {
        console.error("Staff loading error:", error);

        staffTableBody.innerHTML = `
            <tr>
                <td colspan="6">Failed to load staff accounts.</td>
            </tr>
        `;

        staffCount.textContent = error.message;
    }
}


// CREATE STAFF ACCOUNT
staffForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const staffData = {
        full_name: staffName.value.trim(),
        email: staffEmail.value.trim(),
        password: staffPassword.value,
        role: staffRole.value
    };


    try {
        createStaffBtn.disabled = true;
        createStaffBtn.textContent = "Creating account...";

        staffMessage.textContent = "Creating staff account...";
        staffMessage.style.color = "black";


        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(staffData)
        });


        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to create staff account"
            );
        }


        staffMessage.textContent = result.message;
        staffMessage.style.color = "green";

        staffForm.reset();

        // Refresh staff table to show the new account
        await loadStaff();


    } catch (error) {
        console.error("Staff creation error:", error);

        staffMessage.textContent = error.message;
        staffMessage.style.color = "red";

    } finally {
        createStaffBtn.disabled = false;
        createStaffBtn.textContent = "Create Staff Account";
    }

});


// ACTIVATE OR DEACTIVATE STAFF ACCOUNT
async function changeStaffStatus(staffId, action) {

    const actionText =
        action === "deactivate" ? "deactivate" : "activate";

    const confirmed = confirm(
        `Are you sure you want to ${actionText} this staff account?`
    );

    if (!confirmed) {
        return;
    }


    try {
        staffMessage.textContent =
            `Processing ${actionText} request...`;

        staffMessage.style.color = "black";


        const response = await fetch(
            `${API_URL}/${staffId}/${action}`,
            {
                method: "PATCH",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || `Failed to ${actionText} account`
            );
        }


        staffMessage.textContent = result.message;
        staffMessage.style.color = "green";


        // Reload the staff list after the change
        await loadStaff();


    } catch (error) {
        console.error("Staff status error:", error);

        staffMessage.textContent = error.message;
        staffMessage.style.color = "red";
    }

}


// LOAD STAFF WHEN PAGE OPENS
loadStaff();




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

        document.getElementById("loggedInUser").textContent =
            firstName;

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

