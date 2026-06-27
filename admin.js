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

let currentSelectedCategory = "";
let currentSelectedSubcategory = "";

let allProductsRaw = [];
let allCategoriesRaw = [];
let allSubcategoriesRaw = [];

document.addEventListener("DOMContentLoaded", () => {
    syncRealtimeDatabase();
    document.getElementById("form-add-category").addEventListener("submit", saveCategoryHandler);
    document.getElementById("form-add-subcategory").addEventListener("submit", saveSubcategoryHandler);
    document.getElementById("form-add-product").addEventListener("submit", saveProductHandler);
});

function syncRealtimeDatabase() {
    db.collection("categories").onSnapshot(snap => {
        allCategoriesRaw = []; snap.forEach(d => allCategoriesRaw.push({id: d.id, ...d.data()}));
        renderAdminCategories();
    });
    db.collection("subcategories").onSnapshot(snap => {
        allSubcategoriesRaw = []; snap.forEach(d => allSubcategoriesRaw.push({id: d.id, ...d.data()}));
        if(currentSelectedCategory) renderAdminSubcategories(currentSelectedCategory);
    });
    db.collection("products").onSnapshot(snap => {
        allProductsRaw = []; snap.forEach(d => allProductsRaw.push({id: d.id, ...d.data()}));
        if(currentSelectedSubcategory) renderAdminProducts(currentSelectedSubcategory);
    });
}

