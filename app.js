// Maurya Enterprises - Fully Integrated Firebase Production Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcfJ7lqOA95b1dqlrQETvAAPooifKAy1g",
  authDomain: "mauryaenterprises-84287.firebaseapp.com",
  projectId: "mauryaenterprises-84287",
  storageBucket: "mauryaenterprises-84287.firebasestorage.app",
  messagingSenderId: "9369940723",
  appId: "1:763643637248:web:3cbfe9ea8b68bebc4132e5",
  measurementId: "G-EK8B6BRLC3"
};

// Initialize Firebase Production Engine
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Application State Engineering
let localProducts = [];
let cart = [];
const WHATSAPP_NUMBER = "9369940723"; // 

// Static Native Category Configuration (For Navigation Structure)
const defaultCategories = [
    { name: "Appliances", img: "https://placehold.co/300x200?text=Appliances" },
    { name: "Electricals", img: "https://placehold.co/300x200?text=Electricals" },
    { name: "Power & Hand Tools", img: "https://placehold.co/300x200?text=Power+Tools" },
    { name: "Plywood & Laminates", img: "https://placehold.co/300x200?text=Plywood" },
    { name: "Hardware", img: "https://placehold.co/300x200?text=Hardware" },
    { name: "Paints", img: "https://placehold.co/300x200?text=Paints" },
    { name: "Lighting & Fans", img: "https://placehold.co/300x200?text=Lighting" },
    { name: "Bathroom", img: "https://placehold.co/300x200?text=Bathroom" },
    { name: "Plumbing", img: "https://placehold.co/300x200?text=Plumbing" },
    { name: "Kitchen", img: "https://placehold.co/300x200?text=Kitchen" },
    { name: "Construction Materials", img: "https://placehold.co/300x200?text=Construction" }
];

// Document Lifecycle Activation
document.addEventListener("DOMContentLoaded", () => {
    initializeDOMEvents();
    fetchProductsFromFirebase();
});

function initializeDOMEvents() {
    // Cart Slide Engine
    document.getElementById("cart-toggle-btn").addEventListener("click", () => toggleCart(true));
    document.getElementById("cart-close-btn").addEventListener("click", () => toggleCart(false));
    document.getElementById("cart-overlay").addEventListener("click", () => toggleCart(false));
    
    // UI Navigation Navigation back home
    document.getElementById("back-to-categories").addEventListener("click", () => {
        document.getElementById("products-section").classList.add("hidden");
        document.getElementById("shop-categories").classList.remove("hidden");
    });

    // Real-time Contextual Search Module Engine
    const searchBar = document.getElementById("global-search");
    searchBar.addEventListener("input", (e) => executeRealtimeSearch(e.target.value.trim()));

    // Submit Checkout Trigger Architecture
    document.getElementById("checkout-form").addEventListener("submit", handleCheckoutProcess);
}

// Data Pipeline Core - Syncing Data from Cloud Firestore
function fetchProductsFromFirebase() {
    db.collection("products").onSnapshot((snapshot) => {
        localProducts = [];
        snapshot.forEach((doc) => {
            localProducts.push({ id: doc.id, ...doc.data() });
        });
        renderCategories();
    }, (error) => {
        console.error("Firebase fetch error:", error);
        renderCategories(); 
    });
}

function renderCategories() {
    const container = document.getElementById("category-container");
    container.innerHTML = "";
    
    defaultCategories.forEach(cat => {
        const card = document.createElement("div");
        card.className = "category-card";
        card.innerHTML = `
            <img src="${cat.img}" alt="${cat.name}">
            <h3>${cat.name}</h3>
        `;
        card.addEventListener("click", () => enterCategoryView(cat.name));
        container.appendChild(card);
    });
}

function enterCategoryView(categoryName) {
    document.getElementById("shop-categories").classList.add("hidden");
    document.getElementById("products-section").classList.remove("hidden");
    document.getElementById("current-view-title").innerText = categoryName;

    const filteredProducts = localProducts.filter(p => p.mainCategory && p.mainCategory.toLowerCase() === categoryName.toLowerCase());
    const subCats = [...new Set(filteredProducts.map(p => p.subCategory))];

    renderSubcategoryFilters(subCats, categoryName);
    renderProductsGrid(filteredProducts);
}

function renderSubcategoryFilters(subCats, mainCat) {
    const filterBar = document.getElementById("subcategory-filter-bar");
    filterBar.innerHTML = `<button class="filter-pill active" onclick="filterBySubCat('all', '${mainCat}')">All</button>`;
    
    subCats.forEach(sub => {
        if(sub) {
            filterBar.innerHTML += `<button class="filter-pill" onclick="filterBySubCat('${sub}', '${mainCat}')">${sub}</button>`;
        }
    });
}

window.filterBySubCat = function(subCat, mainCat) {
    document.querySelectorAll(".filter-pill").forEach(el => el.classList.remove("active"));
    if(event) event.target.classList.add("active");

    let products = localProducts.filter(p => p.mainCategory && p.mainCategory.toLowerCase() === mainCat.toLowerCase());
    if (subCat !== 'all') {
        products = products.filter(p => p.subCategory === subCat);
    }
    renderProductsGrid(products);
};

