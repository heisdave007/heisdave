const form = document.getElementById("loginForm");
const message = document.getElementById("message");

// get input elements so we can read their values
const email = document.getElementById("email");
const password = document.getElementById("password");

console.log("Login script loaded");
console.log("Form:", form);
console.log("Message element:", message);

if (!form) {
  console.error("ERROR: loginForm not found in HTML");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted with email:", email.value);

    try {
      console.log("Sending login request...");
      const res = await axios.post(
        "http://localhost:4000/api/v1/users/login",
        {
          email: email.value,
          password: password.value
        }
      );

      console.log("Login response:", res.data);
      
      // save JWT
      localStorage.setItem("token", res.data.token);

      message.style.color = "#0a8f3f";
      message.textContent = "Login successful!";

      setTimeout(() => {
        // redirect to home page after successful login
        console.log("Redirecting to home.html...");
        message.textContent = "Redirecting..."  
        window.location.href = 'home.html';
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Login failed";

      console.log("Displaying error:", serverMessage);
      message.style.color = '#b00020';
      message.textContent = serverMessage;
    }
  });
}