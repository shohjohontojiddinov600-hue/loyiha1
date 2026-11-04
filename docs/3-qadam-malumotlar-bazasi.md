# 3-QADAM. MA’LUMOTLAR BAZASI LOYIHASI (DATABASE SCHEMA)

**Loyiha:** “Smart Market” — elektron savdo platformasi  
**Ma’lumotlar bazasi turi:** Relyatsion (Relational DB — PostgreSQL / MySQL)  

---

## 1. Asosiy jadvallar va ularning tuzilmasi

### 1. `users` (Foydalanuvchilar jadvali)
Tizimdagi barcha ro‘yxatdan o‘tgan shaxslar (Mijoz, Sotuvchi, Kuryer, Admin) haqidagi ma’lumotlarni saqlaydi.
- **PK:** `id`
- **Asosiy ustunlar:** `phone` (UNIQUE), `email`, `password_hash`, `full_name`, `role` (`CUSTOMER`, `SELLER`, `COURIER`, `ADMIN`), `is_active`, `created_at`.

### 2. `categories` (Kategoriyalar jadvali)
Mahsulotlarning ko‘p pog‘onali iyerarxik tuzilmasini ta’minlaydi.
- **PK:** `id`
- **FK:** `parent_id` -> `categories.id` (Self-referencing)
- **Asosiy ustunlar:** `name_uz`, `name_ru`, `slug` (UNIQUE), `image_url`.

### 3. `products` (Mahsulotlar katalogi)
Sotuvdagi mahsulotlarning asosiy umumiy ma’lumotlarini saqlaydi.
- **PK:** `id`
- **FK:** `category_id` -> `categories.id`
- **Asosiy ustunlar:** `name_uz`, `name_ru`, `slug` (UNIQUE), `description_uz`, `description_ru`, `brand`, `rating`, `created_at`.

### 4. `product_variants` (Mahsulot variantlari va Ombor zaxirasi — SKU)
Bitta mahsulotning rang, o‘lcham yoki xotira bo‘yicha turlari, ularning narxi va ombordagi sonini boshqaradi.
- **PK:** `id`
- **FK:** `product_id` -> `products.id`
- **Asosiy ustunlar:** `sku` (UNIQUE), `attributes` (JSON), `price`, `old_price`, `stock_quantity`, `reserved_quantity`.

### 5. `cart_items` (Savatcha jadvali)
Mijozlar buyurtma berishdan oldin tanlagan vaqtincha mahsulotlari.
- **PK:** `id`
- **FKlar:** `user_id` -> `users.id`, `product_variant_id` -> `product_variants.id`
- **Asosiy ustunlar:** `quantity`.

### 6. `orders` (Buyurtmalar boshshag‘i)
Rasmiylashtirilgan buyurtmalarning umumiy holati va moliyaviy ma’lumotlari.
- **PK:** `id`
- **FKlar:** `user_id` -> `users.id`, `courier_id` -> `users.id`
- **Asosiy ustunlar:** `status`, `total_amount`, `delivery_fee`, `discount_amount`, `final_amount`, `payment_method`, `payment_status`, `delivery_address`, `created_at`.

### 7. `order_items` (Buyurtma tarkibidagi mahsulotlar)
Qaysi buyurtmada qaysi mahsulot va qancha miqdorda olinganini tarix uchun qat'iy saqlaydi.
- **PK:** `id`
- **FKlar:** `order_id` -> `orders.id`, `product_variant_id` -> `product_variants.id`
- **Asosiy ustunlar:** `quantity`, `unit_price`.

### 8. `transactions` (To‘lovlar va tranzaksiyalar logi)
To‘lov tizimlari (Payme, Click) orqali o‘tgan har bir pul o‘tkazmasi tarixi.
- **PK:** `id`
- **FK:** `order_id` -> `orders.id`
- **Asosiy ustunlar:** `provider`, `transaction_ref_id`, `amount`, `status`, `created_at`.

