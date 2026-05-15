import { isValidCategory, isValidProduct } from "./utils/security";
import { fetchProductsFromAPI, fetchProductByIdFromApi } from "./api/products";
import { fetchCategoriesFromApi, fetchCategoryByIdFromApi } from "./api/categories";
import { registerUserApi, loginUserApi, getCurrentUserApi, updateCurrentUserApi } from "./api/auth";
import { fetchCartFromApi, addToCartApi, updateCartQuantityApi, removeFromCartApi, clearCartApi } from './api/cart';
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

// export const categories: Category[] = [
//     {
//         id: 'chairs',
//         name: "Стулья",
//         image: "/src/assets/images/catalog/categories/chairs.jpg",
//         description: "Эргономичные стулья для дома и офиса. От классических деревянных моделей до современных дизайнерских решений с регулируемой высотой и ортопедическими спинками.",
//     },
//     {
//         id: 'tables',
//         name: "Столы",
//         image: "/src/assets/images/catalog/categories/tables.jpg",
//         description: "Письменные, обеденные и кофейные столы из натурального дерева, стекла и металла. Практичные решения для любой комнаты с раздвижными механизмами и стильным дизайном.",

//     },
//     {
//         id: 'sofas',
//         name: "Диваны",
//         image: "/src/assets/images/catalog/categories/sofas.jpg",
//         description: "Угловые, прямые и модульные диваны для просторных гостиных. Мягкие модели с ортопедическими основаниями, раскладными механизмами и съемными чехлами для легкой чистки.",

//     },
//     {
//         id: 'wardrobes',
//         name: "Шкафы",
//         image: "/src/assets/images/catalog/categories/wardrobes.jpg",
//         description: "Вместительные шкафы и гардеробные системы для оптимальной организации пространства. Распашные и купейные модели с зеркальными дверями и системами хранения.",

//     },
//     {
//         id: 'beds',
//         name: "Кровати",
//         image: "/src/assets/images/catalog/categories/beds.jpg",
//         description: "Односпальные и двуспальные кровати с ортопедическими матрасами. Модели с подъемными механизмами, встроенными ящиками и регулируемыми основаниями для здорового сна.",

//     }
// ];

// export const products: Product[] = [
//     {
//         id: 'prod_chair_1',
//         name: "Стул 'Marco'",
//         categoryId: 'chairs',
//         price: 9500,
//         image: "/src/assets/images/catalog/products/chairs/chair1.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_2',
//         name: "Стул 'Moose'",
//         categoryId: 'chairs',
//         price: 10300,
//         image: "/src/assets/images/catalog/products/chairs/chair2.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_3',
//         name: "Стул 'Cocktail'",
//         categoryId: 'chairs',
//         price: 8600,
//         image: "/src/assets/images/catalog/products/chairs/chair3.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_4',
//         name: "Стул 'Venice'",
//         categoryId: 'chairs',
//         price: 10950,
//         image: "/src/assets/images/catalog/products/chairs/chair4.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_5',
//         name: "Стул 'Nonton'",
//         categoryId: 'chairs',
//         price: 6980,
//         image: "/src/assets/images/catalog/products/chairs/chair5.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_6',
//         name: "Стул 'April'",
//         categoryId: 'chairs',
//         price: 16400,
//         image: "/src/assets/images/catalog/products/chairs/chair6.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_7',
//         name: "Стул 'Shado'",
//         categoryId: 'chairs',
//         price: 10360,
//         image: "/src/assets/images/catalog/products/chairs/chair7.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_chair_8',
//         name: "Стул 'Modena'",
//         categoryId: 'chairs',
//         price: 12600,
//         image: "/src/assets/images/catalog/products/chairs/chair8.jpg",
//         description: "",
//         inStock: true
//     },
//     {
//         id: 'prod_sofa_1',
//         name: "Диван 'Milano'",
//         categoryId: 'sofas',
//         price: 45500,
//         image: "/src/assets/images/catalog/products/sofas/sofa1.jpg",
//         description: "Просторный угловой диван",
//         inStock: true
//     }
// ];


// Функции для работы с данными

/**
 * Получает товары по ID категории
 * @param {string} categoryId - ID категории
 * @returns {Array} массив товаров категории
 */
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
    if (!categoryId || typeof categoryId !== 'string') {
        console.warn('Invalid categoryId:', categoryId);
        return [];
    }

    const products = await fetchProductsFromAPI(categoryId);
    return products.filter(p => isValidProduct(p));
};

/**
 * Находит товар по ID
 * @param {string} id - ID товара
 * @returns {Object|null} объект товара или null
 */
export const getProductById = async (id: string): Promise<Product | null> => {
    if (!id || typeof id !== 'string') {
        console.warn('Invalid product id:', id);
        return null;
    }

    const product = await fetchProductByIdFromApi(id);
    return isValidProduct(product) ? product : null;
};

/**
 * Получает все категории
 * @returns {Promise<Category[]>} массив категорий
 */
export const fetchCategories = async (): Promise<Category[]> => {
    const categories = await fetchCategoriesFromApi();
    return categories.filter(cat => isValidCategory(cat));
};

/**
 * Находит категорию по ID
 * @param {string} id - ID категории
 * @returns {Object|null} объект категории или null
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
    if (!id || typeof id !== 'string') {
        console.warn('Invalid category id:', id);
        return null;
    }

    const category = await fetchCategoryByIdFromApi(id);
    return isValidCategory(category) ? category : null;
};

// Работа с корзиной

/**
 * Получает корзину гостя из sessionStorage
 * @returns {CartItem[]} массив товаров в корзине гостя
 * @throws {Error} если вызывается для авторизованного пользователя
 */
