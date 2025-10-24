import { loginUser } from "../utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await loginUser(email, password);
        alert("Login realizado com sucesso!");
        window.location.href = "index.html";
      } catch (err) {
        alert("Erro no login: " + err.message);
      }
    });
  }
});
