const fs = require('fs');
const path = require('path');
const { getDb, saveDb } = require('./db');

const categories = [
  { id: "cat_all", name: "Barcha toifalar", icon: "grid" },
  { id: "cat_smartphones", name: "Smartfon va Gadjetlar", icon: "smartphone" },
  { id: "cat_laptops", name: "Noutbuk va Kompyuterlar", icon: "laptop" },
  { id: "cat_appliances", name: "Maishiy texnika", icon: "tv" },
  { id: "cat_fashion", name: "Kiyim va Poyabzal", icon: "shirt" },
  { id: "cat_home", name: "Uy va Oshxona", icon: "home" },
  { id: "cat_beauty", name: "Go'zallik va Parvarish", icon: "sparkles" },
  { id: "cat_books", name: "Kitoblar va Kanselyariya", icon: "book" },
  { id: "cat_auto", name: "Avtotovarlar", icon: "car" }
];

const brands = [
  "Apple", "Samsung", "Xiaomi", "Artel", "Sony", "LG", "HP", "Lenovo", "Asus", 
  "Nike", "Adidas", "Puma", "Bosch", "Tefal", "Philips", "Dyson", "Baseus", "Anker"
];

// Curated high quality Unsplash product images
const images = {
  smartphones: [
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
  ],
  laptops: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80"
  ],
  appliances: [
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80"
  ],
  fashion: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80"
  ],
  home: [
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop&q=80"
  ],
  beauty: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=80"
  ],
  books: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"
  ],
  auto: [
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80"
  ]
};