function renderProductsGrid(products) {
    const container = document.getElementById("products-container");
    container.innerHTML = "";

    if(products.length === 0) {
        container.innerHTML = "<p class='no-products' style='padding:20px; color:gray;'>No products found live in this category. Add some in your Firebase 'products' collection!</p>";
        return;
    }

    products.forEach(prod => {
        const pCard = document.createElement("div");
        pCard.className = "product-card";
        pCard.innerHTML = `
            <div>
                <img src="${prod.image || 'https://placehold.co/200?text=Hardware'}" alt="${prod.name}">
                <span class="product-badge">${prod.mainCategory || ''} > ${prod.subCategory || ''}</span>
                <h4>${prod.name}</h4>
            </div>
            <div>
                <p class="product-price">₹${prod.price}</p>
                <div class="qty-selector">
                    <button onclick="adjustLocalQty('${prod.id}', -1)">-</button>
                    <span id="qty-${prod.id}">1</span>
                    <button onclick="adjustLocalQty('${prod.id}', 1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="commitToCart('${prod.id}')">Add to Cart</button>
            </div>
        `;
        container.appendChild(pCard);
    });
}

window.adjustLocalQty = function(id, delta) {
    const el = document.getElementById(`qty-${id}`);
    let current = parseInt(el.innerText);
    current = Math.max(1, current + delta);
    el.innerText = current;
};

function executeRealtimeSearch(query) {
    const suggestions = document.getElementById("search-suggestions");
    if (!query) {
        suggestions.innerHTML = "";
        return;
    }

    const matches = localProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
        (p.mainCategory && p.mainCategory.toLowerCase().includes(query.toLowerCase())) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(query.toLowerCase()))
    );

    suggestions.innerHTML = "";
    const distinctMatches = matches.slice(0, 6);

    distinctMatches.forEach(item => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = `${item.name} (${item.mainCategory})`;
        div.addEventListener("click", () => {
            suggestions.innerHTML = "";
            enterCategoryView(item.mainCategory);
            renderProductsGrid([item]);
        });
        suggestions.appendChild(div);
    });
}

function toggleCart(open) {
    document.getElementById("cart-panel").classList.toggle("active", open);
    document.getElementById("cart-overlay").classList.toggle("active", open);
}

window.commitToCart = function(prodId) {
    const product = localProducts.find(p => p.id === prodId);
    const qtySelected = parseInt(document.getElementById(`qty-${prodId}`).innerText);

    const existing = cart.find(item => item.id === prodId);
    if(existing) {
        existing.qty += qtySelected;
    } else {
        cart.push({ ...product, qty: qtySelected });
    }
    updateCartUI();
    toggleCart(true);
};

function updateCartUI() {
    const container = document.getElementById("cart-items-container");
    container.innerHTML = "";

    let totalItems = 0;
    let totalAmount = 0;

    if(cart.length === 0) {
        container.innerHTML = "<p class='empty-msg'>Your cart is empty.</p>";
    } else {
        cart.forEach((item, index) => {
            totalItems += item.qty;
            totalAmount += (item.price * item.qty);

            const div = document.createElement("div");
            div.className = "cart-item-row";
            div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;";
            div.innerHTML = `
                <div>
                    <h5 style='font-size:0.95rem;'>${item.name}</h5>
                    <p style='font-size:0.85rem; color:gray;'>₹${item.price} x ${item.qty}</p>
                </div>
                <div>
                    <button onclick="mutateCartQty(${index}, -1)" style='padding:2px 6px;'>-</button>
                    <button onclick="mutateCartQty(${index}, 1)" style='padding:2px 6px; margin-right:8px;'>+</button>
                    <button onclick="removeFromCart(${index})" style='color:red; background:none; border:none; cursor:pointer;'><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    document.getElementById("cart-count").innerText = totalItems;
    document.getElementById("total-items").innerText = totalItems;
    document.getElementById("total-amount").innerText = "₹" + totalAmount;
}

window.mutateCartQty = function(index, delta) {
    cart[index].qty += delta;
    if(cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

function handleCheckoutProcess(e) {
    e.preventDefault();
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const address = document.getElementById("cust-address").value;

    let productLines = "";
    let totalItems = 0;
    let totalAmount = 0;

    cart.forEach((item, i) => {
        productLines += `${i + 1}. ${item.name} (Qty: ${item.qty}) - ₹${item.price * item.qty}\n`;
        totalItems += item.qty;
        totalAmount += (item.price * item.qty);
    });

    const message = `*Maurya Enterprises Order*\n\n` +
                    `*Name:* ${name}\n` +
                    `*Mobile:* ${phone}\n` +
                    `*Address:* ${address}\n\n` +
                    `*Products:*\n${productLines}\n` +
                    `*Total Items:* ${totalItems}\n` +
                    `*Total Amount:* ₹${totalAmount}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}