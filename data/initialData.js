const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const initialData = {
  users: [
    {
      id: "usr_guest",
      name: "Mehmon Foydalanuvchi",
      role: "mehmon",
      phone: "",
      email: ""
    },
    {
      id: "usr_customer",
      name: "Jasur Rahimov",
      role: "xaridor",
      phone: "+998 90 123 45 67",
      email: "jasur@mail.uz",
      address: "Toshkent sh., Chilonzor tumani, 9-mavze, 14-uy, 28-xonadon",
      balance: 15000000
    },
    {
      id: "usr_seller",
      name: "Otabek Aliyev (TechnoStore MChJ)",
      role: "sotuvchi",
      phone: "+998 97 765 43 21",
      email: "technostore@smartmarket.uz",
      company: "TechnoStore MChJ",
      balance: 48500000
    },
    {
      id: "usr_courier",
      name: "Aziz Karimov",
      role: "kuryer",
      phone: "+998 93 987 65 43",
      vehicle: "Chevrolet Spark (01 A 777 AA)",
      activeDeliveries: 1,
      totalDelivered: 142
    },
    {
      id: "usr_admin",
      name: "Bosh Administrator",
      role: "superadmin",
      phone: "+998 71 200 00 01",
      email: "admin@smartmarket.uz"
    }
  ],
  categories: [
    { id: "cat_all", name: "Barcha kategoriyalar", icon: "grid" },
    { id: "cat_smartphones", name: "Smartfonlar va Gadjetlar", icon: "smartphone" },
    { id: "cat_laptops", name: "Noutbuklar va Kompyuterlar", icon: "laptop" },
    { id: "cat_appliances", name: "Maishiy texnika", icon: "tv" },
    { id: "cat_fashion", name: "Kiyim va Poyabzal", icon: "shirt" },
    { id: "cat_home", name: "Uy va Oshxona", icon: "home" }
  ],
  brands: ["Apple", "Samsung", "Xiaomi", "Artel", "Sony", "LG", "HP", "Nike"],
  products: [
    {
      id: "prod_1",
      title: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
      categoryId: "cat_smartphones",
      categoryName: "Smartfonlar va Gadjetlar",
      brand: "Apple",
      price: 15400000,
      oldPrice: 16800000,
      discount: 8,
      stock: 14,
      rating: 4.9,
      reviewsCount: 38,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      description: "A17 Pro protsessori, titan korpus, 48MP asosiy kamera, 5x optik zoom va USB-C porti bilan eng ilg'or smartfon.",
      specs: {
        "Xotira": "256 GB",
        "Operativ xotira": "8 GB",
        "Ekran": "6.7\" Super Retina XDR OLED 120Hz",
        "Rang": "Natural Titanium",
        "Kafolat": "1 yil rasmiy"
      },
      sellerId: "usr_seller",
      isFeatured: true
    },
    {
      id: "prod_2",
      title: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
      categoryId: "cat_smartphones",
      categoryName: "Smartfonlar va Gadjetlar",
      brand: "Samsung",
      price: 14200000,
      oldPrice: 15500000,
      discount: 8,
      stock: 9,
      rating: 4.8,
      reviewsCount: 29,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
      description: "Galaxy AI imkoniyatlari, o'rnatilgan S-Pen stilus, 200MP kamera va Snapdragon 8 Gen 3 protsessori.",
      specs: {
        "Xotira": "512 GB",
        "Operativ xotira": "12 GB",
        "Ekran": "6.8\" Dynamic AMOLED 2X 120Hz",
        "Rang": "Titanium Gray",
        "Kafolat": "1 yil rasmiy"
      },
      sellerId: "usr_seller",
      isFeatured: true
    },
    {
      id: "prod_3",
      title: "Apple MacBook Pro 14 M3 Pro (18GB / 512GB SSD) Space Black",
      categoryId: "cat_laptops",
      categoryName: "Noutbuklar va Kompyuterlar",
      brand: "Apple",
      price: 24500000,
      oldPrice: 26000000,
      discount: 6,
      stock: 6,
      rating: 5.0,
      reviewsCount: 17,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      description: "Dasturchilar va dizaynerlar uchun eng kuchli MacBook: Liquid Retina XDR displey va 18 soatgacha batareya quvvati.",
      specs: {
        "Protsessor": "Apple M3 Pro 11-core",
        "Operativ xotira": "18 GB Unified Memory",
        "Xotira": "512 GB SSD",
        "Ekran": "14.2\" Liquid Retina XDR",
        "Kafolat": "1 yil"
      },
      sellerId: "usr_seller",
      isFeatured: true
    },
    {
      id: "prod_4",
      title: "Sony WH-1000XM5 Simsiz shovqinni bekor qiluvchi quloqchin",
      categoryId: "cat_smartphones",
      categoryName: "Smartfonlar va Gadjetlar",
      brand: "Sony",
      price: 4300000,
      oldPrice: 4800000,
      discount: 10,
      stock: 22,
      rating: 4.9,
      reviewsCount: 45,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      description: "Sanoatda yetakchi shovqin to'sish (Active Noise Cancelling) texnologiyasi, Hi-Res audio va 30 soat batareya.",
      specs: {
        "Turi": "Simsiz (Bluetooth 5.2)",
        "Batareya": "30 soat",
        "Og'irlik": "250 g",
        "Rang": "Qora / Kumushrang"
      },
      sellerId: "usr_seller",
      isFeatured: false
    },
    {
      id: "prod_5",
      title: "Kir yuvish mashinasi LG AI DD 8.5 kg F4V5VS9B Steam+",
      categoryId: "cat_appliances",
      categoryName: "Maishiy texnika",
      brand: "LG",
      price: 6800000,
      oldPrice: 7400000,
      discount: 8,
      stock: 8,
      rating: 4.7,
      reviewsCount: 21,
      image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80",
      description: "Sun'iy intellekt asosida mato turini aniqlash, bug' yordamida allergenlarni 99.9% yo'qotish va inverter motor.",
      specs: {
        "Yuklash hajmi": "8.5 kg",
        "Aylanish tezligi": "1400 ayl/daq",
        "Energiya toifasi": "A+++",
        "Kafolat": "3 yil to'liq, 10 yil motor"
      },
      sellerId: "usr_seller",
      isFeatured: false
    },
    {
      id: "prod_6",
      title: "Nike Air Max 270 Erkaklar krossovkasi",
      categoryId: "cat_fashion",
      categoryName: "Kiyim va Poyabzal",
      brand: "Nike",
      price: 1650000,
      oldPrice: 1900000,
      discount: 13,
      stock: 18,
      rating: 4.8,
      reviewsCount: 52,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      description: "Maksimal qulaylik va amortizatsiya beruvchi Max Air baloni bilan zamonaviy kundalik va yugurish poyabzali.",
      specs: {
        "O'lcham": "40, 41, 42, 43, 44",
        "Mavsum": "Bahor / Yoz / Kuz",
        "Rang": "Qora-qizil"
      },
      sellerId: "usr_seller",
      isFeatured: true
    }
  ],
  orders: [
    {
      id: "ORD-9201",
      customerId: "usr_customer",
      customerName: "Jasur Rahimov",
      customerPhone: "+998 90 123 45 67",
      items: [
        {
          productId: "prod_4",
          title: "Sony WH-1000XM5 Simsiz shovqinni bekor qiluvchi quloqchin",
          price: 4300000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
        }
      ],
      totalAmount: 4325000,
      itemsTotal: 4300000,
      deliveryFee: 25000,
      deliveryMethod: "courier",
      deliveryAddress: "Toshkent sh., Chilonzor tumani, 9-mavze, 14-uy",
      paymentMethod: "payme",
      paymentStatus: "paid",
      orderStatus: "yetkazildi",
      courierId: "usr_courier",
      courierName: "Aziz Karimov",
      createdAt: "2026-11-03T10:15:00Z",
      deliveredAt: "2026-11-03T14:40:00Z",
      fiscalReceiptId: "FISCAL-UZ-2026-88192"
    },
    {
      id: "ORD-9202",
      customerId: "usr_customer",
      customerName: "Jasur Rahimov",
      customerPhone: "+998 90 123 45 67",
      items: [
        {
          productId: "prod_6",
          title: "Nike Air Max 270 Erkaklar krossovkasi",
          price: 1650000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
        }
      ],
      totalAmount: 1675000,
      itemsTotal: 1650000,
      deliveryFee: 25000,
      deliveryMethod: "courier",
      deliveryAddress: "Toshkent sh., Yunusobod 4-mavze, 12-uy",
      paymentMethod: "click",
      paymentStatus: "paid",
      orderStatus: "yolda",
      courierId: "usr_courier",
      courierName: "Aziz Karimov",
      createdAt: "2026-11-04T09:30:00Z",
      fiscalReceiptId: "FISCAL-UZ-2026-88204"
    },
    {
      id: "ORD-9203",
      customerId: "usr_customer",
      customerName: "Dilshod Mahmudov",
      customerPhone: "+998 99 876 54 32",
      items: [
        {
          productId: "prod_1",
          title: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
          price: 15400000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
        }
      ],
      totalAmount: 15400000,
      itemsTotal: 15400000,
      deliveryFee: 0,
      deliveryMethod: "pvz",
      deliveryAddress: "Toshkent sh., Smart Market PVZ #3 (Amir Temur shoh ko'chasi)",
      paymentMethod: "click",
      paymentStatus: "paid",
      orderStatus: "tayyorlanmoqda",
      courierId: null,
      courierName: null,
      createdAt: "2026-11-04T12:05:00Z",
      fiscalReceiptId: "FISCAL-UZ-2026-88219"
    }
  ],
  settings: {
    baseDeliveryFee: 25000,
    freeDeliveryThreshold: 5000000,
    deliveryPerKm: 3000,
    pvzList: [
      { id: "pvz_1", name: "PVZ #1 - Chilonzor savdo markazi", address: "Chilonzor 7-mavze, 2-uy" },
      { id: "pvz_2", name: "PVZ #2 - Yunusobod Mega Planet yaqinida", address: "Ahmad Donish ko'chasi, 15" },
      { id: "pvz_3", name: "PVZ #3 - Amir Temur shoh ko'chasi", address: "Amir Temur ko'chasi, 88" }
    ],
    supportedPaymentMethods: ["payme", "click", "uzum", "visa", "cash"]
  }
};

function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log("Database initialized at:", DB_PATH);
  } else {
    console.log("Database already exists at:", DB_PATH);
  }
}

module.exports = { initialData, initDb, DB_PATH };

