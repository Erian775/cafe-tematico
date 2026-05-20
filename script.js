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
   CONTACT FORM
   ============================================================ */

function handleContactForm(event) {
    event.preventDefault();
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('contact-success');
    if (form)    form.style.display = 'none';
    if (success) success.style.display = 'block';
}
