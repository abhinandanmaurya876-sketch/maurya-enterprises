// आपकी असली Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcfJ7lqOA95b1dqlrQETvAAPooifKAy1g",
  authDomain: "mauryaenterprises-84287.firebaseapp.com",
  projectId: "mauryaenterprises-84287",
  storageBucket: "mauryaenterprises-84287.firebasestorage.app",
  messagingSenderId: "763643637248",
  appId: "1:763643637248:web:3cbfe9ea8b68bebc4132e5",
  measurementId: "G-EK8B6BRLC3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let cart = [];
let allProducts = [];
let currentCategory = "";
const defaultImg = "https://placehold.co/300x200?text=Maurya+Enterprises";

document.addEventListener("DOMContentLoaded", () => {
    loadLiveDatabase();
    setupCartEventListeners();
    setupSearch();
    document.getElementById("checkout-form").addEventListener("submit", handleCheckout);
});

// 1. डेटाबेस से रीयल-टाइम डेटा लोड करना
function loadLiveDatabase() {
    db.collection("products").onSnapshot((snapshot) => {
        allProducts = [];
        snapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
        // शुरुआत में मुख्य कैटेगरीज दिखाएं
        renderMainCategories();
    });
}

// 2. लेवल 1: मुख्य कैटेगरीज को फोटो के साथ रेंडर करना
function renderMainCategories() {
    // अपनी HTML फाइलों के हिसाब से सेक्शन्स को छुपाना/दिखाना
    document.getElementById("shop-categories").classList.remove("hidden");
    if(document.getElementById("products-section")) {
        document.getElementById("products-section").classList.add("hidden");
    }
    
    // सब-कैटेगरी के लिए अगर कोई अलग सेक्शन बनाया हो तो उसे यहाँ हैंडल कर सकते हैं
    const subcatSection = document.getElementById("subcategories-section");
    if(subcatSection) subcatSection.classList.add("hidden");

    const container = document.getElementById("category-container");
    container.innerHTML = "";
    
    // यूनिक कैटेगरीज और उनकी फोटो निकालना
    const uniqueCats = {};
    allProducts.forEach(p => {
        if(p.category && !uniqueCats[p.category]) {
            uniqueCats[p.category] = p.categoryImg || defaultImg;
        }
    });

    const keys = Object.keys(uniqueCats);
    if(keys.length === 0) {
        container.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px;'>No active categories found. Add products from Admin Panel.</p>";
        return;
    }

    keys.forEach(catName => {
        const catCard = document.createElement("div");
        catCard.className = "category-card";
        catCard.style = "border: 1px solid #ddd; border-radius: 8px; overflow: hidden; cursor: pointer; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: 0.2s;";
        
        catCard.innerHTML = `
            <img src="${uniqueCats[catName]}" alt="${catName}" style="width:100%; height:160px; object-fit:cover;">
            <div style="padding: 15px; text-align: center;">
                <h3 style="margin:0 0 5px 0; color:#333; font-size:16px;">${catName}</h3>
                <span style="color:#ff9900; font-weight:600; font-size:14px;">Explore →</span>
            </div>
        `;
        catCard.onclick = () => showSubcategories(catName);
        container.appendChild(catCard);
    });
}

