import { getToken, getClienteId, logoutUser, isLoggedIn } from "../utils/auth.js";

const API_BASE = "http://localhost:8080";

async function fetchAuth(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { ...options, headers };
  return fetch(url, opts);
}

async function getPedidos() {
  if (!isLoggedIn()) {
    alert("Faça login para ver seus pedidos!");
    window.location.href = "login.html";
    return;
  }

  const clienteId = getClienteId();
  try {
    const response = await fetchAuth(`${API_BASE}/pedido`);
    if (!response.ok) throw new Error(await response.text());
    const pedidos = await response.json();

    // Filtra apenas pedidos do cliente logado
    const meusPedidos = pedidos.filter(p => p.cliente === Number(clienteId));
    renderPedidos(meusPedidos);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar pedidos: " + err.message);
  }
}

async function atualizarStatusPedido(id, acao) {
  try {
    const response = await fetchAuth(`${API_BASE}/pedido/${id}/${acao}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(await response.text());

    const pedidoAtualizado = await response.json();
    alert(`✅ Pedido #${pedidoAtualizado.id} agora está como ${pedidoAtualizado.statusPedido}`);

    getPedidos();
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar status do pedido: " + err.message);
  }
}

function renderPedidos(pedidos) {
  const container = document.getElementById("pedidos-list");
  if (!container) return;

  if (pedidos.length === 0) {
    container.innerHTML = "<p>Você ainda não realizou nenhum pedido.</p>";
    return;
  }

  container.innerHTML = pedidos.map(p => `
    <div class="card mb-3">
      <div class="card-header">
        Pedido #${p.id} - <strong>${p.statusPedido}</strong>
      </div>
      <div class="card-body">
        <p><strong>Data:</strong> ${p.data}</p>
        <p><strong>Forma de pagamento:</strong> ${p.formaPagamento}</p>
        <p><strong>Valor total:</strong> R$ ${p.valorTotal.toFixed(2).replace('.', ',')}</p>

        <h5 class="mt-3">Informações de Entrega:</h5>
        <p><strong>Endereço:</strong> ${p.enderecoEntrega || "—"}</p>
        <p><strong>Bairro:</strong> ${p.bairroEntrega || "—"}</p>
        <p><strong>Cidade:</strong> ${p.cidadeEntrega || "—"}</p>
        <p><strong>CEP:</strong> ${p.cepEntrega || "—"}</p>
        <p><strong>Referência:</strong> ${p.referenciaEntrega || "—"}</p>
        <p><strong>Recebedor:</strong> ${p.nomeRecebedor || "—"}</p>
        <p><strong>Telefone:</strong> ${p.telefoneContato || "—"}</p>

        <h5 class="mt-3">Produtos:</h5>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${p.vendas.map(v => `
              <tr>
                <td>${v.nomeProduto}</td>
                <td>${v.quantidade}</td>
                <td>R$ ${v.subTotal.toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Botões para mudar status -->
        <button class="btn btn-sm btn-warning btn-status" onclick="atualizarStatusPedido(${p.id}, 'preparar')">Preparar</button>
        <button class="btn btn-sm btn-success btn-status" onclick="atualizarStatusPedido(${p.id}, 'entregar')">Entregar</button>
        <button class="btn btn-sm btn-danger btn-status" onclick="atualizarStatusPedido(${p.id}, 'cancelar')">Cancelar</button>

        <button class="btn btn-sm btn-outline-danger btn-status" onclick="deletarPedido(${p.id})">
  Excluir Pedido
</button>
      </div>
    </div>
  `).join('');
}

async function deletarPedido(id) {
  if (!confirm("Tem certeza que deseja excluir o pedido #" + id + "?")) {
    return;
  }

  try {
    const response = await fetchAuth(`${API_BASE}/pedido/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error(await response.text());

    alert("Pedido excluído com sucesso!");
    getPedidos();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir: " + err.message);
  }
}



window.verDetalhes = async function (pedidoId) {
  try {
    const response = await fetchAuth(`${API_BASE}/pedido/${pedidoId}`);
    if (!response.ok) throw new Error(await response.text());
    const pedido = await response.json();

    alert(`Pedido #${pedido.id}\nStatus: ${pedido.statusPedido}\nValor: R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}`);
  } catch (err) {
    console.error(err);
    alert("Erro ao buscar detalhes do pedido: " + err.message);
  }
};

window.atualizarStatusPedido = atualizarStatusPedido;
window.deletarPedido = deletarPedido;


document.addEventListener("DOMContentLoaded", getPedidos);
