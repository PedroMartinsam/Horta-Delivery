import { getToken, isLoggedIn, getClienteId, getUsername } from "../utils/auth.js";
import { criarPedido } from "../api/pedidoApi.js";
import { criarVenda } from "../api/vendaApi.js";

const CART_KEY = "carrinho";

export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(idProduto, nome, preco, imagemUrl) {
  const cart = getCart();
  const index = cart.findIndex(p => p.idProduto === idProduto);

  if (index >= 0) {
    cart[index].quantidade += 1;
  } else {
    cart.push({ idProduto, nome, preco, imagemUrl, quantidade: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert(`${nome} adicionado ao carrinho!`);
  renderCart();
}

export function removeFromCart(idProduto) {
  let cart = getCart();
  cart = cart.filter(p => p.idProduto !== idProduto);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

export function updateQuantity(idProduto, quantidade) {
  const cart = getCart();
  const item = cart.find(p => p.idProduto === idProduto);
  if (item) {
    item.quantidade = Number(quantidade);
    if (item.quantidade <= 0) removeFromCart(idProduto);
    else saveCart(cart);
  }
  renderCart();
  updateCartCount();
}

export function getTotal() {
  return getCart().reduce((acc, p) => acc + p.preco * p.quantidade, 0);
}

export function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center py-5">Seu carrinho está vazio!</p>`;
    document.getElementById("cart-total").innerText = "R$ 0,00";
    return;
  }

  container.innerHTML = cart.map(p => `
    <div class="cart-item d-flex justify-content-between align-items-center mb-3">
      <img src="${p.imagemUrl}" width="60">
      <span>${p.nome}</span>
      <input type="number" value="${p.quantidade}" min="1" onchange="updateQuantity('${p.idProduto}', this.value)">
      <span>R$ ${(p.preco * p.quantidade).toFixed(2).replace('.', ',')}</span>
      <button class="btn btn-sm btn-danger" onclick="removeFromCart('${p.idProduto}')">Remover</button>
    </div>
  `).join("");

  document.getElementById("cart-total").innerText = "R$ " + getTotal().toFixed(2).replace('.', ',');
}

export function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    const totalItems = getCart().reduce((acc, p) => acc + p.quantidade, 0);
    countEl.innerText = totalItems;
  }
}

export async function checkout() {
  if (!isLoggedIn()) {
    alert("Faça login para finalizar a compra!");
    window.location.href = "login.html";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  try {
    const clienteId = getClienteId();
    if (!clienteId) {
      alert("ID do cliente não encontrado! Faça login novamente.");
      logoutUser();
      return;
    }

    
    const pedidoDTO = {
      cliente: Number(clienteId),
      formaPagamento: document.getElementById("formaPagamento").value.toUpperCase(),
      data: new Date().toISOString().split("T")[0],

      enderecoEntrega: document.getElementById("enderecoEntrega").value,
      bairroEntrega: document.getElementById("bairroEntrega").value,
      cidadeEntrega: document.getElementById("cidadeEntrega").value,
      cepEntrega: document.getElementById("cepEntrega").value,
      referenciaEntrega: document.getElementById("referenciaEntrega").value,
      nomeRecebedor: document.getElementById("nomeRecebedor").value,
      telefoneContato: document.getElementById("telefoneContato").value
    };

    console.log("ENVIANDO PEDIDO DTO:", pedidoDTO);

    const pedido = await criarPedido(pedidoDTO);

    
    for (const item of cart) {
      await criarVenda({
        clienteId: Number(clienteId),
        produtoId: item.idProduto,
        quantidade: item.quantidade,
        pedidoId: pedido.id
      });
    }

    alert("Pedido finalizado com sucesso!");
    localStorage.removeItem("carrinho");
    renderCart();
    updateCartCount();

  } catch (err) {
    console.error("Erro ao finalizar pedido:", err);
    alert("Erro ao finalizar pedido: " + (err.message || "Erro desconhecido"));
  }
}



document.addEventListener("DOMContentLoaded", () => {
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.updateQuantity = updateQuantity;
  window.checkout = checkout;
  window.renderCart = renderCart;
  renderCart();
  updateCartCount();
});
