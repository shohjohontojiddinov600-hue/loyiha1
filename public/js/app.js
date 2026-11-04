// Smart Market - Core Application Logic
// Supports 5 distinct user roles and complete automated business process workflow

const STATE = {
  currentRole: 'mehmon', // 'mehmon' | 'xaridor' | 'sotuvchi' | 'kuryer' | 'admin'
  currentUser: null,
  products: [],
  categories: [],
  brands: [],
  cart: JSON.parse(localStorage.getItem('smart_market_cart') || '[]'),
  selectedCategory: 'cat_all',
  searchQuery: '',
  sortBy: 'newest',
  visibleCount: 24,
  sellerSearchQuery: '',
  analyticsData: null,
  salesChartInstance: null,
  categoryChartInstance: null
};

// Formatter for Uzbek So'm
function formatUZS(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount || 0) + " so'm";
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadProducts();
  switchRole('mehmon');
  updateCartBadge();
});

// Toast notification helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');

  msgEl.textContent = message;
  toast.className = `fixed bottom-5 right-5 z-50 transition-all duration-300 pointer-events-none flex items-center p-4 rounded-xl shadow-xl text-white text-sm max-w-sm ${
    type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
  }`;

  iconEl.innerHTML = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' :
                     type === 'error' ? '<i class="fa-solid fa-circle-exclamation"></i>' :
                     '<i class="fa-solid fa-info"></i>';

  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3500);
}

// ============================================================================
// ROLE MANAGEMENT & VIEW SWITCHING
// ============================================================================
async function switchRole(role) {
  STATE.currentRole = role;

  // Update role buttons UI
  document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${role}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Fetch user info for this role
  try {
    const res = await fetch(`/api/users/${role === 'admin' ? 'superadmin' : role}`);
    const data = await res.json();
    STATE.currentUser = data.user || null;
  } catch (err) {
    console.error("User fetch error:", err);
  }

  // Update header badge
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRoleTitle');
  const avatarEl = document.getElementById('userAvatar');

  if (role === 'mehmon') {
    userNameEl.textContent = 'Mehmon (Ro\'yxatdan o\'tmagan)';
    userRoleEl.textContent = 'Mehmon rejimi (Faqat xarid)';
    avatarEl.textContent = 'M';
    avatarEl.className = 'w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold';
  } else if (role === 'xaridor') {
    userNameEl.textContent = 'Jasur Rahimov';
    userRoleEl.textContent = 'Xaridor (Mijoz)';
    avatarEl.textContent = 'JR';
    avatarEl.className = 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold';
  } else if (role === 'sotuvchi') {
    userNameEl.textContent = 'TechnoStore MChJ';
    userRoleEl.textContent = 'Sotuvchi / Kontent-menejer';
    avatarEl.textContent = 'ST';
    avatarEl.className = 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold';
  } else if (role === 'kuryer') {
    userNameEl.textContent = 'Aziz Karimov';
    userRoleEl.textContent = 'Kuryer (Logistika)';
    avatarEl.textContent = 'AK';
    avatarEl.className = 'w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold';
  } else if (role === 'admin') {
    userNameEl.textContent = 'Bosh Administrator';
    userRoleEl.textContent = 'Superadmin';
    avatarEl.textContent = 'AD';
    avatarEl.className = 'w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold';
  }

  // Hide all view containers
  document.getElementById('view-customer-catalog').classList.add('hidden');
  document.getElementById('view-customer-orders').classList.add('hidden');
  document.getElementById('view-seller').classList.add('hidden');
  document.getElementById('view-courier').classList.add('hidden');
  document.getElementById('view-admin').classList.add('hidden');

  // Show relevant view container
  if (role === 'mehmon') {
    document.getElementById('view-customer-catalog').classList.remove('hidden');
  } else if (role === 'xaridor') {
    document.getElementById('view-customer-orders').classList.remove('hidden');
    loadCustomerOrders();
  } else if (role === 'sotuvchi') {
    document.getElementById('view-seller').classList.remove('hidden');
    loadSellerDashboard();
  } else if (role === 'kuryer') {
    document.getElementById('view-courier').classList.remove('hidden');
    loadCourierDashboard();
  } else if (role === 'admin') {
    document.getElementById('view-admin').classList.remove('hidden');
    loadAdminDashboard();
  }

  showToast(`Rol o'zgartirildi: ${role.toUpperCase()}`, 'info');
}