// Item templates to build 500+ diverse products
const productTemplates = [
  // SMARTPHONES & GADGETS (100+)
  {
    category: "cat_smartphones",
    categoryName: "Smartfon va Gadjetlar",
    imgKey: "smartphones",
    items: [
      { name: "Apple iPhone 15 Pro Max", brand: "Apple", price: 15400000, variants: ["256GB Natural Titanium", "512GB Blue Titanium", "1TB Black Titanium", "256GB White Titanium"] },
      { name: "Apple iPhone 15 Pro", brand: "Apple", price: 13800000, variants: ["128GB Black", "256GB Blue", "512GB Natural", "128GB White"] },
      { name: "Apple iPhone 15", brand: "Apple", price: 10200000, variants: ["128GB Pink", "256GB Blue", "128GB Green", "128GB Black", "256GB Yellow"] },
      { name: "Apple iPhone 14", brand: "Apple", price: 8900000, variants: ["128GB Starlight", "128GB Midnight", "256GB Purple", "128GB Blue"] },
      { name: "Apple iPhone 13", brand: "Apple", price: 7400000, variants: ["128GB Midnight", "128GB Starlight", "256GB Green"] },
      { name: "Samsung Galaxy S24 Ultra", brand: "Samsung", price: 14200000, variants: ["12/256GB Titanium Gray", "12/512GB Titanium Black", "12/1TB Titanium Violet", "12/512GB Titanium Yellow"] },
      { name: "Samsung Galaxy S24 Plus", brand: "Samsung", price: 11200000, variants: ["12/256GB Onyx Black", "12/512GB Marble Gray", "12/256GB Cobalt Violet"] },
      { name: "Samsung Galaxy S24", brand: "Samsung", price: 9100000, variants: ["8/128GB Onyx Black", "8/256GB Amber Yellow", "8/256GB Marble Gray"] },
      { name: "Samsung Galaxy A55 5G", brand: "Samsung", price: 4400000, variants: ["8/128GB Awesome Iceblue", "8/256GB Awesome Navy", "8/256GB Awesome Lilac"] },
      { name: "Samsung Galaxy A35 5G", brand: "Samsung", price: 3400000, variants: ["6/128GB Awesome Navy", "8/256GB Awesome Lemon"] },
      { name: "Xiaomi 14 Ultra", brand: "Xiaomi", price: 13500000, variants: ["16/512GB Leica Black", "16/512GB Leica White"] },
      { name: "Xiaomi 14", brand: "Xiaomi", price: 8800000, variants: ["12/256GB Black", "12/512GB Jade Green", "12/512GB White"] },
      { name: "Xiaomi Redmi Note 13 Pro+ 5G", brand: "Xiaomi", price: 4600000, variants: ["8/256GB Midnight Black", "12/512GB Aurora Purple"] },
      { name: "Xiaomi Redmi Note 13 Pro", brand: "Xiaomi", price: 3200000, variants: ["8/128GB Midnight Black", "8/256GB Forest Green"] },
      { name: "Xiaomi Redmi Note 13", brand: "Xiaomi", price: 2300000, variants: ["6/128GB Mint Green", "8/256GB Ocean Sunset"] },
      { name: "Apple Watch Series 9 GPS", brand: "Apple", price: 4900000, variants: ["41mm Starlight Sport", "45mm Midnight Sport", "45mm Silver Sport"] },
      { name: "Apple Watch Ultra 2", brand: "Apple", price: 9800000, variants: ["49mm Titanium Alpine Loop", "49mm Trail Loop", "49mm Ocean Band"] },
      { name: "Samsung Galaxy Watch 6", brand: "Samsung", price: 3200000, variants: ["40mm Graphite", "44mm Silver", "44mm Classic Black"] },
      { name: "Apple AirPods Pro 2 (USB-C)", brand: "Apple", price: 2900000, variants: ["MagSafe Case USB-C"] },
      { name: "Apple AirPods 3", brand: "Apple", price: 2100000, variants: ["Lightning Case", "MagSafe Case"] },
      { name: "Sony WH-1000XM5", brand: "Sony", price: 4300000, variants: ["Black Edition", "Silver Platinum", "Midnight Blue"] },
      { name: "Anker PowerCore 20000mAh", brand: "Anker", price: 420000, variants: ["PowerIQ 20W Black", "PowerIQ 20W White"] },
      { name: "Baseus Blade 100W Powerbank", brand: "Baseus", price: 780000, variants: ["20000mAh Ultra-Slim", "Blade HD 100W"] },
      { name: "Xiaomi Smart Band 8", brand: "Xiaomi", price: 380000, variants: ["Black TPU", "Gold Leather", "Graphite Metal"] }
    ]
  },

  // LAPTOPS & COMPUTERS (90+)
  {
    category: "cat_laptops",
    categoryName: "Noutbuk va Kompyuterlar",
    imgKey: "laptops",
    items: [
      { name: "Apple MacBook Pro 14 M3 Pro", brand: "Apple", price: 24500000, variants: ["18GB/512GB Space Black", "18GB/1TB Silver", "36GB/1TB Space Black"] },
      { name: "Apple MacBook Pro 16 M3 Max", brand: "Apple", price: 39000000, variants: ["36GB/1TB Space Black", "48GB/1TB Silver"] },
      { name: "Apple MacBook Air 13 M3", brand: "Apple", price: 13900000, variants: ["8GB/256GB Midnight", "8GB/512GB Starlight", "16GB/512GB Space Gray"] },
      { name: "Apple MacBook Air 15 M3", brand: "Apple", price: 16500000, variants: ["8GB/256GB Silver", "16GB/512GB Midnight"] },
      { name: "Asus ROG Zephyrus G16", brand: "Asus", price: 23000000, variants: ["Intel Core Ultra 9 / RTX 4080 / 32GB", "Intel Core Ultra 7 / RTX 4070 / 16GB"] },
      { name: "Asus TUF Gaming A15", brand: "Asus", price: 11500000, variants: ["Ryzen 7 / RTX 4060 / 16GB / 512GB", "Ryzen 5 / RTX 4050 / 16GB"] },
      { name: "Lenovo Legion Pro 5", brand: "Lenovo", price: 17800000, variants: ["i7-14700HX / RTX 4070 / 32GB", "Ryzen 7 / RTX 4060 / 16GB"] },
      { name: "Lenovo IdeaPad Slim 3", brand: "Lenovo", price: 5400000, variants: ["Core i5-1335U / 8GB / 512GB", "Core i3-1305U / 8GB / 256GB"] },
      { name: "HP Victus 16 Gaming", brand: "HP", price: 10800000, variants: ["Core i5-13500H / RTX 4050 / 16GB", "Ryzen 7 / RTX 4060 / 16GB"] },
      { name: "HP Pavilion 15 Silver", brand: "HP", price: 6200000, variants: ["Core i5 / 16GB / 512GB SSD", "Ryzen 5 / 8GB / 512GB"] },
      { name: "Samsung Odyssey G7 32\" 240Hz Curved", brand: "Samsung", price: 7900000, variants: ["QLED WQHD 1ms", "4K 144Hz"] },
      { name: "LG UltraGear 27\" QHD Nano IPS", brand: "LG", price: 4600000, variants: ["165Hz 1ms G-Sync", "240Hz OLED"] },
      { name: "Apple Magic Keyboard with Touch ID", brand: "Apple", price: 1850000, variants: ["White Numeric", "Space Gray Numeric"] },
      { name: "Logitech MX Master 3S Wireless Mouse", brand: "Logitech", price: 1250000, variants: ["Graphite", "Pale Gray"] },
      { name: "Xiaomi Curved Gaming Monitor 34\"", brand: "Xiaomi", price: 4100000, variants: ["WQHD 144Hz FreeSync"] }
    ]
  },

  // HOME APPLIANCES (80+)
  {
    category: "cat_appliances",
    categoryName: "Maishiy texnika",
    imgKey: "appliances",
    items: [
      { name: "Artel Grand Inverter Muzlatgich", brand: "Artel", price: 6200000, variants: ["420L NoFrost Qora oynali", "380L Kumushrang", "460L Inverter Inox"] },
      { name: "Samsung Bespoke No Frost Muzlatgich", brand: "Samsung", price: 12500000, variants: ["Dual Zone Oq/Pushti", "SpaceMax Qora shisha"] },
      { name: "LG AI DD 8.5 kg Kir yuvish mashinasi", brand: "LG", price: 6800000, variants: ["Steam+ Qora titan", "Steam+ Oq rangli"] },
      { name: "Bosch Serie 6 Kir yuvish mashinasi 9kg", brand: "Bosch", price: 8300000, variants: ["EcoSilence Drive Oq", "Inox AntiStain"] },
      { name: "Artel Fresco Konditsioner Inverter", brand: "Artel", price: 4900000, variants: ["12 BTU Wi-Fi Oq", "18 BTU Inverter Oq", "24 BTU Inverter"] },
      { name: "LG Dual Inverter Konditsioner", brand: "LG", price: 7200000, variants: ["12 BTU Ionizer Oq", "18 BTU Wi-Fi ThinQ"] },
      { name: "Dyson V15 Detect Simsiz Changyutgich", brand: "Dyson", price: 9200000, variants: ["Absolute Laser Gold", "Complete Extra"] },
      { name: "Xiaomi Robot Vacuum S10+ Smart Tozalagich", brand: "Xiaomi", price: 3400000, variants: ["Mop 2 Pro Laser", "S10+ Dual Spin"] },
      { name: "Philips Airfryer XXL Yog'siz qovurish pechi", brand: "Philips", price: 2400000, variants: ["7.3L Connected Qora", "5.6L Digital"] },
      { name: "Tefal OptiGrill Elite Aqlli Elektr Grill", brand: "Tefal", price: 2900000, variants: ["Snack & Baking to'plami bilan", "Standart Inox"] },
      { name: "Artel Mikroto'lqinli pech 23L", brand: "Artel", price: 950000, variants: ["Grill funksiyali Qora", "Elektron displeyli Oq"] },
      { name: "Bosch Oziq-ovqat kombayni MUM5", brand: "Bosch", price: 3100000, variants: ["1000W 3.9L Qizil", "1000W Kumushrang"] }
    ]
  },

  // FASHION & SHOES (80+)
  {
    category: "cat_fashion",
    categoryName: "Kiyim va Poyabzal",
    imgKey: "fashion",
    items: [
      { name: "Nike Air Max 270 Erkaklar krossovkasi", brand: "Nike", price: 1650000, variants: ["Qora/Qizil 41-44", "Oq/Havorang 40-43", "To'liq qora 42-45"] },
      { name: "Nike Air Force 1 '07 Classic", brand: "Nike", price: 1450000, variants: ["Triple White 40-45", "Black Leather 41-44"] },
      { name: "Adidas Ultraboost Light Yugurish poyabzali", brand: "Adidas", price: 1950000, variants: ["Core Black 41-44", "Cloud White 40-43"] },
      { name: "Adidas Samba OG Retro Krossovka", brand: "Adidas", price: 1350000, variants: ["Oq qora chiziqli 40-44", "Qora oq chiziqli 41-45"] },
      { name: "Puma RS-X Efekt Kundalik Krossovka", brand: "Puma", price: 1150000, variants: ["Triple Black 41-44", "Multi-Color 40-43"] },
      { name: "Nike Sportswear Club Fleece Hudi", brand: "Nike", price: 680000, variants: ["Qora S-XXL", "Kulrang S-XL", "To'q ko'k M-XXL"] },
      { name: "Adidas Essentials 3-Stripes Sport shimi", brand: "Adidas", price: 540000, variants: ["Qora oq chiziqli M-XL", "Kulrang S-L"] },
      { name: "Columbia Bugaboo II Qishki Issiq Kurtka", brand: "Columbia", price: 2300000, variants: ["Omni-Heat Qora M-XXL", "To'q ko'k L-XL"] },
      { name: "Puma Phase Ryukzak Maktab va Sayohat uchun", brand: "Puma", price: 320000, variants: ["Qora 22L", "To'q ko'k 22L", "Pushti 22L"] },
      { name: "Zara Erkaklar Klassik Jun Palto", brand: "Zara", price: 1850000, variants: ["Qora 48-54", "Jigarrang 50-52"] }
    ]
  },

  // HOME & KITCHEN (60+)
  {
    category: "cat_home",
    categoryName: "Uy va Oshxona",
    imgKey: "home",
    items: [
      { name: "Tefal Ingenio Oshxona Idishlar to'plami 10 dona", brand: "Tefal", price: 1850000, variants: ["Titanium olinadigan tutqichli", "Induction zanglamas po'lat"] },
      { name: "Granit Qozon va Tovalar To'plami 7 dona", brand: "Smart Market", price: 890000, variants: ["Qora marmar naqshli", "Kulrang granit"] },
      { name: "Oshxona Pichoqlar to'plami yog'och taglikda", brand: "BergHOFF", price: 720000, variants: ["6 bo'lakli Zanglamas", "8 bo'lakli Professional"] },
      { name: "Premium Saten Yotoq Choyshablari To'plami", brand: "TAC", price: 650000, variants: ["Evro o'lcham Bej", "Evro Zangori gul", "Oilaviy to'plam"] },
      { name: "Bambukdan tayyorlangan Yumshoq Sochiqlar to'plami", brand: "Chust Tekstil", price: 240000, variants: ["4 dona Katta hammom", "6 dona Yuz va qo'l"] },
      { name: "Smart LED Zamin Chirog'i (RGB Torcher)", brand: "Yeelight", price: 580000, variants: ["Wi-Fi App boshqaruvli", "Pultli versiya"] }
    ]
  },

  // BEAUTY & HEALTH (50+)
  {
    category: "cat_beauty",
    categoryName: "Go'zallik va Parvarish",
    imgKey: "beauty",
    items: [
      { name: "Dyson Airwrap Multi-Styler Soch turmaklash to'plami", brand: "Dyson", price: 7600000, variants: ["Nickel/Copper Long", "Ceramic Pink"] },
      { name: "Dyson Supersonic Fen HD08", brand: "Dyson", price: 5400000, variants: ["Iron/Fuchsia", "Onyx Black"] },
      { name: "Philips Series 7000 Erkaklar Elektr Soqol mashinasi", brand: "Philips", price: 1650000, variants: ["SkinIQ Nam va quruq", "Trimmer qo'shimchasi bilan"] },
      { name: "Braun Silk-expert Pro 5 Fotoepilyator", brand: "Braun", price: 4800000, variants: ["IPL Oq/Oltin sumka bilan"] },
      { name: "Oral-B iO Series 9 Elektr Tish Cho'tkasi", brand: "Oral-B", price: 2400000, variants: ["Black Onyx 3D Sense", "Rose Quartz"] },
      { name: "Bleu de Chanel Eau de Parfum 100ml", brand: "Chanel", price: 2100000, variants: ["100ml Original EDP", "50ml Spray"] }
    ]
  },

  // BOOKS & STATIONERY (40+)
  {
    category: "cat_books",
    categoryName: "Kitoblar va Kanselyariya",
    imgKey: "books",
    items: [
      { name: "Atom Odatlar (Atomic Habits) - Jeyms Klir", brand: "Hilol Nashr", price: 65000, variants: ["Qattiq muqova O'zbekcha", "Yumshoq muqova"] },
      { name: "Stiv Jobs - Uolter Ayzekson Tarjimai holi", brand: "Asaxiy Books", price: 125000, variants: ["To'liq nashr Qattiq muqova"] },
      { name: "Dengizchi Bo'lmoqchi Bo'lsangiz To'shagingizni Yig'ing", brand: "Nihol", price: 48000, variants: ["O'zbek tilida"] },
      { name: "Boy Ota, Kambag'al Ota - Robert Kiyosaki", brand: "Asaxiy Books", price: 55000, variants: ["Yangi nashr"] },
      { name: "ErichKrause Professional Ofis Kanselyariya to'plami", brand: "ErichKrause", price: 180000, variants: ["Katta biznes to'plam"] }
    ]
  },

  // AUTO ACCESSORIES (40+)
  {
    category: "cat_auto",
    categoryName: "Avtotovarlar",
    imgKey: "auto",
    items: [
      { name: "70mai Dash Cam Omni X200 360° Videoregistrator", brand: "Xiaomi", price: 1750000, variants: ["64GB eMMC 4G Hardwire", "128GB Black"] },
      { name: "Baseus Simsiz Avtomobil Changyutgichi A3", brand: "Baseus", price: 460000, variants: ["15000Pa Metal korpus", "A2 Pro 6000Pa"] },
      { name: "Avtomobil uchun Magnitli Simsiz Zaryadlash ushlagichi MagSafe", brand: "Baseus", price: 290000, variants: ["15W Ventilyatsiyaga", "Torpedo taglikli"] },
      { name: "Baseus Super Energy Car Jump Starter (Akkumulyator pusk)", brand: "Baseus", price: 680000, variants: ["12000mAh 1000A", "20000mAh 2000A"] },
      { name: "Chevrolet Onix / Tracker 3D Eva Avtomobil Poliklari", brand: "Smart Market", price: 340000, variants: ["Qora qizil chokli", "To'liq qora bortli"] }
    ]
  }
];

