# “Smart Market” — Elektron Savdo (E-commerce) Platformasi

Zamonaviy, xavfsiz va kengaytiriluvchi ko‘p rolli elektron savdo ekotizimi.

---

## 🚀 Tizimni ishga tushirish

Loyiha serveri hozirda ishlamoqda!

Brauzeringizda quyidagi manzilni oching:
👉 **[http://localhost:3000](http://localhost:3000)**

Serverni qayta ishga tushirish uchun:
```bash
npm start
```

---

## 👥 5 ta Rol Imkoniyatlari va Sinov Jarayoni

Platformaning yuqori qismidagi maxsus **Rol tanlagich (Role Switcher)** orqali quyidagi 5 ta rolni darhol sinab ko'rishingiz mumkin:

1. **🛒 Mehmon (Ro‘yxatdan o‘tmagan):**
   - Tovar katalogini ko‘rish, aqlli qidiruv, toifalar bo‘yicha filtrlash.
   - Tovarlarni savatchaga yig‘ish.
2. **👤 Xaridor (Jasur Rahimov):**
   - Buyurtmani rasmiylashtirish (Checkout).
   - Yetkazish usulini tanlash (Kuryer yoki PVZ punkti).
   - Onlayn to‘lov (Payme, Click, Uzum yoki Naqd).
   - Real vaqt rejimida buyurtma statusini kuzatish (Tayyorlanmoqda ➔ Yo‘lda ➔ Yetkazildi) va elektron fiskal chekni ko‘rish.
3. **📦 Sotuvchi (TechnoStore MChJ):**
   - Ombor qoldiqlarini nazorat qilish (Stock).
   - Yangi mahsulot qo‘shish va mavjudlarini tahrirlash.
   - Bitta bosishda zaxirani to‘ldirish (+5, +10 dona).
   - Yangi buyurtmalarni qadoqlashga tasdiqlash.
4. **🚚 Kuryer (Aziz Karimov - Chevrolet Spark):**
   - Biriktirilgan buyurtmalarni qabul qilish (`Qabul qildim`).
   - Mijoz manzili va telefoniga qarab yetkazib berish.
   - `Yetkazib berildi` deb tasdiqlash.
5. **⚡ Superadmin (Bosh Administrator):**
   - Kunlik/haftalik savdo aylanmasi grafiklari (Chart.js).
   - Moliyaviy ko‘rsatkichlar (Aylanma, Sof tushum, O‘rtacha chek).
   - Eng ko‘p sotilayotgan Top-5 mahsulotlar reytingi.
   - Rollar va huquqlar matritsasi.
   - Ma'lumotlarni **Excel (CSV)** formatida eksport qilish va **Chop etish (PDF)**.

---

## 📑 Hujjatlar
- [1-QADAM: Loyihaning umumiy tavsifi, maqsadi va tizim ishtirokchilari](docs/1-qadam-loyiha-tavsifi.md)
- [2-QADAM: Tizim arxitekturasi, texnologiyalar steki va ma'lumotlar modeli](docs/2-qadam-arxitektura-va-texnologiyalar.md)
- [3-QADAM: Ma'lumotlar bazasi loyihasi (Database Schema)](docs/3-qadam-malumotlar-bazasi.md)
- [4-QADAM: Tizim arxitekturasi, integratsiyalar va axborot xavfsizligi talablari](docs/4-qadam-arxitektura-va-xavfsizlik.md)
- [5-QADAM: Interfeys (UI/UX) talablari, sinovdan o'tkazish va topshirish tartibi](docs/5-qadam-interfeys-va-sinov.md)
- [SQL DDL Skripti (schema.sql)](schema.sql)
- [Muhit parametrlari shabloni (.env.example)](.env.example)
- [Docker & Servislar konteyneri (docker-compose.yml)](docker-compose.yml)

## 🧪 Avtomatlashtirilgan Testlar
Tizimning barcha 7 ta asosiy moduli (katalog, savatcha, ombor qoldig'i, to'lov, kuryer, statuslar va analitika) bo'yicha integratsion testlarni ishga tushirish:
```bash
npm test
```
