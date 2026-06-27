const firebaseConfig = {
  apiKey: "AIzaSyCcfJ7lqOA95b1dqlrQETvAAPooifKAy1g",
  authDomain: "mauryaenterprises-84287.firebaseapp.com",
  projectId: "mauryaenterprises-84287",
  storageBucket: "mauryaenterprises-84287.firebasestorage.app",
  messagingSenderId: "763643637248",
  appId: "1:763643637248:web:3cbfe9ea8b68bebc4132e5"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let localProducts = [];
let cart = [];
const WHATSAPP_NUMBER = "9369940723";

document.addEventListener("DOMContentLoaded", () => {
    initializeDOMEvents();
    fetchLiveStoreData();
});

function initializeDOMEvents() {
    document.getElementById("cart-toggle-btn").addEventListener("click", () => toggleCart(true));
    document.getElementById("cart-close-btn").addEventListener("click", () => toggleCart(false));
    document.getElementById("cart-cancel-btn").addEventListener("click", () => toggleCart(false));
    document.getElementById("cart-overlay").addEventListener("click", () => toggleCart(false));
    
    document.getElementById("back-to-categories").addEventListener("click", () => {
        document.getElementById("products-section").classList.add("hidden");
        document.getElementById("shop-categories").classList.remove("hidden");
    });

    document.getElementById("global-search").addEventListener("input", (e) => executeRealtimeSearch(e.target.value.trim()));
    document.getElementById("checkout-form").addEventListener("submit", handleCheckoutProcess);
}

function fetchLiveStoreData() {
    db.collection("products").onSnapshot((snapshot) => {
        localProducts = [];
        snapshot.forEach((doc) => localProducts.push({ id: doc.id, ...doc.data() }));
    });
    
    db.collection("categories").onSnapshot((snapshot) => {
        const container = document.getElementById("category-container");
        if(!container) return; container.innerHTML = "";
        snapshot.forEach((doc) => {
            let cat = doc.data();
            const card = document.createElement("div");
            card.className = "category-card";
            card.innerHTML = `<img src="${cat.image}" onerror="this.src='https://placehold.co/300x200' Exhibition"><h3>${cat.name}</h3>`;
            card.addEventListener("click", () => enterCategoryView(cat.name));
            container.appendChild(card);
        });
    });
}

function enterCategoryView(categoryName) {
    document.getElementById("shop-categories").classList.add("hidden");
    document.getElementById("products-section").classList.remove("hidden");
    document.getElementById("current-view-title").innerText = categoryName;

    db.collection("subcategories").where("parentCategory", "==", categoryName).get().then(snap => {
        const filterBar = document.getElementById("subcategory-filter-bar");
        filterBar.innerHTML = `<button class="filter-pill active" onclick="filterBySubCat('all', '${categoryName}')">All</button>`;
        snap.forEach(doc => {
            let sub = doc.data().name;
            filterBar.innerHTML += `<button class="filter-pill" onclick="filterBySubCat('${sub}', '${categoryName}')">${sub}</button>`;
        });
        let filteredProducts = localProducts.filter(p => (p.category || p.mainCategory || '').toLowerCase() === categoryName.toLowerCase());
        renderProductsGrid(filteredProducts);
    });
}

window.filterBySubCat = function(subCat, mainCat) {
    document.querySelectorAll(".filter-pill").forEach(el => el.classList.remove("active"));
    if(event && event.target) event.target.classList.add("active");
    let products = localProducts.filter(p => (p.category || p.mainCategory || '').toLowerCase() === mainCat.toLowerCase());
    if (subCat !== 'all') { products = products.filter(p => (p.subcategory || p.subCategory) === subCat); }
    renderProductsGrid(products);
};

function renderProductsGrid(products) {
    const container = document.getElementById("products-container"); container.innerHTML = "";
    if(products.length === 0) { container.innerHTML = "<p style='padding:20px; grid-column:1/-1; text-align:center;'>No products found.</p>"; return; }
    
    products.forEach(prod => {
        const pCard = document.createElement("div");
        pCard.className = "product-card";
        const currentStock = Number(prod.stock || 0);
        
        // 🔴 5 या 5 से कम होने पर रेड अलर्ट जेनरेट करना
        let stockAlertHTML = "";
        if(currentStock > 0 && currentStock <= 5) {
            stockAlertHTML = `<span class="stock-alert"><i class="fas fa-exclamation-triangle"></i> Only ${currentStock} ${prod.unit || 'Pcs'} left in stock!</span>`;
        } else if(currentStock <= 0) {
            stockAlertHTML = `<span class="stock-alert" style="color:#6b7280; animation:none;">Out of Stock</span>`;
        }

        pCard.innerHTML = `
            <div>
                <img src="${prod.imageUrl || prod.image || 'https://placehold.co/200'}" alt="${prod.name}">
                <span class="product-badge">${prod.brand || 'Generic'}</span>
                <h4 style="margin-bottom:2px;">${prod.name}</h4>
                ${stockAlertHTML}
            </div>
            <div>
                <p class="product-price">₹${prod.price} <span style="text-decoration:line-through; color:#94a3b8; font-size:12px; margin-left:5px;">₹${prod.mrp || ''}</span></p>
                <div class="qty-selector">
                    <button onclick="adjustLocalQty('${prod.id}', -1)">-</button>
                    <span id="qty-${prod.id}">1</span>
                    <button onclick="adjustLocalQty('${prod.id}', 1)">+</button>
                </div>
                <button class="add-to-cart-btn" ${currentStock <= 0 ? 'disabled style="background:#cbd5e1;"':''} onclick="commitToCart('${prod.id}')">${currentStock <= 0 ? 'Out of Stock':'Add to Cart'}</button>
            </div>
        `;
        container.appendChild(pCard);
    });
}

window.adjustLocalQty = function(id, delta) {
    const el = document.getElementById(`qty-${id}`); if(!el) return;
    let current = parseInt(el.innerText); current = Math.max(1, current + delta);
    el.innerText = current;
};

function toggleCart(open) {
    document.getElementById("cart-panel").classList.toggle("active", open);
    document.getElementById("cart-overlay").classList.toggle("active", open);
}

window.commitToCart = function(prodId) {
    const product = localProducts.find(p => p.id === prodId); if(!product) return;
    const qtySelected = parseInt(document.getElementById(`qty-${prodId}`).innerText);
    const existing = cart.find(item => item.id === prodId);
    if(existing) { existing.qty += qtySelected; } else { cart.push({ ...product, qty: qtySelected }); }
    updateCartUI(); toggleCart(true);
};

function updateCartUI() {
    const container = document.getElementById("cart-items-container"); container.innerHTML = "";
    let totalItems = 0; let totalAmount = 0;
    if(cart.length === 0) { container.innerHTML = "<p class='empty-msg'>Your cart is empty.</p>"; } 
    else {
        cart.forEach((item, index) => {
            totalItems += item.qty; totalAmount += (item.price * item.qty);
            const div = document.createElement("div");
            div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;";
            div.innerHTML = `<div><h5 style='margin:0; font-size:14px;'>${item.name}</h5><p style='margin:0;font-size:12px;color:#64748b;'>[${item.brand || 'Generic'}] ₹${item.price} / ${item.unit || 'Pcs'} x ${item.qty}</p></div>
                             <div><button style='padding:2px 8px; border:1px solid #cbd5e1; background:white; cursor:pointer;' onclick='mutateCartQty(${index}, -1)'>-</button>
                             <button style='padding:2px 8px; border:1px solid #cbd5e1; background:white; cursor:pointer;' onclick='mutateCartQty(${index}, 1)'>+</button></div>`;
            container.appendChild(div);
        });
    }
    document.getElementById("cart-count").innerText = totalItems;
    document.getElementById("total-items").innerText = totalItems;
    document.getElementById("total-amount").innerText = "₹" + totalAmount;
}

window.mutateCartQty = function(index, delta) {
    cart[index].qty += delta; if(cart[index].qty <= 0) { cart.splice(index, 1); }
    updateCartUI();
};

function handleCheckoutProcess(e) {
    e.preventDefault(); if(cart.length === 0) return;
    const name = document.getElementById("cust-name").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();
    
    let text = `*NEW ORDER - MAURYA ENTERPRISES*\n----------------------------------------\n*Customer Details:*\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}\n----------------------------------------\n*Items Ordered:*\n`;
    let amt = 0;
    cart.forEach((item, i) => {
        // व्हाट्सएप पर ब्रांड और प्रॉपर यूनिट के साथ डेटा सेंड करना
        text += `${i+1}. ${item.name} [Brand: ${item.brand || 'N/A'}] (Qty: ${item.qty} ${item.unit || 'Pcs'}) - ₹${item.price * item.qty}\n`;
        amt += (item.price * item.qty);
    });
    text += `----------------------------------------\n*Total Order Amount:* ₹${amt}\n----------------------------------------`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

function executeRealtimeSearch(query) {
    const suggestions = document.getElementById("search-suggestions"); if (!query) { suggestions.innerHTML = ""; return; }
    const matches = localProducts.filter(p => (p.name || '').toLowerCase().includes(query.toLowerCase()) || (p.brand || '').toLowerCase().includes(query.toLowerCase()));
    suggestions.innerHTML = "";
    matches.slice(0, 5).forEach(item => {
        const div = document.createElement("div"); div.className = "suggestion-item"; div.innerText = `${item.name} (${item.brand || 'Generic'})`;
        div.addEventListener("click", () => {
            suggestions.innerHTML = "";
            enterCategoryView(item.category || item.mainCategory);
            renderProductsGrid([item]);
        });
        suggestions.appendChild(div);
    });
}