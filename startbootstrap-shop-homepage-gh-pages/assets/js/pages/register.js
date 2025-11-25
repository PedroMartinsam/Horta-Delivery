import { createCliente } from "../utils/userApi.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  console.log("Form encontrado:", form);

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cliente = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      cpf: document.getElementById("cpf").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      tipoUsuario: "CLIENTE"
    };
    console.log("Cliente a enviar:", cliente);

    try {
      await createCliente(cliente);
      alert("Conta criada com sucesso!");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
      alert("Erro ao criar conta: " + err.message);
    }
  });
});