// 3. लेवल 2: चुनी गई कैटेगरी की सब-कैटेगरीज को फोटो के साथ दिखाना
function showSubcategories(categoryName) {
    currentCategory = categoryName;
    
    // मुख्य कैटेगरी ग्रिड को खाली करके उसमें सब-कैटेगरीज लोड करना (या अगर अलग सेक्शन है तो वहाँ दिखा सकते हैं)
    const container = document.getElementById("category-container");
    container.innerHTML = "";
    
    // ब्रेडक्रम्ब या टाइटल बदलने के लिए (अगर HTML में एलिमेंट हो)
    const titleEl = document.getElementById("current-view-title");
    if(titleEl) titleEl.innerText = categoryName;

    // इस कैटेगरी के अंदर की यूनिक सब-कैटेगरीज ढूँढना
    const filteredProducts = allProducts.filter(p => p.category === categoryName);
    const uniqueSubs = {};
    filteredProducts.forEach(p => {
        if(p.subcategory && !uniqueSubs[p.subcategory]) {
            uniqueSubs[p.subcategory] = p.subcategoryImg || defaultImg;
        }
    });

    const keys = Object.keys(uniqueSubs);
    
    // बैक बटन बनाना ताकि ग्राहक वापस जा सके
    const backBtn = document.createElement("div");
    backBtn.style = "grid-column: 1/-1; margin-bottom: 10px;";
    backBtn.innerHTML = `<button onclick="renderMainCategories()" style="background:#666; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;"><i class="fas fa-arrow-left"></i> Back to Main Categories</button>`;
    container.appendChild(backBtn);

    if(keys.length === 0) {
        const msg = document.createElement("p");
        msg.innerText = "No subcategories found here.";
        container.appendChild(msg);
        return;
    }

    keys.forEach(subName => {
        const subCard = document.createElement("div");
        subCard.className = "subcategory-card";
        subCard.style = "border: 1px solid #eee; border-radius: 8px; overflow: hidden; cursor: pointer; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
        
        subCard.innerHTML = `
            <img src="${uniqueSubs[subName]}" alt="${subName}" style="width:100%; height:150px; object-fit:cover;">
            <div style="padding: 12px; text-align: center;">
                <h4 style="margin:0 0 5px 0; color:#444; font-size:15px;">${subName}</h4>
            </div>
        `;
        subCard.onclick = () => showProductsForSubcategory(subName);
        container.appendChild(subCard);
    });
}

// 4. लेवल 3: सब-कैटेगरी पर क्लिक करने पर फाइनल प्रोडक्ट्स लिस्ट दिखाना
function showProductsForSubcategory(subcategoryName) {
    document.getElementById("shop-categories").classList.add("hidden");
    
    const prodSection = document.getElementById("products-section");
    if(prodSection) prodSection.classList.remove("hidden");
    
    const titleEl = document.getElementById("current-view-title");
    if(titleEl) titleEl.innerText = `${currentCategory} > ${subcategoryName}`;

    const container = document.getElementById("products-container");
    container.innerHTML = "";

    // फ़िल्टर किए गए प्रोडक्ट्स
    const filtered = allProducts.filter(p => p.category === currentCategory && p.subcategory === subcategoryName);
    
    filtered.forEach(p => {
        const pCard = document.createElement("div");
        pCard.className = "product-card";
        pCard.style = "border: 1px solid #eee; padding: 15px; border-radius: 8px; background:#fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04);";
        
        const sizeInfo = (p.length && p.length !== "N/A") ? `Size: ${p.length} x ${p.height}` : `Standard Size`;
        const stockStatus = p.quantity > 0 ? `In Stock (${p.quantity} pcs)` : `Out of Stock`;
        const btnDisabled = p.quantity > 0 ? "" : "disabled style='background:#ccc; cursor:not-allowed;'";

        pCard.innerHTML = `
            <img src="${p.imageUrl || defaultImg}" alt="${p.name}" style="width:100%; height:150px; object-fit:cover; border-radius:4px;">
            <h4 style="margin:10px 0 5px 0; font-size:16px; color:#222;">${p.name}</h4>
            <p style="color:#666; font-size:13px; margin:2px 0;">${sizeInfo}</p>
            <p style="font-size:12px; font-weight:bold; color:${p.quantity > 0 ? 'green':'red'}; margin:2px 0;">${stockStatus}</p>
            <p style="font-weight:bold; color:#ff9900; margin:5px 0; font-size:18px;">₹${p.price}</p>
            <button onclick="addToCart('${p.id}')" ${btnDisabled} style="background:#ff9900; color:#000; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; width:100%; font-weight:bold;">Add To Cart</button>
        `;
        container.appendChild(pCard);
    });
}

// बैक बटन लॉजिक जो प्रोडक्ट्स व्यू से वापस सब-कैटेगरीज पर ले जाएगा
const backToCatsBtn = document.getElementById("back-to-categories");
if(backToCatsBtn) {
    backToCatsBtn.onclick = () => {
        document.getElementById("shop-categories").classList.remove("hidden");
        document.getElementById("products-section").classList.add("hidden");
        showSubcategories(currentCategory);
    };
}

