const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, saveDb } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to format currency
const formatUZS = (val) => new Intl.NumberFormat('uz-UZ').format(val) + " so'm";

// ==========================================
// 1. HEALTH & GENERAL
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Smart Market E-commerce Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. USERS & ROLES
// ==========================================
app.get('/api/users', (req, res) => {
  const db = getDb();
  res.json({ success: true, users: db.users });
});

app.get('/api/users/:role', (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.role.toLowerCase() === req.params.role.toLowerCase());
  if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
  res.json({ success: true, user });
});

// ==========================================
// 3. CATEGORIES & BRANDS
// ==========================================
app.get('/api/categories', (req, res) => {
  const db = getDb();
  res.json({ success: true, categories: db.categories });
});

app.get('/api/brands', (req, res) => {
  const db = getDb();
  res.json({ success: true, brands: db.brands });
});

// ==========================================
// 4. PRODUCTS (Katalog, Qidiruv, Filtr)
// ==========================================
app.get('/api/products', (req, res) => {
  const db = getDb();
  let list = [...db.products];

  const { category, brand, search, minPrice, maxPrice, sort } = req.query;

  if (category && category !== 'cat_all') {
    list = list.filter(p => p.categoryId === category);
  }

  if (brand) {
    list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    list = list.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => p.price <= Number(maxPrice));
  }

  // Saralash
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    // Default newest
    list.reverse();
  }

  res.json({
    success: true,
    total: list.length,
    products: list
  });
});

app.get('/api/products/:id', (req, res) => {
  const db = getDb();
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
  res.json({ success: true, product: prod });
});

// Mahsulot qo'shish (Sotuvchi / Admin)
app.post('/api/products', (req, res) => {
  const db = getDb();
  const { title, categoryId, brand, price, oldPrice, stock, description, image, specs } = req.body;

  if (!title || !price || !categoryId) {
    return res.status(400).json({ success: false, message: 'Nom, kategoriya va narx majburiy' });
  }

  const catObj = db.categories.find(c => c.id === categoryId);
  const newProduct = {
    id: 'prod_' + Date.now(),
    title,
    categoryId,
    categoryName: catObj ? catObj.name : 'Umumiy',
    brand: brand || 'Smart Market',
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : Number(price),
    discount: oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
    stock: Number(stock) || 1,
    rating: 5.0,
    reviewsCount: 0,
    image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: description || 'Tavsif mavjud emas',
    specs: specs || { "Holati": "Yangi" },
    sellerId: "usr_seller",
    isFeatured: false,
    createdAt: new Date().toISOString()
  };

  db.products.push(newProduct);
  saveDb(db);

  res.status(201).json({ success: true, product: newProduct });
});

// Mahsulotni yangilash / ombor qoldig'i
app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

  const updated = { ...db.products[index], ...req.body };
  if (req.body.price && req.body.oldPrice) {
    updated.discount = Math.round(((req.body.oldPrice - req.body.price) / req.body.oldPrice) * 100);
  }
  db.products[index] = updated;
  saveDb(db);

  res.json({ success: true, product: updated });
});

// Mahsulotni o'chirish
app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

  const deleted = db.products.splice(index, 1);
  saveDb(db);
  res.json({ success: true, message: 'Mahsulot o\'chirildi', product: deleted[0] });
});

// ==========================================
// 5. BUYURTMA VA TO'LOV JARAYONI (Checkout & Orders)
// ==========================================
app.get('/api/orders', (req, res) => {
  const db = getDb();
  const { customerId, courierId, status } = req.query;
  let list = [...db.orders];

  if (customerId) list = list.filter(o => o.customerId === customerId);
  if (courierId) list = list.filter(o => o.courierId === courierId);
  if (status) list = list.filter(o => o.orderStatus === status);

  // Oxirgi buyurtmalar tepada
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, total: list.length, orders: list });
});

