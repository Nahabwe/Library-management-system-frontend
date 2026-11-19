const token = localStorage.getItem("token");

// Protect the page
if (!token) {
    window.location.href = "login.html";
}


// HTML elements
const studentSelect = document.getElementById("studentSelect");
const bookSelect = document.getElementById("bookSelect");

const borrowForm = document.getElementById("borrowForm");
const borrowMessage = document.getElementById("borrowMessage");
const borrowBtn = document.getElementById("borrowBtn");

const logoutBtn = document.getElementById("logoutBtn");


// LOGOUT
logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// LOAD STUDENTS
async function loadStudents() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/students",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const result = await response.json();

        studentSelect.innerHTML =
            '<option value="">Choose a student</option>';

        // Only show active students
        const activeStudents = result.students.filter(function (student) {
            return student.status === "active";
        });

        activeStudents.forEach(function (student) {
            const option = document.createElement("option");

            option.value = student.id;

            option.textContent =
                `${student.student_number} - ${student.full_name}`;

            studentSelect.appendChild(option);
        });

        if (activeStudents.length === 0) {
            studentSelect.innerHTML =
                '<option value="">No active students available</option>';
        }

    } catch (error) {
        console.error("Students loading error:", error);

        studentSelect.innerHTML =
            '<option value="">Failed to load students</option>';
    }
}


// LOAD BOOKS
async function loadBooks() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/books",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load books");
        }

        const result = await response.json();

        bookSelect.innerHTML =
            '<option value="">Choose a book</option>';

        // Only show lendable books with available copies
        const availableBooks = result.books.filter(function (book) {
            return book.is_lendable === true &&
                   book.available_copies > 0;
        });

        availableBooks.forEach(function (book) {
            const option = document.createElement("option");

            option.value = book.id;

            option.textContent =
                `${book.title} (${book.available_copies} available)`;

            bookSelect.appendChild(option);
        });

        if (availableBooks.length === 0) {
            bookSelect.innerHTML =
                '<option value="">No borrowable books available</option>';
        }

    } catch (error) {
        console.error("Books loading error:", error);

        bookSelect.innerHTML =
            '<option value="">Failed to load books</option>';
    }
}


// BORROW BOOK
borrowForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const studentId = studentSelect.value;
    const bookId = bookSelect.value;

    if (!studentId || !bookId) {
        borrowMessage.textContent =
            "Please select both a student and a book.";

        borrowMessage.style.color = "red";

        return;
    }

    const borrowingData = {
        student_id: Number(studentId),
        book_id: Number(bookId)
    };

    try {
        borrowBtn.disabled = true;
        borrowBtn.textContent = "Processing...";

        borrowMessage.textContent = "Registering borrowing...";
        borrowMessage.style.color = "black";

        const response = await fetch(
            "http://localhost:3000/api/borrowings",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(borrowingData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to borrow book"
            );
        }

        borrowMessage.textContent =
            `${result.message} Student: ${result.student}. Book: ${result.book}.`;

        borrowMessage.style.color = "green";

        borrowForm.reset();

        // Reload books because one copy has been borrowed
        await loadBooks();

    } catch (error) {
        console.error("Borrowing error:", error);

        borrowMessage.textContent = error.message;
        borrowMessage.style.color = "red";

    } finally {
        borrowBtn.disabled = false;
        borrowBtn.textContent = "Borrow Book";
    }
});


// LOAD DATA WHEN PAGE OPENS
loadStudents();
loadBooks();




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
