import { isValidCategory, isValidProduct } from "./utils/security.js";

/**
 * Генерирует уникальный ID с префиксом
 * @param {string} [prefix='item'] - префикс для ID
 * @returns {string} уникальный ID
 */
function generateId(prefix = 'item') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

export const categories = [
    {
        id: 'chairs',
        name: "Стулья",
        image: "/src/assets/images/catalog/categories/chairs.jpg",
        description: "Эргономичные стулья для дома и офиса. От классических деревянных моделей до современных дизайнерских решений с регулируемой высотой и ортопедическими спинками.",
    },
    {
        id: 'tables',
        name: "Столы",
        image: "/src/assets/images/catalog/categories/tables.jpg",
        description: "Письменные, обеденные и кофейные столы из натурального дерева, стекла и металла. Практичные решения для любой комнаты с раздвижными механизмами и стильным дизайном.",

    },
    {
        id: 'sofas',
        name: "Диваны",
        image: "/src/assets/images/catalog/categories/sofas.jpg",
        description: "Угловые, прямые и модульные диваны для просторных гостиных. Мягкие модели с ортопедическими основаниями, раскладными механизмами и съемными чехлами для легкой чистки.",

    },
    {
        id: 'wardrobes',
        name: "Шкафы",
        image: "/src/assets/images/catalog/categories/wardrobes.jpg",
        description: "Вместительные шкафы и гардеробные системы для оптимальной организации пространства. Распашные и купейные модели с зеркальными дверями и системами хранения.",

    },
    {
        id: 'beds',
        name: "Кровати",
        image: "/src/assets/images/catalog/categories/beds.jpg",
        description: "Односпальные и двуспальные кровати с ортопедическими матрасами. Модели с подъемными механизмами, встроенными ящиками и регулируемыми основаниями для здорового сна.",

    }
];

export const products = [
    {
        id: 'prod_chair_1',
        name: "Стул 'Marco'",
        categoryId: 'chairs',
        price: 9500,
        image: "/src/assets/images/catalog/products/chairs/chair1.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_2',
        name: "Стул 'Moose'",
        categoryId: 'chairs',
        price: 10300,
        image: "/src/assets/images/catalog/products/chairs/chair2.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_3',
        name: "Стул 'Cocktail'",
        categoryId: 'chairs',
        price: 8600,
        image: "/src/assets/images/catalog/products/chairs/chair3.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_4',
        name: "Стул 'Venice'",
        categoryId: 'chairs',
        price: 10950,
        image: "/src/assets/images/catalog/products/chairs/chair4.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_5',
        name: "Стул 'Nonton'",
        categoryId: 'chairs',
        price: 6980,
        image: "/src/assets/images/catalog/products/chairs/chair5.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_6',
        name: "Стул 'April'",
        categoryId: 'chairs',
        price: 16400,
        image: "/src/assets/images/catalog/products/chairs/chair6.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_7',
        name: "Стул 'Shado'",
        categoryId: 'chairs',
        price: 10360,
        image: "/src/assets/images/catalog/products/chairs/chair7.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_chair_8',
        name: "Стул 'Modena'",
        categoryId: 'chairs',
        price: 12600,
        image: "/src/assets/images/catalog/products/chairs/chair8.jpg",
        description: "",
        inStock: true
    },
    {
        id: 'prod_sofa_1',
        name: "Диван 'Milano'",
        categoryId: 'sofas',
        price: 45500,
        image: "/src/assets/images/catalog/products/sofas/sofa1.jpg",
        description: "Просторный угловой диван",
        inStock: true
    }
];

export let users = loadFromLocalStorage('users') || [];

// Функции для работы с данными

/**
 * Получает товары по ID категории
 * @param {string} categoryId - ID категории
 * @returns {Array} массив товаров категории
 */
export const getProductsByCategory = (categoryId) => {
    if (!categoryId || typeof categoryId !== 'string') {
        console.warn('Invalid categoryId:', categoryId);
        return [];
    }

    return products.filter(product => product.categoryId === categoryId && isValidProduct(product));
};

/**
 * Находит товар по ID
 * @param {string} id - ID товара
 * @returns {Object|null} объект товара или null
 */
export const getProductById = (id) => {
    if (!id || typeof id !== 'string') {
        console.warn('Invalid product id:', id);
        return null;
    }

    const product = products.find(product => product.id === id);
    return isValidProduct(product) ? product : null;
};

/**
 * Находит категорию по ID
 * @param {string} id - ID категории
 * @returns {Object|null} объект категории или null
 */
export const getCategoryById = (id) => {
    if (!id || typeof id !== 'string') {
        console.warn('Invalid category id:', id);
        return null;
    }

    const category = categories.find(category => category.id === id)
    return isValidCategory(category) ? category : null;
};

// Работа с корзиной

/**
 * Получает корзину текущего пользователя
 * @returns {Array} массив товаров в корзине
 */
export const getCurrentCart = () => {
    const user = getCurrentUser();
    const key = user ? `cart_${user.id}` : 'cart_guest';
    return loadFromLocalStorage(key) || [];
};

