
const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const message = document.getElementById("message");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    if (email === "" || password === "") {

        message.textContent = "Please enter both email and password.";

        return;
    }

    message.textContent = "Logging in...";

    try {

        const response = await fetch(
            "http://localhost:3000/api/users/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent = data.message || "Login failed.";

            return;
        }
if(!data.token){
    message.textContent="Login response did not contain a token"
    return
}
localStorage.setItem("token",data.token)
localStorage.setItem("user",JSON.stringify(data.user))
        message.textContent = "Login successful!";

        window.location.href="dashboard.html"

    } catch (error) {

        message.textContent = "Cannot connect to the server.";

        console.log(error);

    }

});