// ============================================================================
// DATA FETCHING & CATALOG RENDERING
// ============================================================================
async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    STATE.categories = data.categories || [];

    const bar = document.getElementById('categoriesBar');
    bar.innerHTML = STATE.categories.map(cat => `
      <button onclick="selectCategory('${cat.id}')" 
        class="cat-chip whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
          STATE.selectedCategory === cat.id 
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
        }" data-id="${cat.id}">
        ${cat.name}
      </button>
    `).join('');
  } catch (err) {
    console.error("Categories error:", err);
  }
}

function selectCategory(catId) {
  STATE.selectedCategory = catId;
  STATE.visibleCount = 24;
  document.querySelectorAll('.cat-chip').forEach(c => {
    if (c.getAttribute('data-id') === catId) {
      c.className = 'cat-chip whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border bg-emerald-600 text-white border-emerald-600 shadow-sm';
    } else {
      c.className = 'cat-chip whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border bg-white text-gray-600 border-gray-200 hover:border-emerald-400';
    }
  });
  loadProducts();
}

let searchTimer;
function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    STATE.searchQuery = document.getElementById('searchInput').value;
    STATE.visibleCount = 24;
    loadProducts();
  }, 300);
}

function applyFilters() {
  STATE.sortBy = document.getElementById('sortSelect').value;
  STATE.visibleCount = 24;
  loadProducts();
}

