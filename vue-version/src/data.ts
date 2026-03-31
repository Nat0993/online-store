import { isValidCategory, isValidProduct } from "./utils/security.js";
import type {
    Product,
    Category,
    User,
    CartItem,
    FavoriteItem,
    Order,
} from './types/index';

import type { CartItemWithProduct, OrderData, UserData } from './types/index';

type StorageKey = 
  | 'users' 
  | `cart_${string}` 
  | `favorites_${string}` 
  | `orders_${string}` 
  | 'currentUser'
  | 'cart_guest' 
  | 'favorites_guest' 
  | 'orders_guest';


/**
 * Генерирует уникальный ID с префиксом
 * @param {string} [prefix='item'] - префикс для ID
 * @returns {string} уникальный ID
 */
function generateId(prefix: 'item' | 'cart' | 'fav' | 'order' | 'user' = 'item'): string {
    const timestamp = Date.now().toString(36); // Более короткий timestamp
    const random = Math.random().toString(36).slice(2, 7);
    return `${prefix}_${timestamp}_${random}`;
}

export const categories: Category[] = [
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

export const products: Product[] = [
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

export let users: User[] = loadFromLocalStorage('users' as StorageKey) || [];

// Функции для работы с данными

/**
 * Получает товары по ID категории
 * @param {string} categoryId - ID категории
 * @returns {Array} массив товаров категории
 */
export const getProductsByCategory = (categoryId: string): Product[] => {
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
export const getProductById = (id: string): Product | null => {
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
export const getCategoryById = (id: string): Category | null => {
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
export const getCurrentCart = (): CartItem[] => {
    const user = getCurrentUser();
    const key = user ? `cart_${user.id}` : 'cart_guest';
    return loadFromLocalStorage<CartItem[]>(key as StorageKey) || [];
};

/**
 * Сохраняет корзину текущего пользователя
 * @param {Array} cartData - данные корзины
 */
export const saveCurrentCart = (cartData: CartItem[]): void => {
    const user = getCurrentUser();
    const key = user ? `cart_${user.id}` : 'cart_guest';
    saveToLocalStorage<CartItem[]>(key as StorageKey, cartData);
};

/**
 * Добавляет товар в корзину
 * @param {string} productId - ID товара
 * @param {number} [quantity=1] - количество
 * @returns {Array} обновленная корзина
 */
export const addToCart = (productId: string, quantity: number = 1): CartItem[] => {
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
export const removeFromCart = (cartItemId: string): CartItem[] => {
    const cart = getCurrentCart();
    const updatedCart = cart.filter(item => item.id !== cartItemId);
    saveCurrentCart(updatedCart);
    return updatedCart;
};

/**
 * Получает элементы корзины с полной информацией о товарах
 * @returns {Array} массив элементов корзины с товарами
 */
export const getCartItemsWithProducts = (): CartItemWithProduct[] => {
    const cart = getCurrentCart();
    return cart.map(item => {
        const product = getProductById(item.productId);
        return { ...item, product };
    }).filter((item): item is CartItemWithProduct => item.product !== null); // убираем товары, которые не найдены
};

/**
 * Обновляет колличество товара в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @param {number} newQuantity - новое количество товара
 * @returns {Array} обновленная корзина
 */
export function updateCartQuantity(cartItemId: string, newQuantity: number): CartItem[] {
    const cart = getCurrentCart();
    const cartItem = cart.find(item => item.id === cartItemId);
    if (cartItem) {
        if (newQuantity > 0) {
            cartItem.quantity = newQuantity;
            saveCurrentCart(cart);
            return cart;
        } else {
            removeFromCart(cartItemId);
        }
    }

    // Если элемент не найден, возвращаем текущую корзину
    return cart;
}

// Избранное

/**
 * Получает избранное текущего пользователя
 * @returns {Array} массив избранных товаров
 */
export const getCurrentFavorites = (): FavoriteItem[] => {
    const user = getCurrentUser();
    const key = user ? `favorites_${user.id}` : 'favorites_guest';
    return loadFromLocalStorage<FavoriteItem[]>(key as StorageKey) || [];
};

/**
 * Сохраняет избранное текущего пользователя
 * @param {Array} favoritesData - данные избранного
 */
export const saveCurrentFavorites = (favoritesData: FavoriteItem[]): void => {
    const user = getCurrentUser();
    const key = user ? `favorites_${user.id}` : 'favorites_guest';
    saveToLocalStorage<FavoriteItem[]>(key as StorageKey, favoritesData);
};

/**
 * Добавляет или удаляет товар из избранного
 * @param {string} productId - ID товара
 * @returns {Array} обновленное избранное
 */
export const toggleFavorite = (productId: string): FavoriteItem[] => {
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
export const getFavoritesWithProducts = (): FavoriteItem[] => {
    const favorites = getCurrentFavorites();
    return favorites.map(fav => {
        const product = getProductById(fav.productId);
        return { ...fav, product };
    }).filter((fav): fav is FavoriteItem & { product: Product } => fav.product !== null);
};

// Заказы

/**
 * Генерирует уникальный номер заказа
 * @returns {string} номер заказа в формате "ORD-XXXXXXXX"
 */
export function generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp.slice(-8)}-${random}`;
}

/**
 * Добавляет новый заказ
 * @param {Object} orderData - данные заказа
 * @returns {Object} созданный заказ с номером
 */
export const addOrder = (orderData: OrderData): Order => {
    const user = getCurrentUser();
    const key = user ? `orders_${user.id}` : 'orders_guest';

    const orders = getCurrentOrders();

    const orderNumber = generateOrderNumber();
    const order = {
        ...orderData,
        id: generateId('order'),
        orderNumber: orderNumber,
        createdAt: new Date().toISOString(),
        userId: user?.id || null,
        isGuest: !user
    };

    orders.push(order);
    saveToLocalStorage<Order[]>(key as StorageKey, orders);

    console.log('Заказ сохранен:', { key, order });
    return order;
};

/**
 * Получает заказы текущего пользователя/гостя
 * (для истории заказов)
 * @returns {Array} массив заказов
 */
export const getCurrentOrders = (): Order[] => {
    const user = getCurrentUser();
    const key = user ? `orders_${user.id}` : 'orders_guest';
    return loadFromLocalStorage<Order[]>(key as StorageKey) || [];
};

/**
 * Находит заказ по номеру
 * @param {string} orderNumber - номер заказа
 * @returns {Object|null} заказ или null
 */
export const getOrderByNumber = (orderNumber: string): Order | null => {
    const orders = getCurrentOrders();
    return orders.find(order => order.orderNumber === orderNumber) || null;
};


// Хранение данных

/**
 * Определяет, какое хранилище использовать для текуш пользователя 
 */
function getCurrentStorage(): Storage {
    return getCurrentUser() ? localStorage : sessionStorage;
}

/**
 * Сохраняет данные в правильное хранилище
 * @param {string} key - ключ
 * @param {any} data - данные
 */
export const saveToLocalStorage = <T>(key: StorageKey, data: T): void => {
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
export function loadFromLocalStorage<T>(key: StorageKey): T | null {
    try {
        // ОСОБЫЙ СЛУЧАЙ: пользователей всегда загружаем из localStorage
        if (key === 'users') {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) as T : null;
        }

        // Для остальных данных - в зависимости от пользователя
        const storage = getCurrentStorage();
        const data = storage.getItem(key);
        return data ? JSON.parse(data) as T : null;
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
export const findUserByEmail = (email: string): User | null => {
    const user = users.find(user => user.email === email);
    return user || null;  // undefined превращаем в null
};

/**
 * Регистрирует нового пользователя
 * @param {Object} userData - данные пользователя
 * @param {string} userData.email - email пользователя
 * @param {string} userData.password - пароль пользователя
 * @returns {Object} созданный пользователь
 * @throws {Error} если пользователь с таким email уже существует
 */
export const registerUser = (userData: UserData): User => {
    if (findUserByEmail(userData.email)) {
        throw new Error('Пользователь с таким email уже существует');
    }

    const newUser = {
        id: generateId('user'),
        ...userData,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToLocalStorage<User[]>('users', users);

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
export const loginUser = (email: string, password: string): User => {
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
export function migrateGuestToUser(userId: string): void {
    console.log(`Миграция гостевых данных для пользователя ${userId}`);

    // Мигрируем корзину
    const guestCart = sessionStorage.getItem('cart_guest');
    if (guestCart) {
        try {
            const guestCartData: CartItem[] = JSON.parse(guestCart);
            const userCartKey = `cart_${userId}`;
            const userCartData = loadFromLocalStorage<CartItem[]>(userCartKey as StorageKey) || [];
            
            if (guestCartData.length > 0) {
                const mergedCart = mergeCartData(userCartData, guestCartData);
                localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
                sessionStorage.removeItem('cart_guest');
                console.log(`Мигрировано ${guestCartData.length} товаров в корзине`);
            }
        } catch (error) {
            console.error('Ошибка миграции корзины:', error);
        }
    }

    // Мигрируем избранное
    const guestFavorites = sessionStorage.getItem('favorites_guest');
    if (guestFavorites) {
        try {
            const guestFavData: FavoriteItem[] = JSON.parse(guestFavorites);
            const userFavKey = `favorites_${userId}`;
            const userFavData = loadFromLocalStorage<FavoriteItem[]>(userFavKey as StorageKey) || [];
            
            if (guestFavData.length > 0) {
                const mergedFav = mergeFavoritesData(userFavData, guestFavData);
                localStorage.setItem(userFavKey, JSON.stringify(mergedFav));
                sessionStorage.removeItem('favorites_guest');
                console.log(`Мигрировано ${guestFavData.length} избранных товаров`);
            }
        } catch (error) {
            console.error('Ошибка миграции избранного:', error);
        }
    }

    // Мигрируем заказы
    const guestOrders = sessionStorage.getItem('orders_guest');
    if (guestOrders) {
        try {
            const guestOrdersData: Order[] = JSON.parse(guestOrders);
            const userOrdersKey = `orders_${userId}`;
            const userOrdersData = loadFromLocalStorage<Order[]>(userOrdersKey as StorageKey) || [];
            
            if (guestOrdersData.length > 0) {
                const mergedOrders = [...guestOrdersData, ...userOrdersData];
                localStorage.setItem(userOrdersKey, JSON.stringify(mergedOrders));
                sessionStorage.removeItem('orders_guest');
                console.log(`Мигрировано ${guestOrdersData.length} заказов`);
            }
        } catch (error) {
            console.error('Ошибка миграции заказов:', error);
        }
    }
}

/**
 * Объединяет данные корзины
 */
function mergeCartData(userCart: CartItem[], guestCart: CartItem[]): CartItem[] {
    const merged = [...userCart];
    const productMap = new Map<string, CartItem>();

    // Создаем карту пользовательской корзины для быстрого доступа
    userCart.forEach(item => {
        if (item && item.productId) {
            productMap.set(item.productId, item);
        }
    });

    // Добавляем гостевые товары
    guestCart.forEach(guestItem => {
        if (!guestItem || !guestItem.productId) return;

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
function mergeFavoritesData(userFavorites: FavoriteItem[], guestFavorites: FavoriteItem[]): FavoriteItem[] {
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
export const setCurrentUser = (user: User): void => {
    localStorage.setItem('currentUser', JSON.stringify(user));
};

/**
 * Получает текущего пользователя из localStorage
 * @returns {Object|null} объект пользователя или null
 */
export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    
    try {
        return JSON.parse(userJson) as User;
    } catch {
        return null;
    }
};

/**
 * Выполняет выход пользователя (удаляет из localStorage)
 */
export const logoutUser = (): void => {
    localStorage.removeItem('currentUser');
}

/**
 * Обновляет данные текущего пользователя
 * @param {Object} updates - объект с обновляемыми полями {name?, phone?}
 * @returns {Object|null} обновленный пользователь или null
 */
export const updateCurrentUser = (updates: Partial<UserData>): User | null => {
    const user = getCurrentUser();
    if (!user) return null;

    // Обновляем поля
    const updatedUser = { ...user, ...updates };

    // Сохраняем в общий список пользователей
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveToLocalStorage('users', users);
    }

    // Обновляем текущего пользователя
    setCurrentUser(updatedUser);

    console.log('Данные пользователя обновлены:', updatedUser);
    return updatedUser;
};