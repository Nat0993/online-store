// ============================================================
// ИМПОРТЫ (внешние библиотеки)
// ============================================================

// express — фреймворк для создания сервера
// (даёт готовые инструменты: маршруты, middleware, обработку запросов)
import express from 'express';

// cors — библиотека для разрешения запросов с других портов
// (иначе браузер заблокирует запросы с фронта (порт 5173) к бекенду (порт 3000))
import cors from 'cors';

//библиотека для работы с MySQL
import mysql from 'mysql2/promise';

//библиотека для чтения переменных из файла .env
import dotenv from 'dotenv';

//библиотека для хеширования паролей
import bcrypt from 'bcryptjs';

//библиотека для создания JWT-токенов
import jwt from 'jsonwebtoken';

// ============================================================
// Загружаем переменные из .env
// ============================================================
dotenv.config();

// ============================================================
// Добавляем секретный ключ
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET;

// ============================================================
// СОЗДАЁМ ПРИЛОЖЕНИЕ EXPRESS
// ============================================================

// экземпляр приложения Express
// В переменной app теперь все маршруты и настройки
const app = express();

// порт, на котором будет слушать сервер
const PORT = 3000;

// ============================================================
// MIDDLEWARE (промежуточные обработчики)
// ============================================================

// разрешаем запросы с любых источников
app.use(cors());

// парсер JSON — автоматически превращает входящий JSON в JavaScript объект
// Без этого в req.body при POST запросе было бы undefined
app.use(express.json());

// ============================================================
// ПОДКЛЮЧЕНИЕ К MYSQL
// ============================================================

const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log('Подключено к MySQL');

// ============================================================
// МАРШРУТЫ АВТОРИЗАЦИИ
// ============================================================

// ------------------------------------------------------------
// 1. ФУНКЦИЯ-ПРОВЕРКА ТОКЕНА (middleware)
// ------------------------------------------------------------
// сделает проверку токена и либо пустит дальше, либо вернёт ошибку.
// ------------------------------------------------------------
const authenticateToken = async (req, res, next) => {
    try {
        // Берём заголовок authorization из запроса
        const authHeader = req.headers['authorization'];
    
        // Если заголовок есть - разбиваем его по пробелу и берём вторую часть
        const token = authHeader && authHeader.split(' ')[1];
    
        // Если токена нет - возвращаем ошибку 401 (Unauthorized - не авторизован)
        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }
    
        // Проверяем (расшифровываем) токен с помощью секретного ключа
        // jwt.verify - проверяет, что токен не подделан и не просрочен
        const user = await jwt.verify(token, process.env.JWT_SECRET); //данные, которые идут в токен при логине/регистрации
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Недействительный токен' });
    }
};