async function loadProducts() {
  try {
    let url = `/api/products?sort=${STATE.sortBy}`;
    if (STATE.selectedCategory && STATE.selectedCategory !== 'cat_all') {
      url += `&category=${encodeURIComponent(STATE.selectedCategory)}`;
    }
    if (STATE.searchQuery) {
      url += `&search=${encodeURIComponent(STATE.searchQuery)}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    STATE.products = data.products || [];

    renderProductsGrid();
  } catch (err) {
    console.error("Products error:", err);
  }
}

function renderProductsGrid() {
  const grid = document.getElementById('productsGrid');
  const countEl = document.getElementById('productTotalCount');
  const loadMoreBox = document.getElementById('loadMoreContainer');
  const showingText = document.getElementById('productsShowingText');

  const total = STATE.products.length;
  countEl.textContent = `${total} ta`;

  if (total === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-gray-400">
        <i class="fa-solid fa-box-open text-4xl mb-3 text-gray-300"></i>
        <p class="text-base font-semibold">Ushbu so'rov bo'yicha hech qanday mahsulot topilmadi.</p>
        <button onclick="selectCategory('cat_all'); document.getElementById('searchInput').value=''; debounceSearch();" 
          class="mt-3 text-xs text-emerald-600 hover:underline font-bold">Barcha mahsulotlarni ko'rsatish</button>
      </div>
    `;
    if (loadMoreBox) loadMoreBox.classList.add('hidden');
    return;
  }

  const visibleList = STATE.products.slice(0, STATE.visibleCount);

  grid.innerHTML = visibleList.map(p => {
    const isOutOfStock = p.stock <= 0;
    return `
      <div class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
        <div>
          <!-- Image container -->
          <div class="relative h-48 bg-gray-50 overflow-hidden">
            <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
            ${p.discount > 0 ? `
              <span class="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                -${p.discount}%
              </span>
            ` : ''}
            <span class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <i class="fa-solid fa-star text-amber-400 text-[10px]"></i> ${p.rating} (${p.reviewsCount})
            </span>
          </div>

          <!-- Product Details -->
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span class="font-medium text-emerald-600">${p.brand}</span>
              <span class="${isOutOfStock ? 'text-rose-500 font-bold' : p.stock < 5 ? 'text-amber-500 font-semibold' : 'text-gray-500'}">
                <i class="fa-solid fa-cubes text-[10px]"></i> Ombor: ${isOutOfStock ? 'Tugagan' : p.stock + ' dona'}
              </span>
            </div>
            <h4 class="font-bold text-gray-800 text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 transition" title="${p.title}">
              ${p.title}
            </h4>
            <p class="text-xs text-gray-500 line-clamp-2">${p.description}</p>
          </div>
        </div>

        <!-- Price & Cart action -->
        <div class="p-4 pt-0 border-t border-gray-50 flex items-center justify-between mt-2">
          <div>
            ${p.oldPrice && p.oldPrice > p.price ? `
              <div class="text-[11px] text-gray-400 line-through">${formatUZS(p.oldPrice)}</div>
            ` : ''}
            <div class="text-base font-extrabold text-gray-900">${formatUZS(p.price)}</div>
          </div>
          <button onclick="addToCart('${p.id}')" ${isOutOfStock ? 'disabled' : ''} 
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95'
            }">
            <i class="fa-solid fa-cart-plus"></i>
            <span>${isOutOfStock ? 'Tugagan' : 'Savatga'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (loadMoreBox && showingText) {
    if (total > STATE.visibleCount) {
      loadMoreBox.classList.remove('hidden');
      showingText.textContent = `Jami ${total} ta mahsulotdan ${visibleList.length} tasi ko'rsatilmoqda`;
    } else {
      loadMoreBox.classList.add('hidden');
    }
  }
}

function loadMoreProducts() {
  STATE.visibleCount += 24;
  renderProductsGrid();
}

// ============================================================================
// CART FUNCTIONALITY
// ============================================================================
function updateCartBadge() {
  const count = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartBadgeCount').textContent = count;
  localStorage.setItem('smart_market_cart', JSON.stringify(STATE.cart));
}

function addToCart(productId) {
  const prod = STATE.products.find(p => p.id === productId);
  if (!prod) return;

  if (prod.stock <= 0) {
    showToast("Mahsulot omborda qolmagan!", "error");
    return;
  }

  const existing = STATE.cart.find(i => i.productId === productId);
  if (existing) {
    if (existing.quantity >= prod.stock) {
      showToast(`Omborda boridan ortiq qo'sha olmaysiz (${prod.stock} dona)`, "error");
      return;
    }
    existing.quantity += 1;
  } else {
    STATE.cart.push({
      productId: prod.id,
      title: prod.title,
      price: prod.price,
      image: prod.image,
      quantity: 1,
      stock: prod.stock
    });
  }

  updateCartBadge();
  showToast(`"${prod.title}" savatchaga qo'shildi!`);
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cartDrawer');
  if (open) {
    renderCartItems();
    drawer.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItemsList');
  if (STATE.cart.length === 0) {
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center text-gray-400">
        <i class="fa-solid fa-cart-shopping text-5xl mb-3 text-gray-200"></i>
        <p class="font-bold text-gray-700">Savatchangiz bo'sh</p>
        <p class="text-xs text-gray-400 mt-1">Katalogdan mahsulotlarni tanlab qo'shing</p>
      </div>
    `;
    updateCartTotals(0);
    return;
  }

  let subtotal = 0;
  container.innerHTML = STATE.cart.map((item, idx) => {
    subtotal += item.price * item.quantity;
    return `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <img src="${item.image}" alt="" class="w-16 h-16 object-cover rounded-lg">
        <div class="flex-1 min-w-0">
          <h5 class="text-xs font-bold text-gray-800 truncate">${item.title}</h5>
          <div class="text-xs font-extrabold text-emerald-600 mt-0.5">${formatUZS(item.price)}</div>
          <div class="flex items-center gap-2 mt-2">
            <button onclick="changeCartQty(${idx}, -1)" class="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100">-</button>
            <span class="text-xs font-bold text-gray-800 w-5 text-center">${item.quantity}</span>
            <button onclick="changeCartQty(${idx}, 1)" class="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100">+</button>
          </div>
        </div>
        <button onclick="removeCartItem(${idx})" class="p-2 text-gray-400 hover:text-rose-500">
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
    `;
  }).join('');

  updateCartTotals(subtotal);
}

function changeCartQty(index, delta) {
  const item = STATE.cart[index];
  if (!item) return;

  const prod = STATE.products.find(p => p.id === item.productId);
  const maxStock = prod ? prod.stock : item.stock;

  item.quantity += delta;
  if (item.quantity > maxStock) {
    item.quantity = maxStock;
    showToast(`Maksimal mavjud zaxira: ${maxStock} dona`, 'error');
  } else if (item.quantity <= 0) {
    STATE.cart.splice(index, 1);
  }

  updateCartBadge();
  renderCartItems();
}

function removeCartItem(index) {
  STATE.cart.splice(index, 1);
  updateCartBadge();
  renderCartItems();
}

function updateCartTotals(subtotal) {
  const delivery = subtotal >= 5000000 || subtotal === 0 ? 0 : 25000;
  const grandTotal = subtotal + delivery;

  document.getElementById('cartItemsSubtotal').textContent = formatUZS(subtotal);
  document.getElementById('cartDeliveryEst').textContent = subtotal >= 5000000 ? "Bepul (5 mln dan yuqori)" : (subtotal === 0 ? "0 so'm" : formatUZS(delivery));
  document.getElementById('cartTotalSum').textContent = formatUZS(grandTotal);
}

// ============================================================================
// CHECKOUT & PAYMENT WORKFLOW (Biznes-jarayon zanjiri)
// ============================================================================
function startCheckout() {
  if (STATE.cart.length === 0) {
    showToast("Savatchangiz bo'sh!", "error");
    return;
  }

  toggleCartDrawer(false);

  // If user is guest, automatically inform them they can proceed as customer
  if (STATE.currentRole === 'mehmon') {
    showToast("Buyurtmani rasmiylashtirish uchun Xaridor profili biriktirildi", "info");
  }

  const modal = document.getElementById('checkoutModal');
  modal.classList.remove('hidden');

  updateCheckoutDeliveryFee();
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

function updateCheckoutDeliveryFee() {
  const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const subtotal = STATE.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const fee = (method === 'courier' && subtotal < 5000000) ? 25000 : 0;
  const grand = subtotal + fee;

  document.getElementById('checkoutSubtotalText').textContent = formatUZS(subtotal);
  document.getElementById('checkoutDeliveryText').textContent = fee === 0 ? "Bepul (0 so'm)" : formatUZS(fee);
  document.getElementById('checkoutGrandTotalText').textContent = formatUZS(grand);

  const addrContainer = document.getElementById('addressFieldContainer');
  if (method === 'pvz') {
    addrContainer.innerHTML = `
      <label class="block text-xs font-semibold text-gray-700 mb-1">Topshirish punkti (PVZ) manzili:</label>
      <select id="custAddressInput" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
        <option value="Smart Market PVZ #1 - Chilonzor 7-mavze, 2-uy">Smart Market PVZ #1 - Chilonzor 7-mavze, 2-uy</option>
        <option value="Smart Market PVZ #2 - Yunusobod Mega Planet yaqinida">Smart Market PVZ #2 - Yunusobod Mega Planet yaqinida</option>
        <option value="Smart Market PVZ #3 - Amir Temur shoh ko'chasi, 88">Smart Market PVZ #3 - Amir Temur shoh ko'chasi, 88</option>
      </select>
    `;
  } else {
    addrContainer.innerHTML = `
      <label class="block text-xs font-semibold text-gray-700 mb-1">Yetkazib berish manzili:</label>
      <input type="text" id="custAddressInput" required value="Toshkent sh., Chilonzor tumani, 9-mavze, 14-uy" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
    `;
  }
}

async function submitCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('custNameInput').value;
  const phone = document.getElementById('custPhoneInput').value;
  const address = document.getElementById('custAddressInput').value;
  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  const btn = document.getElementById('checkoutSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> To'lov qayta ishlanmoqda...`;

  try {
    const payload = {
      customerId: "usr_customer",
      customerName: name,
      customerPhone: phone,
      deliveryMethod,
      deliveryAddress: address,
      paymentMethod,
      items: STATE.cart
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Xatolik yuz berdi");
    }

    // Success! Clear cart
    STATE.cart = [];
    updateCartBadge();
    closeCheckoutModal();

    showToast(`Buyurtma qabul qilindi! Chek: ${data.order.fiscalReceiptId}`, "success");

    // Automatically switch to customer role to view the new order tracker
    await loadProducts(); // reload products to show deducted stock
    switchRole('xaridor');

  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-lock"></i> <span>To'lovni tasdiqlash va buyurtma berish</span>`;
  }
}

// ============================================================================
// CUSTOMER ORDERS TRACKER (Xaridor oynasi)
// ============================================================================
async function loadCustomerOrders() {
  const container = document.getElementById('customerOrdersList');
  container.innerHTML = `<div class="p-8 text-center text-gray-400"><i class="fa-solid fa-spinner animate-spin text-2xl"></i></div>`;

  try {
    const res = await fetch('/api/orders?customerId=usr_customer');
    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-100">
          <i class="fa-solid fa-box-open text-4xl mb-3 text-gray-300"></i>
          <p class="font-bold text-gray-700">Hozircha buyurtmalar mavjud emas</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(o => {
      // Step indices: tayyorlanmoqda (1), yolda (2), yetkazildi (3)
      const step = o.orderStatus === 'tayyorlanmoqda' ? 1 :
                   o.orderStatus === 'yolda' ? 2 :
                   o.orderStatus === 'yetkazildi' ? 3 : 0;

      return `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <span class="text-xs font-bold text-gray-500">Buyurtma:</span>
              <span class="text-sm font-extrabold text-emerald-600">${o.id}</span>
              <span class="text-xs text-gray-400 ml-2">(${new Date(o.createdAt).toLocaleString('uz-UZ')})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }">
                ${o.paymentStatus === 'paid' ? '✓ To\'langan (' + o.paymentMethod.toUpperCase() + ')' : 'To\'lov kutilmoqda'}
              </span>
              <span class="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                Chek: ${o.fiscalReceiptId}
              </span>
            </div>
          </div>

          <!-- Order Status Timeline (Ko'rgazmali status trekeri) -->
          <div class="py-2">
            <div class="grid grid-cols-3 text-center text-xs font-medium">
              <div class="space-y-1">
                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                }">
                  <i class="fa-solid fa-box"></i>
                </div>
                <div class="${step >= 1 ? 'text-emerald-700 font-bold' : 'text-gray-400'}">Tayyorlanmoqda</div>
                <div class="text-[10px] text-gray-400">Omborda yig'ilmoqda</div>
              </div>

              <div class="space-y-1">
                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                }">
                  <i class="fa-solid fa-truck-fast"></i>
                </div>
                <div class="${step >= 2 ? 'text-emerald-700 font-bold' : 'text-gray-400'}">Yo'lda</div>
                <div class="text-[10px] text-gray-400">${o.courierName ? 'Kuryer: ' + o.courierName : 'Kuryerga biriktirilgan'}</div>
              </div>

              <div class="space-y-1">
                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                }">
                  <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="${step >= 3 ? 'text-emerald-700 font-bold' : 'text-gray-400'}">Yetkazib berildi</div>
                <div class="text-[10px] text-gray-400">${o.deliveredAt ? new Date(o.deliveredAt).toLocaleTimeString('uz-UZ') : 'Topshirish kutilmoqda'}</div>
              </div>
            </div>
          </div>

          <!-- Items list in order -->
          <div class="space-y-2 border-t border-gray-100 pt-3">
            ${o.items.map(it => `
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <img src="${it.image}" class="w-8 h-8 object-cover rounded" alt="">
                  <span class="font-medium text-gray-800">${it.title}</span>
                  <span class="text-gray-400">x${it.quantity}</span>
                </div>
                <span class="font-bold text-gray-700">${formatUZS(it.price * it.quantity)}</span>
              </div>
            `).join('')}
          </div>

          <!-- Total Footer -->
          <div class="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span class="text-gray-500">Yetkazish: <strong class="text-gray-700">${o.deliveryAddress}</strong></span>
            <span class="text-sm font-extrabold text-gray-900">Jami: ${formatUZS(o.totalAmount)}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error("Customer orders error:", err);
  }
}

// ============================================================================
// SELLER DASHBOARD (Sotuvchi va Ombor)
// ============================================================================
async function loadSellerDashboard() {
  await loadProducts(); // ensures STATE.products is up to date
  renderSellerTable();
  loadSellerOrders();
}

function filterSellerTable() {
  STATE.sellerSearchQuery = (document.getElementById('sellerSearchInput')?.value || '').toLowerCase().trim();
  renderSellerTable();
}

function renderSellerTable() {
  const tbody = document.getElementById('sellerProductsTableBody');
  const totalCountEl = document.getElementById('sellerTotalCount');
  if (totalCountEl) totalCountEl.textContent = STATE.products.length;

  let filtered = STATE.products;
  if (STATE.sellerSearchQuery) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(STATE.sellerSearchQuery) ||
      p.brand.toLowerCase().includes(STATE.sellerSearchQuery) ||
      p.id.toLowerCase().includes(STATE.sellerSearchQuery)
    );
  }

  // Display top 50 matches for performance if no search, or all filtered
  const displayList = STATE.sellerSearchQuery ? filtered : filtered.slice(0, 50);

  if (displayList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-400">Hech qanday mahsulot topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = displayList.map(p => `
    <tr class="hover:bg-gray-50/80 transition">
      <td class="p-3.5 flex items-center gap-3">
        <img src="${p.image}" class="w-10 h-10 object-cover rounded-lg" alt="">
        <div>
          <div class="font-bold text-gray-900">${p.title}</div>
          <div class="text-xs text-gray-400">${p.brand} | ID: ${p.id}</div>
        </div>
      </td>
      <td class="p-3.5">${p.categoryName}</td>
      <td class="p-3.5 font-bold text-gray-900">${formatUZS(p.price)}</td>
      <td class="p-3.5 text-center">
        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
          p.stock <= 0 ? 'bg-rose-100 text-rose-700' : p.stock < 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
        }">
          ${p.stock} dona
        </span>
      </td>
      <td class="p-3.5 text-center space-x-1">
        <button onclick="quickRestock('${p.id}', 5)" class="px-2 py-1 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-700 rounded-lg text-xs font-semibold transition">
          +5
        </button>
        <button onclick="quickRestock('${p.id}', 10)" class="px-2 py-1 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-700 rounded-lg text-xs font-semibold transition">
          +10
        </button>
      </td>
      <td class="p-3.5 text-right">
        <button onclick="deleteProduct('${p.id}')" class="text-gray-400 hover:text-rose-600 p-1.5 transition">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function quickRestock(productId, addedQty) {
  const prod = STATE.products.find(p => p.id === productId);
  if (!prod) return;

  const newStock = prod.stock + addedQty;
  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    });
    const data = await res.json();
    if (data.success) {
      prod.stock = newStock;
      loadSellerDashboard();
      showToast(`"${prod.title}" zaxirasi +${addedQty} donaga to'ldirildi!`);
    }
  } catch (err) {
    showToast("Zaxirani yangilashda xatolik", "error");
  }
}

async function deleteProduct(productId) {
  if (!confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) return;
  try {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast("Mahsulot muvaffaqiyatli o'chirildi");
      loadSellerDashboard();
    }
  } catch (err) {
    showToast("O'chirishda xatolik yuz berdi", "error");
  }
}

async function loadSellerOrders() {
  const container = document.getElementById('sellerOrdersList');
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    const pendingOrders = (data.orders || []).filter(o => o.orderStatus === 'tayyorlanmoqda');

    if (pendingOrders.length === 0) {
      container.innerHTML = `<div class="text-xs text-gray-400 py-3">Hozirda qadoqlanishi kerak bo'lgan yangi buyurtmalar yo'q.</div>`;
      return;
    }

    container.innerHTML = pendingOrders.map(o => `
      <div class="border border-gray-100 bg-gray-50/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <div class="font-bold text-gray-800">${o.id} &bull; ${o.customerName} (${o.customerPhone})</div>
          <div class="text-gray-500 mt-0.5">${o.items.map(i => `${i.title} (${i.quantity}x)`).join(', ')}</div>
          <div class="text-emerald-700 font-semibold mt-0.5">Summa: ${formatUZS(o.totalAmount)} &bull; ${o.paymentStatus === 'paid' ? 'To\'langan' : 'Naqd to\'lov'}</div>
        </div>
        <button onclick="confirmOrderPacked('${o.id}')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5">
          <i class="fa-solid fa-box-check"></i> Qadoqlandi va Kuryerga tayyor
        </button>
      </div>
    `).join('');
  } catch (err) {
    console.error("Seller orders error:", err);
  }
}

async function confirmOrderPacked(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'yolda', courierId: 'usr_courier' })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`${orderId} buyurtmasi kuryerga topshirildi va "Yo'lda" statusiga o'tkazildi!`);
      loadSellerOrders();
    }
  } catch (err) {
    showToast("Holatni yangilashda xatolik", "error");
  }
}