app.post('/api/orders', (req, res) => {
  const db = getDb();
  const { 
    customerId, 
    customerName, 
    customerPhone, 
    items, 
    deliveryMethod, 
    deliveryAddress, 
    paymentMethod 
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Savatcha bo\'sh bo\'lishi mumkin emas' });
  }

  // Ombordagi qoldiqni tekshirish va jami summani hisoblash
  let itemsTotal = 0;
  for (const item of items) {
    const prod = db.products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ success: false, message: `Mahsulot topilmadi: ${item.title}` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Omborda mahsulot yetarli emas: ${prod.title} (Mavjud: ${prod.stock} dona)` 
      });
    }
    itemsTotal += prod.price * item.quantity;
  }

  // Yetkazib berish narxini hisoblash
  const settings = db.settings || {};
  let deliveryFee = 0;
  if (deliveryMethod === 'courier') {
    if (itemsTotal >= (settings.freeDeliveryThreshold || 5000000)) {
      deliveryFee = 0; // Bepul yetkazish
    } else {
      deliveryFee = settings.baseDeliveryFee || 25000;
    }
  }

  const totalAmount = itemsTotal + deliveryFee;

  // Ombordan zaxirani kamaytirish (Stock hold/reserve)
  items.forEach(item => {
    const prod = db.products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  const orderNum = Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: `ORD-${orderNum}`,
    customerId: customerId || "usr_customer",
    customerName: customerName || "Hurmatli Mijoz",
    customerPhone: customerPhone || "+998 90 000 00 00",
    items,
    itemsTotal,
    deliveryFee,
    totalAmount,
    deliveryMethod: deliveryMethod || "courier",
    deliveryAddress: deliveryAddress || "Toshkent shahri",
    paymentMethod: paymentMethod || "payme",
    paymentStatus: paymentMethod === "cash" ? "kutilmoqda" : "paid",
    orderStatus: "tayyorlanmoqda",
    courierId: null,
    courierName: null,
    createdAt: new Date().toISOString(),
    fiscalReceiptId: `FISCAL-UZ-2026-${Math.floor(10000 + Math.random() * 90000)}`
  };

  db.orders.unshift(newOrder);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'Buyurtma muvaffaqiyatli qabul qilindi va to\'landi',
    order: newOrder
  });
});

// Buyurtma holatini yangilash (Sotuvchi, Kuryer, Admin)
app.patch('/api/orders/:id/status', (req, res) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });

  const { status, courierId } = req.body;

  if (status) {
    order.orderStatus = status;
    if (status === 'yetkazildi') {
      order.deliveredAt = new Date().toISOString();
      if (order.paymentMethod === 'cash') {
        order.paymentStatus = 'paid';
      }
    }
  }

  if (courierId) {
    const courier = db.users.find(u => u.id === courierId);
    order.courierId = courierId;
    order.courierName = courier ? courier.name : 'Kuryer';
    if (!status) {
      order.orderStatus = 'yolda';
    }
  }

  saveDb(db);
  res.json({ success: true, order });
});

// ==========================================
// 6. ANALITIKA VA STATISTIKA (Admin Dashboard)
// ==========================================
app.get('/api/analytics', (req, res) => {
  const db = getDb();

  const totalOrders = db.orders.length;
  const deliveredOrders = db.orders.filter(o => o.orderStatus === 'yetkazildi');
  const paidOrders = db.orders.filter(o => o.paymentStatus === 'paid');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const averageCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  const activeOrdersCount = db.orders.filter(o => ['tayyorlanmoqda', 'yolda'].includes(o.orderStatus)).length;

  // Eng ko'p sotilgan mahsulotlar hisobi
  const productSalesMap = {};
  db.orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          title: item.title,
          count: 0,
          totalRevenue: 0,
          image: item.image
        };
      }
      productSalesMap[item.productId].count += item.quantity;
      productSalesMap[item.productId].totalRevenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Kategoriya bo'yicha taqsimot
  const categorySales = {};
  db.products.forEach(p => {
    categorySales[p.categoryName] = (categorySales[p.categoryName] || 0) + (p.stock || 0);
  });

  // Kunlik dinamika (so'nggi 7 kunlik simulyatsiya / real)
  const last7Days = [
    { day: "Dushanba", amount: 12500000, orders: 4 },
    { day: "Seshanba", amount: 18200000, orders: 7 },
    { day: "Chorshanba", amount: 14800000, orders: 5 },
    { day: "Payshanba", amount: 22400000, orders: 9 },
    { day: "Juma", amount: 31000000, orders: 12 },
    { day: "Shanba", amount: 28500000, orders: 11 },
    { day: "Yakshanba", amount: totalRevenue > 0 ? totalRevenue : 35000000, orders: totalOrders }
  ];

  res.json({
    success: true,
    summary: {
      totalRevenue,
      formattedRevenue: formatUZS(totalRevenue),
      totalOrders,
      activeOrders: activeOrdersCount,
      averageCheck,
      formattedAverageCheck: formatUZS(averageCheck),
      totalProducts: db.products.length,
      totalUsers: db.users.length
    },
    topProducts,
    categorySales,
    last7Days
  });
});

// ==========================================
// 7. SOZLAMALAR (Settings)
// ==========================================
app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json({ success: true, settings: db.settings });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Smart Market Server muvaffaqiyatli ishga tushdi!`);
  console.log(`🌐 Manzil: http://localhost:${PORT}`);
  console.log(`===============================================`);
});