function generate500Products() {
  const allProducts = [];
  let prodIndex = 1;

  for (const group of productTemplates) {
    const imgList = images[group.imgKey] || images.smartphones;

    for (const item of group.items) {
      for (const variant of item.variants) {
        const fullTitle = `${item.name} (${variant})`;
        const imgUrl = imgList[(prodIndex - 1) % imgList.length];
        
        // Random variations in price, stock, ratings to make dataset realistic
        const priceJitter = Math.floor(Math.random() * 5) * 50000;
        const finalPrice = Math.max(50000, item.price + (prodIndex % 2 === 0 ? priceJitter : -priceJitter));
        const discountPct = (prodIndex % 4 === 0) ? (5 + (prodIndex % 15)) : 0;
        const oldPrice = discountPct > 0 ? Math.round(finalPrice / (1 - discountPct / 100)) : finalPrice;
        const stock = (prodIndex % 18 === 0) ? 0 : Math.floor(4 + Math.random() * 35);
        const rating = Number((4.3 + Math.random() * 0.7).toFixed(1));
        const reviewsCount = Math.floor(5 + Math.random() * 85);

        allProducts.push({
          id: `prod_${prodIndex}`,
          title: fullTitle,
          categoryId: group.category,
          categoryName: group.categoryName,
          brand: item.brand,
          price: finalPrice,
          oldPrice: oldPrice,
          discount: discountPct,
          stock: stock,
          rating: rating > 5.0 ? 5.0 : rating,
          reviewsCount: reviewsCount,
          image: imgUrl,
          description: `${item.brand} brendidan rasmiy kafolatga ega ${fullTitle}. O'zbekiston bo'ylab tezkor yetkazib berish xizmati mavjud.`,
          specs: {
            "Brend": item.brand,
            "Model / Variant": variant,
            "Holati": "Yangi, qadoqda",
            "Kafolat": "1 yil rasmiy servis kafolati"
          },
          sellerId: "usr_seller",
          isFeatured: prodIndex <= 20,
          createdAt: new Date(Date.now() - prodIndex * 3600000).toISOString()
        });

        prodIndex++;
      }
    }
  }

  // If still less than 520, clone templates with additional color/size variations
  let repeatCycle = 1;
  while (allProducts.length < 520) {
    for (const group of productTemplates) {
      if (allProducts.length >= 520) break;
      const imgList = images[group.imgKey] || images.smartphones;
      for (const item of group.items) {
        if (allProducts.length >= 520) break;
        const v = item.variants[0];
        const extraTitle = `${item.name} Series ${repeatCycle + 1} (${v} - Edition ${repeatCycle})`;
        const imgUrl = imgList[prodIndex % imgList.length];
        const finalPrice = item.price + (repeatCycle * 30000);
        const stock = Math.floor(6 + Math.random() * 40);

        allProducts.push({
          id: `prod_${prodIndex}`,
          title: extraTitle,
          categoryId: group.category,
          categoryName: group.categoryName,
          brand: item.brand,
          price: finalPrice,
          oldPrice: finalPrice,
          discount: 0,
          stock: stock,
          rating: 4.8,
          reviewsCount: Math.floor(10 + Math.random() * 40),
          image: imgUrl,
          description: `${item.brand} sifat kafolati bilan yangilangan to'plam.`,
          specs: {
            "Brend": item.brand,
            "Seriya": `Edition ${repeatCycle}`,
            "Kafolat": "12 oy rasmiy"
          },
          sellerId: "usr_seller",
          isFeatured: false,
          createdAt: new Date(Date.now() - prodIndex * 1800000).toISOString()
        });
        prodIndex++;
      }
    }
    repeatCycle++;
  }

  return allProducts;
}

// Update DB
const db = getDb();
db.categories = categories;
db.brands = brands;
const generated = generate500Products();
db.products = generated;

saveDb(db);
console.log(`===============================================`);
console.log(`✅ Muvaffaqiyatli: ${generated.length} ta mahsulot bazaga qo'shildi!`);
console.log(`📦 Jami kategoriyalar soni: ${categories.length}`);
console.log(`===============================================`);