/**
 * Сохраняет корзину текущего пользователя
 * @param {Array} cartData - данные корзины
 */
export const saveCurrentCart = (cartData) => {
    const user = getCurrentUser();
    const key = user ? `cart_${user.id}` : 'cart_guest';
    saveToLocalStorage(key, cartData);
};

/**
 * Добавляет товар в корзину
 * @param {string} productId - ID товара
 * @param {number} [quantity=1] - количество
 * @returns {Array} обновленная корзина
 */
export const addToCart = (productId, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) return getCurrentCart();

    const cart = getCurrentCart();
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: generateId('cart'),
            productId: productId,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }

    saveCurrentCart(cart);
    return cart;
};

/**
 * Удаляет товар из корзины по его ID в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @returns {Array} обновленная корзина
 */
export const removeFromCart = (cartItemId) => {
    const cart = getCurrentCart();
    const updatedCart = cart.filter(item => item.id !== cartItemId);
    saveCurrentCart(updatedCart);
    return updatedCart;
};

/**
 * Получает элементы корзины с полной информацией о товарах
 * @returns {Array} массив элементов корзины с товарами
 */
export const getCartItemsWithProducts = () => {
    const cart = getCurrentCart();
    return cart.map(item => {
        const product = getProductById(item.productId);
        return { ...item, product };
    }).filter(item => item.product); // убираем товары, которые не найдены
};

/**
 * Обновляет колличество товара в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @param {number} newQuantity - новое количество товара
 * @returns {Array} обновленная корзина
 */
export function updateCartQuantity(cartItemId, newQuantity) {
    const cart = getCurrentCart();
    const cartItem = cart.find(item => item.id === cartItemId);
    if (cartItem) {
        if (newQuantity > 0) {
            cartItem.quantity = newQuantity;
            saveCurrentCart(cart);
        } else {
            removeFromCart(cartItemId);
        }

        return cart;
    }
}

// Избранное

/**
 * Получает избранное текущего пользователя
 * @returns {Array} массив избранных товаров
 */
export const getCurrentFavorites = () => {
    const user = getCurrentUser();
    const key = user ? `favorites_${user.id}` : 'favorites_guest';
    return loadFromLocalStorage(key) || [];
};

/**
 * Сохраняет избранное текущего пользователя
 * @param {Array} favoritesData - данные избранного
 */
export const saveCurrentFavorites = (favoritesData) => {
    const user = getCurrentUser();
    const key = user ? `favorites_${user.id}` : 'favorites_guest';
    saveToLocalStorage(key, favoritesData);
};

/**
 * Добавляет или удаляет товар из избранного
 * @param {string} productId - ID товара
 * @returns {Array} обновленное избранное
 */
export const toggleFavorite = (productId) => {
    const favorites = getCurrentFavorites();
    const existingIndex = favorites.findIndex(fav => fav.productId === productId);

    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
    } else {
        favorites.push({
            id: generateId('fav'),
            productId: productId,
            addedAt: new Date().toISOString()
        });
    }

    saveCurrentFavorites(favorites);
    return favorites;
};

/**
 * Получает избранное с полной информацией о товарах
 * @returns {Array} массив избранного с товарами
 */
export const getFavoritesWithProducts = () => {
    const favorites = getCurrentFavorites();
    return favorites.map(fav => {
        const product = getProductById(fav.productId);
        return { ...fav, product };
    }).filter(fav => fav.product);
};

// Хранение данных

/**
 * Получает ключ для хранения данных
 * @param {string} dataType - тип данных
 * @returns {string} ключ
 */
function getStorageKey(dataType) {
    const user = getCurrentUser();
    return user ? `${dataType}_${user.id}` : `${dataType}_guest`;
}

/**
 * Определяет, какое хранилище использовать для текуш пользователя 
 */
function getCurrentStorage() {
    return getCurrentUser() ? localStorage : sessionStorage;
}

/**
 * Сохраняет данные в правильное хранилище
 * @param {string} key - ключ
 * @param {any} data - данные
 */
export const saveToLocalStorage = (key, data) => {
    try {
        // ОСОБЫЙ СЛУЧАЙ: пользователей всегда сохраняем в localStorage
        if (key === 'users') {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`Пользователи сохранены в localStorage`);
            return;
        }
        
        // Для остальных данных - в зависимости от пользователя
        const storage = getCurrentStorage();
        storage.setItem(key, JSON.stringify(data));
        console.log(`Данные сохранены в ${storage === localStorage ? 'localStorage' : 'sessionStorage'}: ${key}`);
    } catch (error) {
        console.error(`Ошибка сохранения в ${key}:`, error);
    }
};

/**
 * Загружает данные из нужного хранилища
 * @param {string} key - ключ
 * @returns {any} данные или null
 */
