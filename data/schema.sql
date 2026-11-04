-- PostgreSQL / MySQL uchun Smart Market Ma’lumotlar Bazasi Skripti

-- 1. Foydalanuvchilar jadvali
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER, SELLER, COURIER, ADMIN
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kategoriyalar jadvali (Iyerarxik)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    image_url VARCHAR(255)
);

-- 3. Mahsulotlar katalogi
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    brand VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Mahsulot variantlari va Ombor zaxirasi (SKU)
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    attributes JSONB, -- yoki JSON
    price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0
);

-- 5. Savatcha jadvali
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_variant_id INT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT unique_user_variant UNIQUE (user_id, product_variant_id)
);

-- 6. Buyurtmalar boshshag‘i
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW', -- NEW, PAID, PACKING, SHIPPED, DELIVERED, CANCELLED, RETURNED
    total_amount DECIMAL(12,2) NOT NULL,
    delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- PAYME, CLICK, CASH, INSTALLMENT
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED
    delivery_address TEXT NOT NULL,
    courier_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Buyurtma tarkibidagi mahsulotlar
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id INT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL
);

-- 8. To‘lovlar va tranzaksiyalar logi
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- PAYME, CLICK
    transaction_ref_id VARCHAR(150) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- SUCCESS, FAILED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tezkor qidiruv uchun asosiy indekslar
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

