const token = localStorage.getItem("token");

// Protect the page
if (!token) {
    window.location.href = "login.html";
}


// HTML elements
const historyTableBody = document.getElementById("historyTableBody");
const historyCount = document.getElementById("historyCount");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const logoutBtn = document.getElementById("logoutBtn");


// Store borrowing records here after fetching them
let borrowingRecords = [];


// LOGOUT
logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// FORMAT DATE
function formatDate(dateValue) {
    if (!dateValue) {
        return "Not returned";
    }

    return new Date(dateValue).toLocaleDateString();
}


// LOAD BORROWING HISTORY
async function loadHistory() {
    try {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7">Loading history...</td>
            </tr>
        `;

        const response = await fetch(
            "http://localhost:3000/api/borrowings/history",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to load borrowing history"
            );
        }

        borrowingRecords = result.borrowings;

        // Display all records initially
        displayHistory(borrowingRecords);

    } catch (error) {
        console.error("History loading error:", error);

        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7">Failed to load borrowing history.</td>
            </tr>
        `;

        historyCount.textContent = error.message;
    }
}


// DISPLAY RECORDS IN THE TABLE
function displayHistory(records) {

    historyTableBody.innerHTML = "";

    historyCount.textContent =
        `${records.length} borrowing record(s) found`;

    if (records.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7">No borrowing records found.</td>
            </tr>
        `;

        return;
    }


    records.forEach(function (record) {

        const row = document.createElement("tr");

        const studentNumberCell = document.createElement("td");
        const studentNameCell = document.createElement("td");
        const bookTitleCell = document.createElement("td");
        const borrowedDateCell = document.createElement("td");
        const dueDateCell = document.createElement("td");
        const returnedDateCell = document.createElement("td");
        const statusCell = document.createElement("td");


        studentNumberCell.textContent = record.student_number;
        studentNameCell.textContent = record.full_name;
        bookTitleCell.textContent = record.book_title;

        borrowedDateCell.textContent =
            formatDate(record.borrowed_at);

        dueDateCell.textContent =
            formatDate(record.due_at);

        returnedDateCell.textContent =
            formatDate(record.returned_at);

        statusCell.textContent = record.status;

        statusCell.classList.add("status");


        // Add cells to the row
        row.appendChild(studentNumberCell);
        row.appendChild(studentNameCell);
        row.appendChild(bookTitleCell);
        row.appendChild(borrowedDateCell);
        row.appendChild(dueDateCell);
        row.appendChild(returnedDateCell);
        row.appendChild(statusCell);


        // Add row to the table
        historyTableBody.appendChild(row);

    });

}


// SEARCH AND FILTER
function filterHistory() {

    const searchText = searchInput.value.toLowerCase().trim();

    const selectedStatus = statusFilter.value;


    // Start with all borrowing records
    let filteredRecords = borrowingRecords;


    // Filter by student or book
    if (searchText !== "") {

        filteredRecords = filteredRecords.filter(function (record) {

            const studentName =
                record.full_name.toLowerCase();

            const studentNumber =
                record.student_number.toLowerCase();

            const bookTitle =
                record.book_title.toLowerCase();

            return studentName.includes(searchText) ||
                   studentNumber.includes(searchText) ||
                   bookTitle.includes(searchText);

        });

    }


    // Filter by borrowing status
    if (selectedStatus !== "all") {

        filteredRecords = filteredRecords.filter(function (record) {

            return record.status === selectedStatus;

        });

    }


    // Display the filtered records
    displayHistory(filteredRecords);

}


// Listen for search input
searchInput.addEventListener("input", filterHistory);


// Listen for status selection
statusFilter.addEventListener("change", filterHistory);


// Load history when page opens
loadHistory();




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
