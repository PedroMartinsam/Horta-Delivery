/*!
* Start Bootstrap - Shop Homepage v5.0.6 (https://startbootstrap.com/template/shop-homepage)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-shop-homepage/blob/master/LICENSE)
*/

// Cart functionality
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('hortaDeliveryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartCount();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('hortaDeliveryCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(name, price, image) {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showAddToCartMessage(name);
}

// Remove item from cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

// Update item quantity
function updateQuantity(name, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(name);
        return;
    }
    
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }
}

// Update cart count in navbar
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
    });
}

// Show add to cart message
function showAddToCartMessage(productName) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="bi-check-circle me-2"></i>
            <strong>${productName}</strong> foi adicionado ao carrinho!
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Open cart page
function openCart() {
    window.location.href = 'cart.html';
}

// Calculate cart totals
function calculateTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 5.00 : 0;
    const total = subtotal + deliveryFee;
    
    return {
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total
    };
}

// Update cart display (for cart.html page)
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartDiv = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return; // Not on cart page
    
    if (cart.length === 0) {
        emptyCartDiv.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        emptyCartDiv.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = false;
        
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="row align-items-center border-bottom py-3">
                <div class="col-md-2">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="max-height: 80px;">
                </div>
                <div class="col-md-4">
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="text-muted mb-0">Produto fresco e orgânico</p>
                </div>
                <div class="col-md-2">
                    <span class="text-success fw-bold">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="col-md-2">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateQuantity('${item.name}', ${item.quantity - 1})">
                            <i class="bi-dash"></i>
                        </button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" 
                               onchange="updateQuantity('${item.name}', parseInt(this.value))" min="1">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateQuantity('${item.name}', ${item.quantity + 1})">
                            <i class="bi-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-1">
                    <span class="fw-bold">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item.name}')" 
                            title="Remover item">
                        <i class="bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    const totals = calculateTotals();
    const subtotalElement = document.getElementById('cart-subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${totals.subtotal.toFixed(2).replace('.', ',')}`;
    }
    if (deliveryFeeElement) {
        deliveryFeeElement.textContent = totals.deliveryFee > 0 ? `R$ ${totals.deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis';
    }
    if (totalElement) {
        totalElement.textContent = `R$ ${totals.total.toFixed(2).replace('.', ',')}`;
    }
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const totals = calculateTotals();
    const itemsList = cart.map(item => `${item.quantity}x ${item.name}`).join('\n');
    
    const message = `Olá! Gostaria de fazer um pedido:\n\n${itemsList}\n\nSubtotal: R$ ${totals.subtotal.toFixed(2).replace('.', ',')}\nTaxa de entrega: R$ ${totals.deliveryFee.toFixed(2).replace('.', ',')}\nTotal: R$ ${totals.total.toFixed(2).replace('.', ',')}\n\nObrigado!`;
    
    const whatsappUrl = `https://wa.me/5517991326851?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    // If on cart page, update display
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }
});

// Add custom CSS for toast notifications
const style = document.createElement('style');
style.textContent = `
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
    }
    
    .header-personalizado {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
    }
    
    .card-img-top {
        height: 200px;
        object-fit: cover;
    }
    
    @media (max-width: 768px) {
        .toast-notification {
            right: 10px;
            left: 10px;
        }
        
        .toast-notification .alert {
            min-width: auto;
        }
    }
`;
document.head.appendChild(style);