// ------------------------------------------------------------
// 2. РЕГИСТРАЦИЯ 
// ------------------------------------------------------------
// Фронт отправляет: { email, password, firstName, lastName, middleName, phone }
// получает: { token, user: {...} }
// ------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {

    try {
        // Достаём данные из тела запроса (то, что прислал фронт)
        // req.body - это объект, который Express собрал из JSON-запроса
        const { email, password, firstName, lastName, middleName, phone } = req.body;

        // Проверяем, есть ли уже пользователь с таким email в БД
        // [existing] - деструктуризация (первый элемент массива)
        const [existing] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        // Если пользователь уже есть - ошибка
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // хеширование пароля
        // 10 - количество "раундов" хеширования
        const hashedPassword = await bcrypt.hash(password, 10);

        // Генерируем уникальный ID пользователя в том же формате, что на фронте
        const timestamp = Date.now().toString(36);  // текущее время в 36-ричной системе
        const random = Math.random().toString(36).slice(2, 7);  // случайные символы
        const userId = `user_${timestamp}_${random}`;

        // Вставляем нового пользователя в таблицу users
        await db.execute(
            `INSERT INTO users 
             (id, email, password_hash, first_name, last_name, middle_name, phone, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [userId, email, hashedPassword, firstName || null, lastName || null, middleName || null, phone || null]
        );

        // Создаём JWT-токен 
        // В токен кладём userId и email
        // Секретный ключ из файла .env
        // Токен действителен 7 дней
        const token = jwt.sign(
            { userId, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Отправляем ответ фронту
        // 201 - статус "Создано успешно"
        // В ответе: токен (для авторизации) и данные пользователя (без пароля)
        res.status(201).json({
            token,
            user: {
                id: userId,
                email,
                firstName: firstName || '',
                lastName: lastName || '',
                middleName: middleName || '',
                phone: phone || '',
                createdAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


// ------------------------------------------------------------
// 3. ВХОД
// ------------------------------------------------------------
// Фронт отправляет: { email, password }
// получает: { token, user: {...} }
// ------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    try {
        // Достаём email и пароль из запроса
        const { email, password } = req.body;

        // Ищем пользователя в БД по email
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        // Если пользователь не найден - ошибка
        if (users.length === 0) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Берём первого (и единственного) найденного пользователя
        const user = users[0];

        // сравниваем пароль с хешем из БД
        // bcrypt.compare сам расшифровывает хеш и сравнивает с введённым паролем
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        // пароль не совпадает - ошибка 401
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Пароль верный - создаём новый токен
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Отправляем ответ (статус 200 по умолчанию)
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                middleName: user.middle_name || '',
                phone: user.phone || '',
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


// ------------------------------------------------------------
// 4. ПОЛУЧИТЬ ДАННЫЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ 
// ------------------------------------------------------------
// маршрут защищен: сначала выполняется authenticateToken, только потом - основной код.
// Без токена не попасть.
// ------------------------------------------------------------
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        // Ищем пользователя в БД по userId из токена
        // req.user получаем из authenticateToken
        // req.user.userId положили в токен при логине
        const [users] = await db.execute(
            `SELECT id, email, first_name, last_name, middle_name, phone, created_at 
             FROM users 
             WHERE id = ?`,
            [req.user.userId]
        );

        // Если пользователь не найден 
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // берём данные пользователя
        const user = users[0];

        // Отправляем ответ (без пароля и password_hash)
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            middleName: user.middle_name || '',
            phone: user.phone || '',
            createdAt: user.created_at
        });

    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ------------------------------------------------------------
// 5. ОБНОВИТЬ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ (PUT /api/auth/me)
// ------------------------------------------------------------

app.put('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        // достаём из тела запроса данные, которые прислал фронт
        const { firstName, lastName, middleName, phone } = req.body;
        
        // достаём ID пользователя из токена (authenticateToken положил его в req.user)
        const userId = req.user.userId;

        // создаём пустые массивы для SQL-запроса
        const updates = [];  // сюда пойдут части запроса
        const params = [];   // сюда - значения

        // проверяем каждое поле — прислал ли его фронт?
        
        if (firstName !== undefined) {
            updates.push('first_name = ?');   // пушим часть запроса
            params.push(firstName || null);   // пушим значение (или null, если пустая строка)
        }
        
        if (lastName !== undefined) {
            updates.push('last_name = ?');
            params.push(lastName || null);
        }
        
        if (middleName !== undefined) {
            updates.push('middle_name = ?');
            params.push(middleName || null);
        }
        
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone || null);
        }

        // если фронт не прислал ниодного поля — возвращаем ошибку
        if (updates.length === 0) {
            return res.status(400).json({ message: 'Нет данных для обновления' });
        }

        // добавляем userId в конец массива params
        // встанет в последний плейсхолдер (WHERE id = ?)
        params.push(userId);

        // SQL-запрос на обновление
        await db.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // получаем обновлённые данные из БД
        const [users] = await db.execute(
            `SELECT id, email, first_name, last_name, middle_name, phone, created_at 
             FROM users 
             WHERE id = ?`,
            [userId]  
        );

        // проверяем, нашёлся ли пользователь (на всякий случай)
        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // берём первого (и единственного) пользователя
        const user = users[0];

        // отправляем ответ фронту (snake_case в camelCase)
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name || '',     // если null — пустая строка
            lastName: user.last_name || '',
            middleName: user.middle_name || '',
            phone: user.phone || '',
            createdAt: user.created_at
        });

    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ============================================================
// МАРШРУТЫ ДЛЯ КАТЕГОРИЙ
// ============================================================

//GET /api/categories — получить все категории
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        console.log('Ошибка при получении категорий товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера'});
    }
})

// GET /api/categories/:id — получить одну категорию по ID
app.get('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);

        if(rows.length === 0) {
            return res.status(404).json({error: 'Категория не найдена'});
        }

        res.json(rows[0]);
    } catch (error) {
        console.log('Ошибка при получении категории товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера'});
    }
})

// ============================================================
// МАРШРУТЫ ДЛЯ ТОВАРОВ
// ============================================================

//GET /api/products/ - получить товары (с фильтрацией по категории)
app.get('/api/products', async (req, res) => {
    try {
        const { categoryId } = req.query;

        let query = 'SELECT * FROM products';
        const param = [];

        if(categoryId) {
            query += ' WHERE category_id = ?';
            param.push(categoryId);
        }

        const [rows] = await db.execute(query, param);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// GET /api/products/:id — получить один товар по ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);

        if(rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Ошибка при получении товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
})

// ============================================================
// МАРШРУТЫ ДЛЯ КОРЗИНЫ
// ============================================================

// получение корзины текущ пользователя
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Получаем товары в корзине с данными о товарах (через JOIN)
        const [cartItems] = await db.execute(
            `SELECT 
                ci.id,
                ci.quantity,
                ci.product_id,
                ci.created_at,
                p.name,
                p.price,
                p.image,
                p.in_stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [userId]
        );

        res.json(cartItems);
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// добавление товара в корзину
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity = 1 } = req.body;

        // Проверяем, есть ли товар в БД
        const [product] = await db.execute(
            'SELECT id FROM products WHERE id = ?',
            [productId]
        );

        if (product.length === 0) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Проверяем, есть ли уже такой товар в корзине 
        const [existing] = await db.execute(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // товар уже есть — обновляем количество
            const newQuantity = existing[0].quantity + quantity;
            await db.execute(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existing[0].id]
            );
        } else {
            // товара нет — добавляем новую строку
            const id = `cart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
            await db.execute(
                'INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)',
                [id, userId, productId, quantity]
            );
        }

        // Возвращаем обновлённую корзину
        const [cartItems] = await db.execute(
            `SELECT 
                ci.id,
                ci.quantity,
                ci.product_id,
                ci.created_at,
                p.name,
                p.price,
                p.image,
                p.in_stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [userId]
        );

        res.json(cartItems);
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// изменение количества товара в корзине
app.put('/api/cart/:itemId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;

        // проверка, что quantity положительное число
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Количество должно быть больше 0' });
        }

        // проверка, что товар в корзине принадлежит этому пользователю
        const [cartItem] = await db.execute(
            'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
            [itemId, userId]
        );

        if (cartItem.length === 0) {
            return res.status(404).json({ message: 'Товар в корзине не найден' });
        }

        // обновляем количество
        await db.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, itemId]
        );

        // Возвращаем обновлённую корзину
        const [cartItems] = await db.execute(
            `SELECT 
                ci.id,
                ci.quantity,
                ci.product_id,
                ci.created_at,
                p.name,
                p.price,
                p.image,
                p.in_stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [userId]
        );

        res.json(cartItems);
    } catch (error) {
        console.error('Ошибка обновления количества:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// удаление товара из корзины
app.delete('/api/cart/:itemId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params;

        // проверка, что товар в корзине принадлежит этому пользователю
        const [cartItem] = await db.execute(
            'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
            [itemId, userId]
        );

        if (cartItem.length === 0) {
            return res.status(404).json({ message: 'Товар в корзине не найден' });
        }

        // Удаляем товар
        await db.execute(
            'DELETE FROM cart_items WHERE id = ?',
            [itemId]
        );

        // Возвращаем обновлённую корзину
        const [cartItems] = await db.execute(
            `SELECT 
                ci.id,
                ci.quantity,
                ci.product_id,
                ci.created_at,
                p.name,
                p.price,
                p.image,
                p.in_stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [userId]
        );

        res.json(cartItems);
    } catch (error) {
        console.error('Ошибка удаления товара из корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// очистка всей корзины
app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Удаляем все товары пользователя из корзины
        await db.execute(
            'DELETE FROM cart_items WHERE user_id = ?',
            [userId]
        );

        // Возвращаем пустую корзину
        res.json([]);
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ============================================================
// ЗАПУСК СЕРВЕРА
// ============================================================

// Функция, переданная вторым аргументом, выполнится после успешного запуска
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