function openAddProductModal() {
  document.getElementById('addProductModal').classList.remove('hidden');
}

function closeAddProductModal() {
  document.getElementById('addProductModal').classList.add('hidden');
}

async function submitNewProduct(e) {
  e.preventDefault();
  const title = document.getElementById('newProdTitle').value;
  const categoryId = document.getElementById('newProdCategory').value;
  const brand = document.getElementById('newProdBrand').value;
  const price = document.getElementById('newProdPrice').value;
  const oldPrice = document.getElementById('newProdOldPrice').value;
  const stock = document.getElementById('newProdStock').value;
  const image = document.getElementById('newProdImage').value;
  const description = document.getElementById('newProdDesc').value;

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        categoryId,
        brand,
        price,
        oldPrice: oldPrice || price,
        stock,
        image,
        description
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`"${title}" mahsuloti katalogga kiritildi!`);
      closeAddProductModal();
      document.getElementById('addProductForm').reset();
      loadSellerDashboard();
    }
  } catch (err) {
    showToast("Mahsulot qo'shishda xatolik", "error");
  }
}

// ============================================================================
// COURIER DASHBOARD (Kuryer kabineti)
// ============================================================================
async function loadCourierDashboard() {
  const container = document.getElementById('courierDeliveriesList');
  container.innerHTML = `<div class="p-8 text-center text-gray-400"><i class="fa-solid fa-spinner animate-spin text-2xl"></i></div>`;

  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    const orders = data.orders || [];

    // Filter relevant orders for courier (yolda or tayyorlanmoqda or delivered today)
    if (orders.length === 0) {
      container.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-gray-400">Yetkazib berishlar ro'yxati bo'sh.</div>`;
      return;
    }

    container.innerHTML = orders.map(o => {
      const isDelivered = o.orderStatus === 'yetkazildi';
      const isInTransit = o.orderStatus === 'yolda';

      return `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                ${o.id.replace('ORD-', '#')}
              </span>
              <div>
                <h4 class="font-bold text-gray-800 text-sm">${o.customerName}</h4>
                <p class="text-xs text-gray-500"><i class="fa-solid fa-phone mr-1"></i> ${o.customerPhone}</p>
              </div>
            </div>
            <div>
              <span class="px-3 py-1 rounded-full text-xs font-bold ${
                isDelivered ? 'bg-emerald-100 text-emerald-800' :
                isInTransit ? 'bg-blue-100 text-blue-800 animate-pulse' :
                'bg-amber-100 text-amber-800'
              }">
                ${isDelivered ? '✓ Topshirildi' : isInTransit ? '🚚 Marshrutda (Yo\'lda)' : 'Tayyorlanmoqda'}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1">
              <span class="text-gray-400 font-medium">Yetkazish manzili:</span>
              <p class="font-bold text-gray-800 flex items-start gap-1.5">
                <i class="fa-solid fa-location-dot text-rose-500 mt-0.5"></i>
                <span>${o.deliveryAddress}</span>
              </p>
            </div>
            <div class="space-y-1">
              <span class="text-gray-400 font-medium">To'lov va chek:</span>
              <p class="font-bold text-gray-800">
                ${formatUZS(o.totalAmount)} (${o.paymentMethod.toUpperCase()} &bull; ${o.paymentStatus === 'paid' ? 'To\'langan' : 'Naqd to\'lov olinadi'})
              </p>
            </div>
          </div>

          <!-- Courier Actions -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div class="text-[11px] text-gray-400">
              Chek ID: <span class="font-mono text-gray-600">${o.fiscalReceiptId}</span>
            </div>
            <div class="flex gap-2">
              ${!isInTransit && !isDelivered ? `
                <button onclick="updateCourierOrderStatus('${o.id}', 'yolda')" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition">
                  <i class="fa-solid fa-truck-pickup mr-1"></i> Qabul qildim (Yo'lga chiqish)
                </button>
              ` : ''}
              ${isInTransit ? `
                <button onclick="updateCourierOrderStatus('${o.id}', 'yetkazildi')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition">
                  <i class="fa-solid fa-circle-check mr-1"></i> Mijozga topshirildi (Yetkazildi)
                </button>
              ` : ''}
              ${isDelivered ? `
                <span class="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <i class="fa-solid fa-circle-check"></i> Yetkazib berilgan
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error("Courier dashboard error:", err);
  }
}

async function updateCourierOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, courierId: 'usr_courier' })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Buyurtma holati yangilandi: ${newStatus.toUpperCase()}`);
      loadCourierDashboard();
    }
  } catch (err) {
    showToast("Statusni yangilashda xatolik", "error");
  }
}

// ============================================================================
// SUPERADMIN DASHBOARD (Analitika, Savdo Statistikasi, Chart.js)
// ============================================================================
async function loadAdminDashboard() {
  try {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    STATE.analyticsData = data;

    // Fill Summary Cards
    document.getElementById('statTotalRevenue').textContent = data.summary.formattedRevenue;
    document.getElementById('statTotalOrders').textContent = `${data.summary.totalOrders} ta`;
    document.getElementById('statActiveOrders').textContent = data.summary.activeOrders;
    document.getElementById('statAverageCheck').textContent = data.summary.formattedAverageCheck;
    document.getElementById('statTotalProducts').textContent = data.summary.totalProducts;

    // Render Charts
    renderSalesTrendChart(data.last7Days);
    renderCategoryDoughnutChart(data.categorySales);

    // Render Top Products
    const topContainer = document.getElementById('adminTopProductsList');
    if (data.topProducts.length === 0) {
      topContainer.innerHTML = `<div class="text-xs text-gray-400">Hozircha sotuvlar tarixi kam.</div>`;
    } else {
      topContainer.innerHTML = data.topProducts.map((p, i) => `
        <div class="flex items-center justify-between text-xs p-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <div class="flex items-center gap-3">
            <span class="w-5 h-5 rounded-full ${i === 0 ? 'bg-amber-400 text-white font-extrabold' : 'bg-gray-200 text-gray-700'} flex items-center justify-center text-[10px]">
              ${i + 1}
            </span>
            <img src="${p.image}" class="w-8 h-8 object-cover rounded" alt="">
            <span class="font-bold text-gray-800 line-clamp-1">${p.title}</span>
          </div>
          <div class="text-right">
            <span class="font-extrabold text-emerald-600">${p.count} dona</span>
            <div class="text-[10px] text-gray-400">${formatUZS(p.totalRevenue)}</div>
          </div>
        </div>
      `).join('');
    }

    // Render Roles matrix
    const usersContainer = document.getElementById('adminUsersList');
    const uRes = await fetch('/api/users');
    const uData = await uRes.json();
    usersContainer.innerHTML = (uData.users || []).map(u => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
        <div>
          <span class="font-bold text-gray-800">${u.name}</span>
          <span class="text-[10px] text-gray-400 ml-1">(${u.email || u.phone || 'Tizim foydalanuvchisi'})</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
          u.role === 'sotuvchi' ? 'bg-blue-100 text-blue-700' :
          u.role === 'kuryer' ? 'bg-teal-100 text-teal-700' :
          'bg-gray-200 text-gray-700'
        }">${u.role}</span>
      </div>
    `).join('');

  } catch (err) {
    console.error("Admin dashboard error:", err);
  }
}