function renderAdminCategories() {
    const container = document.getElementById("admin-categories-list");
    if(!container) return; container.innerHTML = "";
    
    allCategoriesRaw.forEach(cat => {
        const div = document.createElement("div");
        div.className = "category-card";
        div.innerHTML = `
            <div onclick="enterSubcatLevel('${cat.name}')" style="cursor:pointer;">
                <img src="${cat.image}" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                <h3>${cat.name}</h3>
            </div>
            <div class="grid-actions">
                <button type="button" class="admin-btn" onclick="editCategoryItem('${cat.id}','${cat.name}','${cat.image}')"><i class="fas fa-edit"></i></button>
                <button type="button" class="admin-btn danger" onclick="deleteCategoryItem('${cat.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
}

function enterSubcatLevel(catName) {
    currentSelectedCategory = catName;
    document.getElementById("view-level-categories").classList.add("hidden");
    document.getElementById("view-level-subcategories").classList.remove("hidden");
    document.getElementById("view-level-products").classList.add("hidden");
    
    document.getElementById("crumb-cat").innerText = catName;
    document.getElementById("crumb-cat").classList.remove("hidden");
    document.getElementById("icon-cat").classList.remove("hidden");
    
    document.getElementById("parent-cat-display").innerText = catName;
    document.getElementById("parent-cat-title").innerText = catName;
    renderAdminSubcategories(catName);
}

function renderAdminSubcategories(parentCat) {
    const container = document.getElementById("admin-subcategories-list");
    container.innerHTML = "";
    const filtered = allSubcategoriesRaw.filter(s => s.parentCategory === parentCat);
    
    if(filtered.length === 0) container.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px;'>No subcategories here. Add one above!</p>";
    
    filtered.forEach(sub => {
        const div = document.createElement("div");
        div.className = "category-card";
        div.innerHTML = `
            <div onclick="enterProductsLevel('${sub.name}')" style="cursor:pointer;">
                <img src="${sub.image}" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                <h3>${sub.name}</h3>
            </div>
            <div class="grid-actions">
                <button type="button" class="admin-btn" onclick="editSubcategoryItem('${sub.id}','${sub.name}','${sub.image}')"><i class="fas fa-edit"></i></button>
                <button type="button" class="admin-btn danger" onclick="deleteSubcategoryItem('${sub.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
}

function enterProductsLevel(subcatName) {
    currentSelectedSubcategory = subcatName;
    document.getElementById("view-level-subcategories").classList.add("hidden");
    document.getElementById("view-level-products").classList.remove("hidden");
    
    document.getElementById("crumb-sub").innerText = subcatName;
    document.getElementById("crumb-sub").classList.remove("hidden");
    
    document.getElementById("final-sub-display").innerText = subcatName;
    document.getElementById("final-sub-title").innerText = subcatName;
    renderAdminProducts(subcatName);
}

function renderAdminProducts(subcatName) {
    const container = document.getElementById("admin-products-list");
    container.innerHTML = "";
    const filtered = allProductsRaw.filter(p => (p.subcategory === subcatName || p.subCategory === subcatName));
    
    if(filtered.length === 0) container.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:20px;'>No products found under this subcategory.</p>";
    
    filtered.forEach(p => {
        const div = document.createElement("div");
        div.className = "product-card";
        const isLowStock = Number(p.stock || 0) <= 5;
        div.innerHTML = `
            <img src="${p.imageUrl || p.image}" onerror="this.src='https://placehold.co/200'">
            <h4>${p.name}</h4>
            <p style="margin:2px 0; font-size:12px; color:#64748b;">Brand: ${p.brand || 'N/A'} | Unit: ${p.unit || 'Pcs'}</p>
            <p class="product-price">₹${p.price} <span style="text-decoration:line-through; color:#94a3b8; font-size:12px;">₹${p.mrp || ''}</span></p>
            <p style="font-size:12px; font-weight:700; color:${isLowStock ? '#ef4444':'#22c55e'}">Stock: ${p.stock || 0} left</p>
            <div style="display:flex; gap:8px; margin-top:10px; padding:10px 0;">
                <button type="button" class="admin-btn" style="flex:1;" onclick="editProductItem('${p.id}','${p.name}','${p.brand}','${p.unit}','${p.mrp}','${p.price}','${p.stock}','${p.imageUrl || p.image}')">Edit</button>
                <button type="button" class="admin-btn danger" style="flex:1;" onclick="deleteProductItem('${p.id}')">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.navToRoot = function() {
    currentSelectedCategory = ""; currentSelectedSubcategory = "";
    document.getElementById("view-level-categories").classList.remove("hidden");
    document.getElementById("view-level-subcategories").classList.add("hidden");
    document.getElementById("view-level-products").classList.add("hidden");
    document.getElementById("crumb-cat").classList.add("hidden");
    document.getElementById("icon-cat").classList.add("hidden");
    document.getElementById("crumb-sub").classList.add("hidden");
};

window.navToCat = function() {
    currentSelectedSubcategory = "";
    document.getElementById("view-level-subcategories").classList.remove("hidden");
    document.getElementById("view-level-products").classList.add("hidden");
    document.getElementById("crumb-sub").classList.add("hidden");
};

function saveCategoryHandler(e) {
    e.preventDefault();
    const id = document.getElementById("edit-cat-id").value;
    const name = document.getElementById("new-cat-name").value.trim();
    const image = document.getElementById("new-cat-image").value.trim();
    if(id) { db.collection("categories").doc(id).update({name, image}).then(() => resetForm("form-add-category","btn-submit-cat")); }
    else { db.collection("categories").add({name, image}).then(() => resetForm("form-add-category","btn-submit-cat")); }
}

function saveSubcategoryHandler(e) {
    e.preventDefault();
    const id = document.getElementById("edit-sub-id").value;
    const name = document.getElementById("new-sub-name").value.trim();
    const image = document.getElementById("new-sub-image").value.trim();
    const data = { name, image, parentCategory: currentSelectedCategory };
    if(id) { db.collection("subcategories").doc(id).update(data).then(() => resetForm("form-add-subcategory","btn-submit-sub")); }
    else { db.collection("subcategories").add(data).then(() => resetForm("form-add-subcategory","btn-submit-sub")); }
}

function saveProductHandler(e) {
    e.preventDefault();
    const id = document.getElementById("edit-prod-id").value;
    const name = document.getElementById("prod-name").value.trim();
    const brand = document.getElementById("prod-brand").value.trim();
    const unit = document.getElementById("prod-unit").value;
    const mrp = Number(document.getElementById("prod-mrp").value);
    const price = Number(document.getElementById("prod-price").value);
    const stock = Number(document.getElementById("prod-stock").value);
    const imageUrl = document.getElementById("prod-image").value.trim();
    
    const data = {
        name, brand, unit, mrp, price, stock, imageUrl, image: imageUrl,
        category: currentSelectedCategory, mainCategory: currentSelectedCategory,
        subcategory: currentSelectedSubcategory, subCategory: currentSelectedSubcategory
    };
    
    if(id) { db.collection("products").doc(id).update(data).then(() => resetForm("form-add-product","btn-submit-prod")); }
    else { db.collection("products").add(data).then(() => resetForm("form-add-product","btn-submit-prod")); }
}

window.editCategoryItem = function(id, name, img) {
    document.getElementById("edit-cat-id").value = id;
    document.getElementById("new-cat-name").value = name;
    document.getElementById("new-cat-image").value = img;
    document.getElementById("btn-submit-cat").innerText = "Update Category";
};

window.editSubcategoryItem = function(id, name, img) {
    document.getElementById("edit-sub-id").value = id;
    document.getElementById("new-sub-name").value = name;
    document.getElementById("new-sub-image").value = img;
    document.getElementById("btn-submit-sub").innerText = "Update Subcategory";
};

window.editProductItem = function(id, name, brand, unit, mrp, price, stock, img) {
    document.getElementById("edit-prod-id").value = id;
    document.getElementById("prod-name").value = name;
    document.getElementById("prod-brand").value = brand;
    document.getElementById("prod-unit").value = unit;
    document.getElementById("prod-mrp").value = mrp;
    document.getElementById("prod-price").value = price;
    document.getElementById("prod-stock").value = stock;
    document.getElementById("prod-image").value = img;
    document.getElementById("btn-submit-prod").innerText = "Update Product";
};

window.deleteCategoryItem = function(id) { if(confirm("Delete category?")) db.collection("categories").doc(id).delete(); };
window.deleteSubcategoryItem = function(id) { if(confirm("Delete subcategory?")) db.collection("subcategories").doc(id).delete(); };
window.deleteProductItem = function(id) { if(confirm("Delete product?")) db.collection("products").doc(id).delete(); };

function resetForm(fId, bId) {
    document.getElementById(fId).reset();
    document.getElementById(fId).querySelector('input[type="hidden"]').value = "";
    document.getElementById(bId).innerText = "Save Details";
}