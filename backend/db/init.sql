-- ============================================
-- Создание БД: online_store
-- ============================================

CREATE DATABASE IF NOT EXISTS online_store;
USE online_store;

-- ============================================
-- Создание таблицы: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    description TEXT
);

-- ============================================
-- Создание таблицы: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(50),
    in_stock BOOLEAN DEFAULT TRUE,
    image VARCHAR(500),
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================
-- Записываем данные: categories
-- ============================================
INSERT INTO categories (id, name, image, description) VALUES 
('chairs', 'Стулья', '/src/assets/images/catalog/categories/chairs.jpg', 'Эргономичные стулья для дома и офиса.'),
('tables', 'Столы', '/src/assets/images/catalog/categories/tables.jpg', 'Письменные, обеденные и кофейные столы.'),
('sofas', 'Диваны', '/src/assets/images/catalog/categories/sofas.jpg', 'Угловые, прямые и модульные диваны.'),
('wardrobes', 'Шкафы', '/src/assets/images/catalog/categories/wardrobes.jpg', 'Вместительные шкафы и гардеробные системы.'),
('beds', 'Кровати', '/src/assets/images/catalog/categories/beds.jpg', 'Односпальные и двуспальные кровати.');

-- ============================================
-- Записываем данные: products
-- ============================================
INSERT INTO products (id, name, price, category_id, in_stock, image, description) VALUES
('prod_chair_1', 'Стул "Marco"', 9500, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair1.jpg', ''),
('prod_chair_2', 'Стул "Moose"', 10300, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair2.jpg', ''),
('prod_chair_3', 'Стул "Cocktail"', 8600, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair3.jpg', ''),
('prod_chair_4', 'Стул "Venice"', 10950, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair4.jpg', ''),
('prod_chair_5', 'Стул "Nonton"', 6980, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair5.jpg', ''),
('prod_chair_6', 'Стул "April"', 16400, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair6.jpg', ''),
('prod_chair_7', 'Стул "Shado"', 10360, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair7.jpg', ''),
('prod_chair_8', 'Стул "Modena"', 12600, 'chairs', TRUE, '/src/assets/images/catalog/products/chairs/chair8.jpg', ''),
('prod_sofa_1', 'Диван "Milano"', 45500, 'sofas', TRUE, '/src/assets/images/catalog/products/sofas/sofa1.jpg', 'Просторный угловой диван');