export const getGuestCart = (): CartItem[] => {
    const user = getCurrentUser();

    // Если пользователь авторизован — корзина в БД, но эта функция синхронная,
    // поэтому для авторизованных лучше использовать getCartItemsWithProducts
    // А эта функция пусть работает только для гостей
    if (user) {
        // Для авторизованных эта функция не должна использоваться
        console.error('getGuestCart не предназначен для авторизованных пользователей');
        throw new Error('Для авторизованных должна использоваться getCartItemsWithProducts()');
    }

    const guestCart = sessionStorage.getItem('cart_guest');
    return guestCart ? JSON.parse(guestCart) : [];
};

/**
 * Сохраняет корзину гостя в sessionStorage
 * @param {CartItem[]} cartData - данные корзины гостя
 * @throws {Error} если вызывается для авторизованного пользователя
 */
export const saveGuestCart = (cartData: CartItem[]): void => {
    const user = getCurrentUser();
    
    if (user) {
        // Авторизованным не сохраняем в localStorage, только через API
        console.error('saveGuestCart не предназначен для авторизованных пользователей');
        throw new Error('Для авторизованных должны использоваться API-функции (addToCart, removeFromCart и т.д.)');
    }
    
    sessionStorage.setItem('cart_guest', JSON.stringify(cartData));
};

/**
 * Добавляет товар в корзину
 * @param {string} productId - ID товара
 * @param {number} [quantity=1] - количество
 * @returns {Array} обновленная корзина
 */
export const addToCart = async (productId: string, quantity: number = 1): Promise<CartItemWithProduct[]> => {
    const updatedCart = await addToCartApi(productId, quantity);
    return updatedCart;
};

/**
 * Удаляет товар из корзины по его ID в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @returns {Array} обновленная корзина
 */
export const removeFromCart = async (cartItemId: string): Promise<CartItemWithProduct[]> => {
    const updatedCart = await removeFromCartApi(cartItemId);
    return updatedCart;
};

/**
 * Получает элементы корзины с полной информацией о товарах
 * @returns {Array} массив элементов корзины с товарами
 */
export const getCartItemsWithProducts = async (): Promise<CartItemWithProduct[]> => {
    const cart = await fetchCartFromApi();
    return cart;
};

/**
 * Обновляет колличество товара в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @param {number} newQuantity - новое количество товара
 * @returns {Array} обновленная корзина
 */
export async function updateCartQuantity(cartItemId: string, newQuantity: number): Promise<CartItemWithProduct[]> {
    if (newQuantity <= 0) {
        // Если количество 0 или меньше — удаляем товар
        return await removeFromCartApi(cartItemId);
    }
    const updatedCart = await updateCartQuantityApi(cartItemId, newQuantity);
    return updatedCart;
}

/**
 * Ощичает корзину пользователя
 */
export const clearCart = async (): Promise<CartItemWithProduct[]> => {
    const emptyCart = await clearCartApi();
    return emptyCart;
};

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
export const getFavoritesWithProducts = async (): Promise<FavoriteItem[]> => {
    const favorites = getCurrentFavorites();

    const favoritesWithProducts = await Promise.all(
        favorites.map(async (fav) => {
            const product = await getProductById(fav.productId);
            return { ...fav, product };
        })
    )
    return favoritesWithProducts.filter((fav): fav is FavoriteItem & { product: Product } => fav.product !== null);
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
const saveToLocalStorage = <T>(key: StorageKey, data: T): void => {
    try {

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
function loadFromLocalStorage<T>(key: StorageKey): T | null {
    try {

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
 * Регистрирует нового пользователя
 * @param {Object} userData - данные пользователя
 * @returns {Object} созданный пользователь
 */
export const registerUser = async (userData: UserData): Promise<User | null> => {

    // 1. Отправляем запрос на сервер
    const {token, user} = await registerUserApi(userData);

    // 2. Сохраняем токен
    localStorage.setItem('auth_token', token);

    // 3. Сохраняем пользователя
    setCurrentUser(user);

    // 4. Мигрируем гостевые данные
    // migrateGuestToUser(user.id);

    //5. Отправляем событие
    window.dispatchEvent(new CustomEvent('auth:change', {
        detail: { user, type: 'register' }
    }));

    return user;
};

/**
 * Выполняет вход пользователя
 * @param {string} email - email пользователя
 * @param {string} password - пароль пользователя
 * @returns {Object} объект пользователя
 * @throws {Error} если неверный email или пароль
 */
export const loginUser = async (email: string, password: string): Promise<User | null> => {
    
    const {token, user} = await loginUserApi({email, password});

    localStorage.setItem('auth_token', token);
    setCurrentUser(user);
    // migrateGuestToUser(user.id);

    window.dispatchEvent(new CustomEvent('auth:change', {
        detail: { user, type: 'register' }
    }));
    return user;
};

/**
 * Мигрирует гостевые данные в пользовательские (в рамках одной сессии)
 * @param {string} userId - ID пользователя
 */
//TODO: сделать миграцию из гостевых в БД
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
}

/**
 * Обновляет данные текущего пользователя
 * @param {Object} updates - объект с обновляемыми полями {firstName?, lastName?, middleName?, phone?}
 * @returns {Object|null} обновленный пользователь или null
 */
export const updateCurrentUser = async (updates: Partial<UserData>): Promise<User | null> => {
    
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        console.error('Нет токена авторизации');
        return null;
    }

    try {
        const updatedUser = await updateCurrentUserApi(token, updates);
        
        setCurrentUser(updatedUser);
        
        return updatedUser;
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        throw error;  // пробрасываем ошибку дальше (в ProfileModal)
    }
};