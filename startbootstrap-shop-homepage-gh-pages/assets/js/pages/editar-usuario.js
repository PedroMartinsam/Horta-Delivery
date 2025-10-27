import { getClientes, createCliente, atualizarCliente, deletarCliente } from "../api/clienteApi.js";
import { isLoggedIn, logoutUser } from "../utils/auth.js";

let usuarioModal, modalInstance;
let senhaAtual = ""; 


async function carregarUsuarios() {
  if (!isLoggedIn()) {
    alert("Faça login para acessar essa página!");
    window.location.href = "login.html";
    return;
  }

  try {
    const usuarios = await getClientes();
    const tbody = document.querySelector("#tabela-usuarios tbody");
    tbody.innerHTML = "";

    usuarios.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.firstName}</td>
        <td>${u.lastName}</td>
        <td>${u.email}</td>
        <td>${u.cpf}</td>
        <td>${u.tipoUsuario}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editar(${u.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="remover(${u.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    alert("Erro ao carregar usuários: " + err.message);
  }
}


function abrirModal(usuario = null) {
  document.getElementById("usuario-id").value = usuario?.id || "";
  document.getElementById("usuario-firstName").value = usuario?.firstName || "";
  document.getElementById("usuario-lastName").value = usuario?.lastName || "";
  document.getElementById("usuario-email").value = usuario?.email || "";
  document.getElementById("usuario-cpf").value = usuario?.cpf || "";
  document.getElementById("usuario-tipo").value = usuario?.tipoUsuario || "";
  document.getElementById("usuario-password").value = ""; // campo vazio
  document.getElementById("usuarioModalLabel").textContent = usuario ? `Editar Usuário #${usuario.id}` : "Novo Usuário";

  senhaAtual = usuario?.password || ""; 
  modalInstance.show();
}


window.criarUsuario = function() {
  abrirModal();
};


async function salvarUsuario() {
  const id = document.getElementById("usuario-id").value;
  const firstName = document.getElementById("usuario-firstName").value.trim();
  const lastName = document.getElementById("usuario-lastName").value.trim();
  const email = document.getElementById("usuario-email").value.trim();
  const cpf = document.getElementById("usuario-cpf").value.trim();
  const tipoUsuario = document.getElementById("usuario-tipo").value;
  let password = document.getElementById("usuario-password").value.trim();

  if (!firstName || !lastName || !email || !cpf || !tipoUsuario) {
    return alert("Preencha todos os campos obrigatórios!");
  }

  
  if (!password) password = senhaAtual;

  const payload = { firstName, lastName, email, cpf, tipoUsuario, password };

  try {
    if (id) {
      await atualizarCliente(id, payload);
      alert("Usuário atualizado com sucesso!");
    } else {
      await createCliente(payload);
      alert("Usuário criado com sucesso!");
    }
    modalInstance.hide();
    carregarUsuarios();
  } catch (err) {
    console.error("Erro ao salvar usuário:", err);
    alert("Erro ao salvar usuário: " + err.message);
  }
}

window.editar = async function(id) {
  const usuarios = await getClientes();
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return alert("Usuário não encontrado");
  abrirModal(usuario);
};


window.remover = async function(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
  try {
    await deletarCliente(id);
    alert("Usuário removido com sucesso!");
    carregarUsuarios();
  } catch (err) {
    console.error("Erro ao remover usuário:", err);
    alert("Erro ao remover usuário: " + err.message);
  }
};


document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    alert("Faça login para acessar essa página!");
    window.location.href = "login.html";
    return;
  }

  usuarioModal = document.getElementById("usuarioModal");
  modalInstance = new bootstrap.Modal(usuarioModal);

  document.getElementById("btn-salvar-usuario").addEventListener("click", salvarUsuario);

  carregarUsuarios();
  window.logoutUser = logoutUser;
});
