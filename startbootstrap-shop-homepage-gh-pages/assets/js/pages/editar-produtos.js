// assets/js/pages/editar-produtos.js
import { listarProdutos } from "../api/produtoApi.js";
import { getToken, logoutUser, isLoggedIn } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";

function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

let gruposCache = []; 
const tabelaBody = document.querySelector("#tabela-produtos tbody");

async function carregarGrupos() {
  try {
    const res = await fetchAuth(`${API_BASE}/grupoproduto`);
    if (!res.ok) throw new Error(await res.text());
    const grupos = await res.json();
    gruposCache = grupos; 
    let select = document.getElementById("produto-grupo");
    if (!select) {
     
      const descricaoField = document.getElementById("produto-descricao");
      select = document.createElement("select");
      select.id = "produto-grupo";
      select.className = "form-select mb-3";
      select.required = true;
      select.innerHTML = `<option value="">Selecione Grupo...</option>`;
      
      if (descricaoField && descricaoField.parentElement) {
        descricaoField.parentElement.parentElement.insertBefore(select, descricaoField.parentElement);
      } else {
        const form = document.getElementById("form-produto");
        if (form) form.prepend(select);
      }
    } else {
     
      select.innerHTML = `<option value="">Selecione Grupo...</option>`;
    }

    grupos.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.descricao;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Erro ao carregar grupos:", err);
  
    const mensagem = document.getElementById("mensagem-produtos");
    if (mensagem) {
      mensagem.textContent = "Erro ao carregar grupos (ver console).";
      mensagem.style.color = "red";
    }
  }
}

export async function carregarProdutos() {
  tabelaBody.innerHTML = `<tr><td colspan="6" class="text-center">Carregando produtos...</td></tr>`;
  try {
    const produtos = await listarProdutos();
    if (!Array.isArray(produtos) || produtos.length === 0) {
      tabelaBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum produto encontrado</td></tr>`;
      return;
    }

    tabelaBody.innerHTML = "";
    produtos.forEach(p => {
      const tr = document.createElement("tr");
      const precoText = typeof p.preco === "number" ? p.preco.toFixed(2) : p.preco;
      const descricaoGrupo = p.descricao || (p.grupoProduto ? String(p.grupoProduto) : "—");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nome}</td>
        <td>R$ ${precoText}</td>
        <td>${p.qtdEstoque ?? "—"}</td>
        <td>${descricaoGrupo}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-id="${p.id}">Editar</button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${p.id}">Excluir</button>
        </td>
      `;
      tabelaBody.appendChild(tr);
    });


    tabelaBody.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => abrirModalEdicao(Number(btn.dataset.id)));
    });
    tabelaBody.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => excluirProduto(Number(btn.dataset.id)));
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    tabelaBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar (veja console)</td></tr>`;
  }
}


function abrirModalNovo() {
  limparFormulario();
  const modalTitle = document.getElementById("produtoModalLabel");
  modalTitle.textContent = "Novo Produto";
  showModal();
}

async function abrirModalEdicao(id) {
  try {
    const res = await fetchAuth(`${API_BASE}/produto/${id}`);
    if (!res.ok) throw new Error(await res.text());
    const produto = await res.json();

    document.getElementById("produto-id").value = produto.id ?? "";
    document.getElementById("produto-nome").value = produto.nome ?? "";
    document.getElementById("produto-descricao").value = produto.descricao ?? "";
    document.getElementById("produto-preco").value = produto.preco ?? "";
    document.getElementById("produto-estoque").value = produto.qtdEstoque ?? 0;
    document.getElementById("produto-imagem").value = produto.imagem || produto.imagemUrl || "";

    
    document.getElementById("produto-imagem").dataset.original = produto.imagem || produto.imagemUrl || "";

    
    const select = document.getElementById("produto-grupo");
    if (select) {
      if (produto.grupoProduto) {
        select.value = produto.grupoProduto;
      } else if (produto.descricao) {
        const g = gruposCache.find(x => x.descricao === produto.descricao);
        if (g) select.value = g.id;
      }
    }

    document.getElementById("produtoModalLabel").textContent = `Editar Produto #${produto.id}`;
    showModal();
  } catch (err) {
    console.error("Erro ao carregar produto:", err);
    alert("Erro ao carregar dados do produto. Veja console.");
  }
}

function showModal() {
  const modalEl = document.getElementById("produtoModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function hideModal() {
  const modalEl = document.getElementById("produtoModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}

function limparFormulario() {
  document.getElementById("produto-id").value = "";
  document.getElementById("produto-nome").value = "";
  document.getElementById("produto-descricao").value = "";
  document.getElementById("produto-preco").value = "";
  document.getElementById("produto-estoque").value = "";
  document.getElementById("produto-imagem").value = "";
  const select = document.getElementById("produto-grupo");
  if (select) select.value = "";
}


async function salvarProduto() {
  const id = document.getElementById("produto-id").value || null;
  const nome = document.getElementById("produto-nome").value.trim();
  const descricao = document.getElementById("produto-descricao").value.trim();
  const preco = parseFloat(document.getElementById("produto-preco").value);
  const qtdEstoque = parseInt(document.getElementById("produto-estoque").value, 10) || 0;


  const imagemField = document.getElementById("produto-imagem").value.trim();
  const imagem = imagemField || document.getElementById("produto-imagem").dataset.original || "assets/pages/pastas-fotos/default.jpg";

  const select = document.getElementById("produto-grupo");
  const grupoId = select ? parseInt(select.value, 10) : null;
  const grupoObj = gruposCache.find(g => g.id === grupoId);

  
  if (!nome) { alert("Nome obrigatório"); return; }
  if (!preco && preco !== 0) { alert("Preço inválido"); return; }
  if (!grupoObj) { alert("Selecione um Grupo de Produto válido"); return; }

  const produtoDTO = {
    id: id ? Number(id) : null,
    nome,
    preco,
    qtdEstoque,
    grupoProduto: grupoId,
    descricao: grupoObj.descricao,
    imagem 
  };

  try {
    let res;
    if (id) {
      res = await fetchAuth(`${API_BASE}/produto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produtoDTO)
      });
    } else {
      res = await fetchAuth(`${API_BASE}/produto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produtoDTO)
      });
    }

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Erro HTTP ${res.status}`);
    }

    hideModal();
    await carregarProdutos();
    alert(id ? "Produto atualizado." : "Produto criado.");
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    alert("Erro ao salvar produto: " + (err.message || "ver console"));
  }
}


async function excluirProduto(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  try {
    const res = await fetchAuth(`${API_BASE}/produto/${id}`, { method: "DELETE" });

    // 🔥 Tratamento específico para ERRO 403 (produto em pedido ativo)
    if (res.status === 403) {
      alert("❌ Este produto está em um pedido ativo e não pode ser excluído.");
      return;
    }

    // Outros erros
    if (!res.ok) {
      const txt = await res.text();
      alert("Erro ao excluir produto: " + txt);
      return;
    }

    await carregarProdutos();
    alert("Produto removido com sucesso!");

  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    alert("Erro ao excluir produto (ver console).");
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    alert("Faça login para acessar o painel.");
    window.location.href = "login.html";
    return;
  }

  const btnAdd = document.getElementById("btn-add");
  if (btnAdd) {
    btnAdd.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalNovo();
    });
  }

  await carregarGrupos();

  const btnSalvar = document.getElementById("btn-salvar");
  if (btnSalvar) btnSalvar.addEventListener("click", salvarProduto);

  await carregarProdutos();
});