// 5. कार्ट मैनेजमेंट सिस्टम (Cart Handling)
function setupCartEventListeners() {
    const panel = document.getElementById("cart-panel");
    const overlay = document.getElementById("cart-overlay");
    
    if(document.getElementById("cart-toggle-btn")) {
        document.getElementById("cart-toggle-btn").onclick = () => { panel.classList.add("active"); if(overlay) overlay.classList.add("active"); };
    }
    if(document.getElementById("cart-close-btn")) {
        document.getElementById("cart-close-btn").onclick = () => { panel.classList.remove("active"); if(overlay) overlay.classList.remove("active"); };
    }
    if(overlay) {
        overlay.onclick = () => { panel.classList.remove("active"); overlay.classList.remove("active"); };
    }
}

function addToCart(productId) {
    const prod = allProducts.find(p => p.id === productId);
    if(!prod || prod.quantity <= 0) return;

    const existing = cart.find(item => item.id === productId);
    if(existing) {
        if(existing.qty < prod.quantity) {
            existing.qty++;
        } else {
            alert("Maximum available stock reached for this item!");
            return;
        }
    } else {
        cart.push({ ...prod, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById("cart-items-container");
    if(!container) return;
    container.innerHTML = "";
    
    let totalItems = 0;
    let totalAmount = 0;

    if(cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            totalItems += item.qty;
            totalAmount += (item.price * item.qty);
            const sizeLabel = (item.length && item.length !== "N/A") ? ` (${item.length}x${item.height})` : "";

            const div = document.createElement("div");
            div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;";
            div.innerHTML = `
                <div>
                    <h5 style="margin:0; font-size:14px;">${item.name}${sizeLabel}</h5>
                    <small style="color:#555;">₹${item.price} x ${item.qty}</small>
                </div>
                <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-trash"></i></button>
            `;
            container.appendChild(div);
        });
    }
    
    if(document.getElementById("cart-count")) document.getElementById("cart-count").innerText = totalItems;
    if(document.getElementById("total-items")) document.getElementById("total-items").innerText = totalItems;
    if(document.getElementById("total-amount")) document.getElementById("total-amount").innerText = "₹" + totalAmount;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

// 6. व्हाट्सएप आर्डर प्लेसमेंट (साइज़ डिटेल्स के साथ)
function handleCheckout(e) {
    e.preventDefault();
    if(cart.length === 0) { alert("Your cart is empty!"); return; }

    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const address = document.getElementById("cust-address").value;

    let orderList = "";
    let total = 0;
    cart.forEach((item, index) => {
        const sizeDetails = (item.length && item.length !== "N/A") ? ` [Size: ${item.length}x${item.height}]` : "";
        orderList += `${index + 1}. ${item.name}${sizeDetails} (Qty: ${item.qty}) - ₹${item.price * item.qty}\n`;
        total += (item.price * item.qty);
    });

    const textMessage = encodeURIComponent(
`*NEW ORDER - MAURYA ENTERPRISES*
---------------------------------------
*Customer Details:*
Name: ${name}
Phone: ${phone}
Address: ${address}

*Items Ordered:*
${orderList}
---------------------------------------
*Total Amount:* ₹${total}
---------------------------------------
Please confirm the order.`
    );

    const whatsappNumber = "9369940723"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${textMessage}`, '_blank');
}

// 7. ग्लोबल सर्च बॉक्स सिस्टम
function setupSearch() {
    const searchInput = document.getElementById("global-search");
    if(!searchInput) return;
    
    searchInput.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        const suggBox = document.getElementById("search-suggestions");
        if(!suggBox) return;
        
        if(!val) { suggBox.innerHTML = ""; return; }
        
        const matches = allProducts.filter(p => p.name.toLowerCase().includes(val) || (p.category && p.category.toLowerCase().includes(val)));
        suggBox.innerHTML = "";
        
        matches.slice(0, 5).forEach(m => {
            const d = document.createElement("div");
            d.style = "padding:8px; cursor:pointer; border-bottom:1px solid #eee; font-size:13px; background:#fff;";
            d.innerText = `${m.name} (${m.subcategory})`;
            d.onclick = () => {
                currentCategory = m.category;
                showProductsForSubcategory(m.subcategory);
                searchInput.value = m.name;
                suggBox.innerHTML = "";
            };
            suggBox.appendChild(d);
        });
    });
}
