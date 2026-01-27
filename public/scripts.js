const form = document.getElementById("registerForm");
  const message = document.getElementById("message");

  // get input elements so we can read their values
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/users/register",
        {
          name: name.value,
          email: email.value,
          password: password.value,
          confirmPassword: confirmPassword.value
        }
      );

      message.style.color = "#0a8f3f";
      message.textContent = res.data.message || "Registration successful! Please check your email to verify.";
      
      // Store email in localStorage for verification page
      localStorage.setItem('verificationEmail', email.value);
      
      // redirect to email verification page after successful registration
      setTimeout(() => {
        message.textContent = "Redirecting to verification page..."
        window.location.href = 'verify-email.html';
      }, 1500);
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Registration failed";

      message.style.color = '#b00020';
      message.textContent = serverMessage;
    }
  });



// toggle password functionality for register page
const toggles = document.querySelectorAll('.toggle-password');
toggles.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  });
});