const token = localStorage.getItem("token");

// Protect the page
if (!token) {
    window.location.href = "login.html";
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

});

// HTML elements
const studentsTableBody = document.getElementById("studentsTableBody");
const studentCount = document.getElementById("studentCount");
const searchInput = document.getElementById("searchInput");

const studentForm = document.getElementById("studentForm");
const studentMessage = document.getElementById("studentMessage");
const formTitle = document.getElementById("formTitle");
const saveStudentBtn = document.getElementById("saveStudentBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editingStudentId = null;


// Load students from backend
async function loadStudents(search = "") {

    try {

        studentsTableBody.textContent = "Loading students...";

        let url = "http://localhost:3000/api/students";

        if (search) {
            url += `/search?q=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();

        studentsTableBody.textContent = "";

        studentCount.textContent = `${result.count} students found`;

        if (result.students.length === 0) {

            studentsTableBody.innerHTML =
                '<tr><td colspan="7">No students found.</td></tr>';

            return;
        }

        result.students.forEach(function (student) {

            const row = document.createElement("tr");

            const numberCell = document.createElement("td");
            const nameCell = document.createElement("td");
            const departmentCell = document.createElement("td");
            const yearCell = document.createElement("td");
            const emailCell = document.createElement("td");
            const statusCell = document.createElement("td");
            const actionsCell = document.createElement("td");

            numberCell.textContent = student.student_number;
            nameCell.textContent = student.full_name;
            departmentCell.textContent = student.department;
            yearCell.textContent = student.year_of_study;
            emailCell.textContent = student.email;

            // Status badge
            const badge = document.createElement("span");
            badge.textContent = student.status;
            badge.classList.add("status");

            if (student.status === "active") {
                badge.classList.add("active-status");
            } else {
                badge.classList.add("other-status");
            }

            statusCell.appendChild(badge);

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.classList.add("action-button", "edit-button");
            editButton.addEventListener("click", function () {
                editStudent(student);
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("action-button", "delete-button");
            deleteButton.addEventListener("click", function () {
                deleteStudent(student.id);
            });

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

            row.appendChild(numberCell);
            row.appendChild(nameCell);
            row.appendChild(departmentCell);
            row.appendChild(yearCell);
            row.appendChild(emailCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);

            studentsTableBody.appendChild(row);
        });

    } catch (error) {

        console.error("Students error:", error);

        studentsTableBody.innerHTML =
            '<tr><td colspan="7">Failed to load students.</td></tr>';

        studentCount.textContent = "Unable to retrieve students";
    }
}


// Load students when page opens
loadStudents();


// Search students
searchInput.addEventListener("input", function () {
    loadStudents(searchInput.value.trim());
});


// Edit a student
function editStudent(student) {

    editingStudentId = student.id;

    document.getElementById("studentNumber").value = student.student_number;
    document.getElementById("fullName").value = student.full_name;
    document.getElementById("department").value = student.department;
    document.getElementById("yearOfStudy").value = student.year_of_study;
    document.getElementById("email").value = student.email;
    document.getElementById("phone").value = student.phone || "";

    // Change labels
    formTitle.textContent = "Edit Student";
    saveStudentBtn.textContent = "Update Student";
    cancelEditBtn.hidden = false;

    studentMessage.textContent = `Editing ${student.full_name}`;
    studentMessage.style.color = "#1e293b";

    studentForm.scrollIntoView({ behavior: "smooth", block: "start" });
}


// Cancel editing
cancelEditBtn.addEventListener("click", function () {
    resetStudentForm();
    studentMessage.textContent = "";
});


// Reset form
function resetStudentForm() {
    studentForm.reset();
    editingStudentId = null;

    formTitle.textContent = "Register New Student";
    saveStudentBtn.textContent = "Register Student";
    cancelEditBtn.hidden = true;
}


// Delete a student
async function deleteStudent(studentId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/students/${studentId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete student");
        }

        alert(result.message);

        loadStudents(searchInput.value.trim());

    } catch (error) {
        console.error("Delete error:", error);
        alert(error.message);
    }
}


// Save (create or update) student
studentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const studentData = {
        student_number: document.getElementById("studentNumber").value.trim(),
        full_name: document.getElementById("fullName").value.trim(),
        department: document.getElementById("department").value.trim(),
        year_of_study: Number(document.getElementById("yearOfStudy").value),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    try {
        studentMessage.textContent = "Saving student...";
        studentMessage.style.color = "#1e293b";

        const isEditing = editingStudentId !== null;

        const url = isEditing
            ? `http://localhost:3000/api/students/${editingStudentId}`
            : "http://localhost:3000/api/students";

        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to save student");
        }

        studentMessage.textContent = result.message;
        studentMessage.style.color = "green";

        resetStudentForm();

        loadStudents(searchInput.value.trim());

    } catch (error) {
        console.error("Student save error:", error);

        studentMessage.textContent = error.message;
        studentMessage.style.color = "red";
    }
});



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

