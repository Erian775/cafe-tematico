/* =============================================
   El Banquito – Script Principal
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. NAVBAR: Hamburger Toggle ──────────────────────
    const navToggle = document.getElementById('nav-toggle');
    const navbarNav = document.getElementById('navbar-nav');

    if (navToggle && navbarNav) {
        navToggle.addEventListener('click', () => {
            navbarNav.classList.toggle('open');
        });

        // Close menu when a link is clicked
        navbarNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbarNav.classList.remove('open');
            });
        });
    }

    // ─── 2. DYNAMIC GREETING (index.html) ────────────────
    const greetingEl = document.getElementById('dynamic-welcome');
    if (greetingEl) {
        const hour = new Date().getHours();
        let greeting;
        if (hour >= 5 && hour < 12)       greeting = '¡Buenos días,\nbienvenido a';
        else if (hour >= 12 && hour < 19) greeting = '¡Buenas tardes,\nbienvenido a';
        else                               greeting = '¡Buenas noches,\nbienvenido a';

        // Keep the span for animated brand name
        greetingEl.innerHTML = `${greeting.replace('\n','<br>')} <span>El Banquito!</span>`;
    }

    // ─── 3. SCROLL FADE-UP ANIMATIONS ───────────────────
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        fadeEls.forEach(el => observer.observe(el));
    }

    // ─── 4. MENU CART (menu.html) ────────────────────────
    const addBtns = document.querySelectorAll('.add-to-cart-btn');
    if (addBtns.length > 0) {
        initCart();
    }

    // ─── 5. CONTACT FORM (contacto.html) ─────────────────
    // handled by global function handleContactForm()

    // ─── 6. BILLING PAGE (facturacion.html) ──────────────
    const billingLayout = document.getElementById('billing-layout');
    if (billingLayout) {
        loadOrderFromStorage();
    }

});

/* ============================================================
   CART SYSTEM
   ============================================================ */

let cart = [];

function initCart() {
    // Load existing cart from localStorage if present
    const saved = localStorage.getItem('elbanquito_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }

    renderCart();

    // Attach "Add to cart" button listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name  = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            addToCart(name, price);
            animateBtn(btn);
        });
    });
}

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    saveCart();
    renderCart();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('elbanquito_cart', JSON.stringify(cart));
}

function renderCart() {
    const cartItems  = document.getElementById('cart-items');
    const cartEmpty  = document.getElementById('cart-empty');
    const cartCount  = document.getElementById('cart-count');
    const cartTotal  = document.getElementById('cart-total');
    const checkoutBtn= document.getElementById('checkout-btn');

    if (!cartItems) return;

    cartItems.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        totalItems += item.qty;
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span class="cart-item-name" title="${item.name}">${item.name}</span>
            <div class="cart-qty-controls">
                <button class="qty-btn" onclick="changeQty(${index}, -1)" aria-label="Disminuir cantidad">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)" aria-label="Aumentar cantidad">+</button>
            </div>
            <span class="cart-item-price">RD$${itemTotal.toFixed(2)}</span>
            <button class="cart-remove" onclick="removeFromCart(${index})" aria-label="Eliminar ${item.name}">✕</button>
        `;
        cartItems.appendChild(div);
    });

    // Toggle empty state
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
    }

    // Update badges
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = `RD$${total.toFixed(2)}`;

    // Enable/disable checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
        checkoutBtn.style.cursor  = cart.length === 0 ? 'not-allowed' : 'pointer';
    }
}

// Redirect to billing page, saving cart to localStorage
function goToCheckout() {
    if (cart.length === 0) return;
    saveCart();
    window.location.href = 'facturacion.html';
}

// Visual feedback on "+" button
function animateBtn(btn) {
    btn.textContent = '✓';
    btn.style.background = 'var(--accent)';
    setTimeout(() => {
        btn.textContent = '+';
        btn.style.background = '';
    }, 700);
}

/* ============================================================
   BILLING / INVOICE PAGE
   ============================================================ */

function loadOrderFromStorage() {
    const saved = localStorage.getItem('elbanquito_cart');
    const billingLayout = document.getElementById('billing-layout');
    const emptyNotice   = document.getElementById('empty-cart-notice');

    if (!saved || JSON.parse(saved).length === 0) {
        // No cart – show empty notice
        if (billingLayout) billingLayout.style.display = 'none';
        if (emptyNotice)   emptyNotice.style.display = 'block';
        return;
    }

    const cartData = JSON.parse(saved);
    const summaryContainer = document.getElementById('order-summary-items');
    const orderTotalEl     = document.getElementById('order-total');

    if (!summaryContainer) return;

    let total = 0;
    summaryContainer.innerHTML = '';

    cartData.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const row = document.createElement('div');
        row.className = 'order-summary-item';
        row.innerHTML = `
            <div>
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-qty">Cantidad: ${item.qty}</div>
            </div>
            <span class="order-item-price">RD$${itemTotal.toFixed(2)}</span>
        `;
        summaryContainer.appendChild(row);
    });

    if (orderTotalEl) orderTotalEl.textContent = `RD$${total.toFixed(2)}`;
}

function confirmOrder(event) {
    event.preventDefault();

    const name     = document.getElementById('bill-name').value.trim();
    const phone    = document.getElementById('bill-phone').value.trim();
    const notes    = document.getElementById('bill-notes').value.trim();
    const payMethod= document.querySelector('input[name="payment"]:checked')?.value || 'Efectivo';

    const saved = localStorage.getItem('elbanquito_cart');
    if (!saved) return;
    const cartData = JSON.parse(saved);

    // Generate invoice number and date
    const invNum  = Math.floor(100000 + Math.random() * 900000);
    const invDate = new Date().toLocaleString('es-DO', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Build invoice items
    let total = 0;
    let itemsHTML = '';
    cartData.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        itemsHTML += `
            <div class="invoice-row">
                <span>${item.name} × ${item.qty}</span>
                <strong>RD$${itemTotal.toFixed(2)}</strong>
            </div>
        `;
    });

    // Populate invoice
    document.getElementById('inv-num').textContent  = invNum;
    document.getElementById('inv-date').textContent = invDate;
    document.getElementById('invoice-items').innerHTML = itemsHTML;
    document.getElementById('inv-total').textContent = `RD$${total.toFixed(2)}`;
    document.getElementById('invoice-customer-info').innerHTML = `
        <strong>Cliente:</strong> ${name} &nbsp;|&nbsp;
        <strong>Tel:</strong> ${phone} &nbsp;|&nbsp;
        <strong>Pago:</strong> ${payMethod}
        ${notes ? `<br><strong>Nota:</strong> ${notes}` : ''}
    `;

    // Show invoice, hide placeholder
    document.getElementById('invoice-placeholder').style.display = 'none';
    const invoiceCard = document.getElementById('invoice-card');
    invoiceCard.classList.add('visible');
    invoiceCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Clear cart from localStorage
    localStorage.removeItem('elbanquito_cart');

    // Disable form to prevent double submit
    document.getElementById('billing-form').querySelectorAll('input, textarea, button, select').forEach(el => {
        el.disabled = true;
    });
}

function printInvoice() {
    window.print();
}

/* ============================================================
   CONTACT FORM
   ============================================================ */

function handleContactForm(event) {
    event.preventDefault();
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('contact-success');
    if (form)    form.style.display = 'none';
    if (success) success.style.display = 'block';
}