export function loadFromLocalStorage(key) {
    try {
        // ОСОБЫЙ СЛУЧАЙ: пользователей всегда загружаем из localStorage
        if (key === 'users') {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
        
        // Для остальных данных - в зависимости от пользователя
        const storage = getCurrentStorage();
        const data = storage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Ошибка загрузки из ${key}:`, error);
        return null;
    }
};

// Пользователи

/**
 * Находит пользователя по email
 * @param {string} email - email пользователя
 * @returns {Object|null} объект пользователя или null
 */
export const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
};

/**
 * Регистрирует нового пользователя
 * @param {Object} userData - данные пользователя
 * @param {string} userData.email - email пользователя
 * @param {string} userData.password - пароль пользователя
 * @returns {Object} созданный пользователь
 * @throws {Error} если пользователь с таким email уже существует
 */
export const registerUser = (userData) => {
    if (findUserByEmail(userData.email)) {
        throw new Error('Пользователь с таким email уже существует');
    }

    const newUser = {
        id: generateId('user'),
        ...userData,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToLocalStorage('users', users);

    // Мигрируем гостевые данные в новую учетку
    migrateGuestToUser(newUser.id);

    setCurrentUser(newUser);

    return newUser;
};

/**
 * Выполняет вход пользователя
 * @param {string} email - email пользователя
 * @param {string} password - пароль пользователя
 * @returns {Object} объект пользователя
 * @throws {Error} если неверный email или пароль
 */
export const loginUser = (email, password) => {
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
        throw new Error('Неверный email или пароль');
    }

    // Мигрируем данные из гостевой учетки в пользовательскую
    migrateGuestToUser(user.id);

    setCurrentUser(user);

    return user;
};

/**
 * Мигрирует гостевые данные в пользовательские (в рамках одной сессии)
 * @param {string} userId - ID пользователя
 */
export function migrateGuestToUser(userId) {
    console.log(`Миграция гостевых данных для пользователя ${userId}`);
    
    // Данные, которые нужно мигрировать
    const dataTypes = ['cart', 'favorites', 'orders'];
    
    dataTypes.forEach(dataType => {
        const guestKey = `${dataType}_guest`;
        const userKey = `${dataType}_${userId}`;
        
        // 1. Получаем гостевые данные из sessionStorage
        const guestData = sessionStorage.getItem(guestKey);
        
        if (guestData) {
            try {
                const parsedGuestData = JSON.parse(guestData);
                
                if (parsedGuestData && parsedGuestData.length > 0) {
                    // 2. Получаем пользовательские данные из localStorage
                    const userDataJson = localStorage.getItem(userKey);
                    const userData = userDataJson ? JSON.parse(userDataJson) : [];
                    
                    // 3. Объединяем данные (логика зависит от типа)
                    let mergedData;
                    
                    switch(dataType) {
                        case 'cart':
                            // Для корзины: объединяем количества
                            mergedData = mergeCartData(userData, parsedGuestData);
                            break;
                            
                        case 'favorites':
                            // Для избранного: убираем дубликаты
                            mergedData = mergeFavoritesData(userData, parsedGuestData);
                            break;
                            
                        case 'orders':
                            // Для заказов: просто добавляем
                            mergedData = [...parsedGuestData, ...userData];
                            break;
                            
                        default:
                            mergedData = [...parsedGuestData, ...userData];
                    }
                    
                    // 4. Сохраняем в localStorage пользователя
                    localStorage.setItem(userKey, JSON.stringify(mergedData));
                    
                    // 5. Очищаем гостевые данные
                    sessionStorage.removeItem(guestKey);
                    
                    console.log(`Мигрировано ${parsedGuestData.length} ${dataType}`);
                }
            } catch (error) {
                console.error(`Ошибка миграции ${dataType}:`, error);
            }
        }
    });
}

/**
 * Объединяет данные корзины
 */
function mergeCartData(userCart, guestCart) {
    const merged = [...userCart];
    const productMap = new Map();
    
    // Создаем карту пользовательской корзины для быстрого доступа
    userCart.forEach(item => {
        productMap.set(item.productId, item);
    });
    
    // Добавляем гостевые товары
    guestCart.forEach(guestItem => {
        const existingItem = productMap.get(guestItem.productId);
        
        if (existingItem) {
            // Если товар уже есть - увеличиваем количество
            existingItem.quantity += guestItem.quantity;
        } else {
            // Если товара нет - добавляем
            merged.push(guestItem);
            productMap.set(guestItem.productId, guestItem);
        }
    });
    
    return merged;
}

/**
 * Объединяет избранные товары
 */
function mergeFavoritesData(userFavorites, guestFavorites) {
    const productIds = new Set(userFavorites.map(fav => fav.productId));
    const uniqueGuestFavorites = guestFavorites.filter(fav => 
        !productIds.has(fav.productId)
    );
    
    return [...userFavorites, ...uniqueGuestFavorites];
}

/**
 * Устанавливает текущего пользователя в localStorage
 * @param {Object} user - объект пользователя
 */
export const setCurrentUser = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
};

/**
 * Получает текущего пользователя из localStorage
 * @returns {Object|null} объект пользователя или null
 */
export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('currentUser') || null);
};

/**
 * Выполняет выход пользователя (удаляет из localStorage)
 */
export const logoutUser = () => {
    localStorage.removeItem('currentUser');
}