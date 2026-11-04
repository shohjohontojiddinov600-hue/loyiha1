// Smart Market - Avtomatlashtirilgan Funksional va Integratsiya Testlari
// 5.2-band talablari asosida

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log("==================================================");
  console.log("🧪 SMART MARKET AVTOMATLASHGAN TESTLARNI BOSHLASH");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [O'TDI] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [XATOLIK] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Tizim salomatligi (Healthcheck)
  await test("1. Tizim salomatligi (GET /api/health)", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error("Server holati online emas");
  });

  // 2. Mahsulotlar katalogi va filtrlash
  await test("2. Mahsulotlar katalogi (GET /api/products)", async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.products) || data.products.length === 0) {
      throw new Error("Mahsulotlar ro'yxati qaytmadi");
    }
  });

  // 3. Kategoriyalar va brendlar
  await test("3. Kategoriyalar ro'yxati (GET /api/categories)", async () => {
    const res = await fetch(`${BASE_URL}/api/categories`);
    const data = await res.json();
    if (!data.success || data.categories.length === 0) {
      throw new Error("Kategoriyalar ro'yxati bo'sh");
    }
  });

  // 4. Foydalanuvchilar va 5 ta rol
  await test("4. Foydalanuvchilar va rollar mavjudligi (GET /api/users)", async () => {
    const res = await fetch(`${BASE_URL}/api/users`);
    const data = await res.json();
    const roles = data.users.map(u => u.role);
    if (!roles.includes('mehmon') || !roles.includes('xaridor') || !roles.includes('sotuvchi') || !roles.includes('kuryer') || !roles.includes('superadmin')) {
      throw new Error("5 ta asosiy rol to'liq emas");
    }
  });

  // 5. Buyurtma berish va Ombordan zaxirani hisobdan chiqarish (Checkout)
  let createdOrderId = null;
  await test("5. Buyurtmani rasmiylashtirish va Ombor zaxirasini kamaytirish (POST /api/orders)", async () => {
    // Avval birinchi mahsulotning dastlabki zaxirasini olamiz
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodData = await prodRes.json();
    const sampleProduct = prodData.products[0];
    const initialStock = sampleProduct.stock;

    if (initialStock <= 0) throw new Error("Mahsulot omborda yetarli emas");

    // Buyurtma yaratamiz
    const orderPayload = {
      customerId: "usr_customer",
      customerName: "Test Sinovchi",
      customerPhone: "+998 90 999 99 99",
      deliveryMethod: "courier",
      deliveryAddress: "Toshkent sh., Test ko'chasi 1-uy",
      paymentMethod: "click",
      items: [
        {
          productId: sampleProduct.id,
          title: sampleProduct.title,
          price: sampleProduct.price,
          quantity: 1,
          image: sampleProduct.image
        }
      ]
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (!data.success || !data.order || !data.order.id) {
      throw new Error(data.message || "Buyurtma yaratilmadi");
    }

    createdOrderId = data.order.id;

    // Ombordagi zaxira 1 taga kamayganligini tekshiramiz
    const checkRes = await fetch(`${BASE_URL}/api/products/${sampleProduct.id}`);
    const checkData = await checkRes.json();
    if (checkData.product.stock !== initialStock - 1) {
      throw new Error(`Ombor zaxirasi noto'g'ri yangilandi. Kutilgan: ${initialStock - 1}, Hozirgi: ${checkData.product.stock}`);
    }
  });

  // 6. Buyurtma statusini bosqichma-bosqich yangilash (Logistika zanjiri)
  await test("6. Buyurtma holati: Tayyorlanmoqda -> Yo'lda -> Yetkazildi (PATCH /api/orders/:id/status)", async () => {
    if (!createdOrderId) throw new Error("Sinov buyurtmasi mavjud emas");

    // 1-bosqich: Kuryer biriktirish va "Yo'lda"
    const patch1 = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'yolda', courierId: 'usr_courier' })
    });
    const d1 = await patch1.json();
    if (d1.order.orderStatus !== 'yolda' || !d1.order.courierId) {
      throw new Error("Kuryerga biriktirishda xatolik");
    }

    // 2-bosqich: "Yetkazib berildi"
    const patch2 = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'yetkazildi' })
    });
    const d2 = await patch2.json();
    if (d2.order.orderStatus !== 'yetkazildi' || !d2.order.deliveredAt) {
      throw new Error("Yetkazib berildi holatiga o'tishda xatolik");
    }
  });

  // 7. Savdo statistikasi va analitika (Superadmin Dashboard)
  await test("7. Savdo statistikasi va hisobot hisobi (GET /api/analytics)", async () => {
    const res = await fetch(`${BASE_URL}/api/analytics`);
    const data = await res.json();
    if (!data.success || !data.summary || data.summary.totalRevenue <= 0) {
      throw new Error("Savdo aylanmasi hisobida xatolik");
    }
  });

  console.log("==================================================");
  console.log(`🏁 NATIJALAR: ${passed} ta test muvaffaqiyatli o'tdi, ${failed} ta xato.`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runTests();

