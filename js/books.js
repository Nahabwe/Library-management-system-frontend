
const token = localStorage.getItem("token");

// Protect the page
if (!token) {
    window.location.href = "login.html";
}

// HTML elements
const booksTableBody = document.getElementById("booksTableBody");
const bookCount = document.getElementById("bookCount");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

const bookForm = document.getElementById("bookForm");
const bookMessage = document.getElementById("bookMessage");
const formTitle = document.getElementById("formTitle");
const saveBookBtn = document.getElementById("saveBookBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Remember which book is being edited
let editingBookId = null;


// LOGOUT
logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});


// LOAD BOOKS
async function loadBooks(search = "") {
    try {
        booksTableBody.textContent = "Loading books...";

        let url = "http://localhost:3000/api/books";

        if (search) {
            url += `/search?q=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load books");
        }

        const result = await response.json();

        booksTableBody.textContent = "";
        bookCount.textContent = `${result.count} books found`;

        if (result.books.length === 0) {
            booksTableBody.innerHTML =
                '<tr><td colspan="7">No books found.</td></tr>';
            return;
        }

        result.books.forEach(function (book) {
            const row = document.createElement("tr");

            const titleCell = document.createElement("td");
            const authorCell = document.createElement("td");
            const categoryCell = document.createElement("td");
            const isbnCell = document.createElement("td");
            const totalCopiesCell = document.createElement("td");
            const availableCopiesCell = document.createElement("td");
            const actionsCell = document.createElement("td");

            titleCell.textContent = book.title;
            authorCell.textContent = book.author;
            categoryCell.textContent = book.category;
            isbnCell.textContent = book.isbn;
            totalCopiesCell.textContent = book.total_copies;
            availableCopiesCell.textContent = book.available_copies;

            // EDIT BUTTON
            const editButton = document.createElement("button");

            editButton.textContent = "Edit";
            editButton.classList.add("action-button", "edit-button");

            editButton.addEventListener("click", function () {
                editBook(book);
            });

            // DELETE BUTTON
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.classList.add("action-button", "delete-button");

            deleteButton.addEventListener("click", function () {
                deleteBook(book.id);
            });

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

            row.appendChild(titleCell);
            row.appendChild(authorCell);
            row.appendChild(categoryCell);
            row.appendChild(isbnCell);
            row.appendChild(totalCopiesCell);
            row.appendChild(availableCopiesCell);
            row.appendChild(actionsCell);

            booksTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Books error:", error);

        booksTableBody.innerHTML =
            '<tr><td colspan="7">Failed to load books.</td></tr>';

        bookCount.textContent = "Unable to retrieve books";
    }
}


// ADD OR UPDATE BOOK
bookForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const bookData = {
        title: document.getElementById("bookTitle").value.trim(),
        author: document.getElementById("bookAuthor").value.trim(),
        category: document.getElementById("bookCategory").value.trim(),
        isbn: document.getElementById("bookISBN").value.trim(),
        edition: document.getElementById("bookEdition").value.trim() || null,
        shelf_location: document.getElementById("bookShelf").value.trim() || null,
        total_copies: Number(document.getElementById("bookCopies").value),
        is_lendable: document.getElementById("bookLendable").checked
    };

    const isEditing = editingBookId !== null;

    const url = isEditing
        ? `http://localhost:3000/api/books/${editingBookId}`
        : "http://localhost:3000/api/books";

    const method = isEditing ? "PUT" : "POST";

    try {
        bookMessage.textContent = "Saving book...";

        const response = await fetch(url, {
            method: method,

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(bookData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to save book");
        }

        bookMessage.textContent = result.message;
        bookMessage.style.color = "green";

        resetBookForm();

        loadBooks(searchInput.value.trim());

    } catch (error) {
        console.error("Book save error:", error);

        bookMessage.textContent = error.message;
        bookMessage.style.color = "red";
    }
});


// EDIT BOOK
function editBook(book) {
    editingBookId = book.id;

    document.getElementById("bookTitle").value = book.title;
    document.getElementById("bookAuthor").value = book.author;
    document.getElementById("bookCategory").value = book.category;
    document.getElementById("bookISBN").value = book.isbn;
    document.getElementById("bookEdition").value = book.edition || "";
    document.getElementById("bookShelf").value = book.shelf_location || "";
    document.getElementById("bookCopies").value = book.total_copies;
    document.getElementById("bookLendable").checked = book.is_lendable;

    formTitle.textContent = "Edit Book";
    saveBookBtn.textContent = "Update Book";
    cancelEditBtn.hidden = false;

    bookMessage.textContent = `Editing: ${book.title}`;

    // Scroll back to the form
    bookForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// DELETE BOOK
async function deleteBook(bookId) {
    const confirmed = confirm(
        "Are you sure you want to delete this book?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/books/${bookId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete book");
        }

        alert(result.message);

        loadBooks(searchInput.value.trim());

    } catch (error) {
        console.error("Delete book error:", error);
        alert(error.message);
    }
}


// RESET FORM
function resetBookForm() {
    bookForm.reset();

    editingBookId = null;

    formTitle.textContent = "Add New Book";
    saveBookBtn.textContent = "Add Book";
    cancelEditBtn.hidden = true;

    document.getElementById("bookLendable").checked = true;
}


// CANCEL EDITING
cancelEditBtn.addEventListener("click", function () {
    resetBookForm();

    bookMessage.textContent = "";
});


// SEARCH BOOKS
searchInput.addEventListener("input", function () {
    loadBooks(searchInput.value.trim());
});


// LOAD BOOKS WHEN PAGE OPENS
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