function renderSalesTrendChart(daysData) {
  const ctx = document.getElementById('salesChart').getContext('2d');
  if (STATE.salesChartInstance) {
    STATE.salesChartInstance.destroy();
  }

  const labels = daysData.map(d => d.day);
  const data = daysData.map(d => d.amount / 1000000); // mln so'mda

  STATE.salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "Savdo aylanmasi (mln so'm)",
        data: data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#059669',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => val + ' mln'
          }
        }
      }
    }
  });
}

function renderCategoryDoughnutChart(categoryData) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (STATE.categoryChartInstance) {
    STATE.categoryChartInstance.destroy();
  }

  const labels = Object.keys(categoryData);
  const counts = Object.values(categoryData);

  STATE.categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
      }
    }
  });
}

// CSV / Excel Export
async function exportToCSV() {
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    const orders = data.orders || [];

    let csv = "ID,Mijoz,Telefon,Summa,YetkazishUsuli,Manzil,TolovUsuli,TolovStatusi,BuyurtmaStatusi,ChekID,Sana\n";
    orders.forEach(o => {
      csv += `"${o.id}","${o.customerName}","${o.customerPhone}","${o.totalAmount}","${o.deliveryMethod}","${o.deliveryAddress}","${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}","${o.fiscalReceiptId}","${o.createdAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smart_market_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Buyurtmalar hisoboti CSV formatida yuklab olindi!");
  } catch (err) {
    showToast("CSV eksportda xatolik", "error");
  }
}

