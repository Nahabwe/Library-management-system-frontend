const token = localStorage.getItem("token");

// Protect the page
if (!token) {
    window.location.href = "login.html";
}


// HTML elements
const returnsTableBody = document.getElementById("returnsTableBody");
const returnMessage = document.getElementById("returnMessage");
const logoutBtn = document.getElementById("logoutBtn");


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


// LOAD CURRENT BORROWINGS
async function loadBorrowings() {
    try {
        returnsTableBody.innerHTML = `
            <tr>
                <td colspan="7">Loading borrowing records...</td>
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
                result.message || "Failed to load borrowing records"
            );
        }

        // Remove old table rows
        returnsTableBody.innerHTML = "";

        // Keep only borrowing records that haven't been returned
        const currentBorrowings = result.borrowings.filter(function (record) {
            return record.returned_at === null;
        });

        // If there are no current borrowings
        if (currentBorrowings.length === 0) {
            returnsTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No books are currently borrowed.
                    </td>
                </tr>
            `;

            return;
        }

        // Create a table row for every borrowing record
        currentBorrowings.forEach(function (record) {

            const row = document.createElement("tr");

            const studentNumberCell = document.createElement("td");
            const studentNameCell = document.createElement("td");
            const bookTitleCell = document.createElement("td");
            const borrowedDateCell = document.createElement("td");
            const dueDateCell = document.createElement("td");
            const statusCell = document.createElement("td");
            const actionCell = document.createElement("td");


            // Student and book information
            studentNumberCell.textContent = record.student_number;
            studentNameCell.textContent = record.full_name;
            bookTitleCell.textContent = record.book_title;

            borrowedDateCell.textContent =
                formatDate(record.borrowed_at);

            dueDateCell.textContent =
                formatDate(record.due_at);


            // Display borrowing status
            statusCell.textContent = record.status;


            // Create Return button
            const returnButton = document.createElement("button");

            returnButton.textContent = "Return Book";
            returnButton.classList.add("return-button");

            returnButton.addEventListener("click", function () {
                returnBook(record.borrowing_id, record.book_title);
            });


            // Add button to action cell
            actionCell.appendChild(returnButton);


            // Add all cells to the row
            row.appendChild(studentNumberCell);
            row.appendChild(studentNameCell);
            row.appendChild(bookTitleCell);
            row.appendChild(borrowedDateCell);
            row.appendChild(dueDateCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);


            // Add row to the table
            returnsTableBody.appendChild(row);

        });

    } catch (error) {
        console.error("Borrowings loading error:", error);

        returnsTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load borrowing records.
                </td>
            </tr>
        `;

        returnMessage.textContent = error.message;
        returnMessage.style.color = "red";
    }
}


// RETURN BOOK
async function returnBook(borrowingId, bookTitle) {

    const confirmed = confirm(
        `Are you sure you want to return "${bookTitle}"?`
    );

    if (!confirmed) {
        return;
    }

    try {
        returnMessage.textContent = "Processing book return...";
        returnMessage.style.color = "black";

        const response = await fetch(
            `http://localhost:3000/api/borrowings/${borrowingId}/return`,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to return book"
            );
        }

        returnMessage.textContent = result.message;
        returnMessage.style.color = "green";

        // Refresh the table after successful return
        await loadBorrowings();

    } catch (error) {
        console.error("Book return error:", error);

        returnMessage.textContent = error.message;
        returnMessage.style.color = "red";
    }
}


// LOAD RECORDS WHEN PAGE OPENS
loadBorrowings();




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
