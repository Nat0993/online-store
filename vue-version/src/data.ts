import { isValidCategory, isValidProduct } from "./utils/security";
import { fetchProductsFromAPI, fetchProductByIdFromApi } from "./api/products";
import { fetchCategoriesFromApi, fetchCategoryByIdFromApi } from "./api/categories";
import { registerUserApi, loginUserApi, getCurrentUserApi, updateCurrentUserApi } from "./api/auth";
import { fetchCartFromApi, addToCartApi, updateCartQuantityApi, removeFromCartApi, clearCartApi } from './api/cart';
import { fetchFavoritesApi, addToFavoritesApi, removeFromFavoritesApi } from "./api/favorites";
import { addOrderApi, addGuestOrderApi, fetchOrdersApi } from './api/orders';
import { migrateGuestDataApi, linkOrdersByEmailApi } from './api/migration';

import type {
    Product,
    Category,
    User,
    CartItem,
    FavoriteItem,
    Order,
} from './types/index';

import type { CartItemWithProduct, OrderData, UserData } from './types/index';


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


// ============ ТОВАРЫ ============
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


// ============ КАТЕГОРИИ ============
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

// ============ КОРЗИНА ============

/**
 * Получает корзину гостя из sessionStorage
 * @returns {CartItem[]} массив товаров в корзине гостя
 */
export const getGuestCart = (): CartItem[] => {
    const guestCart = sessionStorage.getItem('cart_guest');
    return guestCart ? JSON.parse(guestCart) : [];
};

/**
 * Сохраняет корзину гостя в sessionStorage
 * @param {CartItem[]} cartData - данные корзины гостя
 */
export const saveGuestCart = (cartData: CartItem[]): void => {
    sessionStorage.setItem('cart_guest', JSON.stringify(cartData));
};

/**
 * Добавляет товар в корзину (и для гостя, и для авторизованного)
 * @param {string} productId - ID товара
 * @param {number} [quantity=1] - количество
 * @returns {Promise<CartItemWithProduct[]>} обновленная корзина
 */
export const addToCart = async (productId: string, quantity: number = 1): Promise<CartItemWithProduct[]> => {
    const user = getCurrentUser();

    if (user) {
        // авторизованный — через API
        await addToCartApi(productId, quantity);
        return await getCartItemsWithProducts();
    } else {
        // гость — из sessionStorage
        const cart = getGuestCart();
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            //товар уже есть - увеличиваем кол-во
            existingItem.quantity += quantity;
        } else {
            //товара нет - добавляем
            cart.push({
                id: generateId('cart'),
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        saveGuestCart(cart);
        return await getCartItemsWithProducts();
    }
};

/**
 * Удаляет товар из корзины по его ID в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @returns {Promise<CartItemWithProduct[]>} обновленная корзина
 */
export const removeFromCart = async (cartItemId: string): Promise<CartItemWithProduct[]> => {
    const user = getCurrentUser();

    if (user) {
        // авторизованный — через API
        await removeFromCartApi(cartItemId);
        return await getCartItemsWithProducts();
    } else {
        // гость — из sessionStorage
        const cart = getGuestCart();
        const updatedCart = cart.filter(item => item.id !== cartItemId);
        saveGuestCart(updatedCart);
        return await getCartItemsWithProducts();
    }
};

/**
 * Получает элементы корзины с полной информацией о товарах
 * @returns {Promise<CartItemWithProduct[]>} массив элементов корзины с товарами
 */
export const getCartItemsWithProducts = async (): Promise<CartItemWithProduct[]> => {
    const user = getCurrentUser();

    if (user) {
        // авторизованный — через API (сервер уже возвращает с товарами)
        const cart = await fetchCartFromApi();
        return cart;
    } else {
        // гость — из sessionStorage + подгружаем товары
        const guestCart = getGuestCart();

        const cartWithProducts = await Promise.all(
            guestCart.map(async (item) => {
                const product = await getProductById(item.productId);
                return {
                    ...item,
                    product: product || undefined
                };
            })
        );

        // фильтруем только те, где product найден
        return cartWithProducts.filter(
            (item): item is CartItemWithProduct => item.product !== undefined
        );
    }
};

/**
 * Обновляет колличество товара в корзине
 * @param {string} cartItemId - ID товара в корзине
 * @param {number} newQuantity - новое количество товара
 * @returns {Promise<CartItemWithProduct[]>} обновленная корзина
 */
export async function updateCartQuantity(cartItemId: string, newQuantity: number): Promise<CartItemWithProduct[]> {

    if (newQuantity <= 0) {
        return await removeFromCart(cartItemId);
    }

    const user = getCurrentUser();

    if (user) {
        // авторизованный — через API
        await updateCartQuantityApi(cartItemId, newQuantity);
        return await getCartItemsWithProducts();
    } else {
        // гость — из sessionStorage
        const cart = getGuestCart();
        const item = cart.find(item => item.id === cartItemId);

        if (item) {
            item.quantity = newQuantity;
            saveGuestCart(cart);
        }

        return await getCartItemsWithProducts();
    }
}

/**
 * Очищает корзину пользователя
 * @returns {Promise<CartItemWithProduct[]>} пустая корзина
 */
export const clearCart = async (): Promise<CartItemWithProduct[]> => {
    const user = getCurrentUser();

    if (user) {
        // авторизованный — через API
        await clearCartApi();
    } else {
        // гость — очищаем sessionStorage
        saveGuestCart([]);
    }

    return await getCartItemsWithProducts();
};

// ============ ИЗБРАННОЕ ============

/**
 * Получает избранное гостя из sessionStorage
 * @returns {FavoriteItem[]} массив избранных товаров
 */
export const getGuestFavorites = (): FavoriteItem[] => {
    const guestFavorites = sessionStorage.getItem('favorites_guest');
    return guestFavorites ? JSON.parse(guestFavorites) : [];
};

/**
 * Сохраняет избранное гостя в sessionStorage
 * @param {FavoriteItem[]} favoritesData - данные избранного
 */
export const saveGuestFavorites = (favoritesData: FavoriteItem[]): void => {
    sessionStorage.setItem('favorites_guest', JSON.stringify(favoritesData));
};

/**
 * Добавляет или удаляет товар из избранного
 * @param {string} productId - ID товара
 * @returns {Promise<FavoriteItem[]>} обновлённый массив избранного
 */
export const toggleFavorite = async (productId: string): Promise<FavoriteItem[]> => {
    const user = getCurrentUser();

    if (user) {
        // авторизованный пользователь — работаем через API
        const favorites = await fetchFavoritesApi();
        const isFavorite = favorites.some(fav => fav.productId === productId);

        if (isFavorite) {
            return await removeFromFavoritesApi(productId);
        } else {
            return await addToFavoritesApi(productId);
        }
    } else {
        // гость — работаем с sessionStorage
        const favorites = getGuestFavorites();
        const existingIndex = favorites.findIndex(fav => fav.productId === productId);

        if (existingIndex > -1) {
            // удаляем
            favorites.splice(existingIndex, 1);
        } else {
            // добавляем
            favorites.push({
                id: generateId('fav'),
                productId: productId,
                addedAt: new Date().toISOString()
            });
        }

        saveGuestFavorites(favorites);
        return favorites;
    }
};

/**
 * Получает избранное с полной информацией о товарах
 * @returns {Promise<FavoriteItem[]>} массив избранного с товарами
 */
export const getFavoritesWithProducts = async (): Promise<FavoriteItem[]> => {
    const user = getCurrentUser();

    if (user) {
        // Авторизованный — получаем с сервера (уже с продуктами)
        return await fetchFavoritesApi();
    } else {
        // Гость — получаем из sessionStorage и подгружаем продукты
        const favorites = getGuestFavorites();

        const favoritesWithProducts = await Promise.all(
            favorites.map(async (fav) => {
                const product = await getProductById(fav.productId);
                return { ...fav, product: product || undefined };
            })
        );

        // Фильтруем только те, где product найден
        return favoritesWithProducts.filter(
            (fav): fav is FavoriteItem & { product: Product } => fav.product !== undefined
        );
    }
};

// ============ ЗАКАЗЫ ============

/**
 * Генерирует уникальный номер заказа (только для фронта)
 * @returns {string} номер заказа в формате "ORD-XXXXXXXX"
 */
//генерация теперь на сервере

/**
 * Создаёт новый заказ
 * @param {OrderData} orderData - данные заказа (без id, orderNumber, createdAt)
 * @returns {Promise<Order>} созданный заказ
 */
export const addOrder = async (orderData: OrderData): Promise<Order> => {
    const user = getCurrentUser();

    if (user) {
        // Авторизованный пользователь
        return await addOrderApi(orderData);
    } else {
        // Гость
        return await addGuestOrderApi(orderData);
    }
};

/**
 * Получает заказы текущего пользователя (только для авторизованных)
 * @returns {Promise<Order[]>} массив заказов
 */
export const getCurrentUserOrders = async (): Promise<Order[]> => {
    const user = getCurrentUser();

    if (user) {
        // Авторизованный — получаем через API
        return await fetchOrdersApi();
    } else {
        // Гость не видит историю заказов
        return [];
    }
};

/**
 * Получает заказ по номеру (только для авторизованных)
 * @param {string} orderNumber - номер заказа
 * @returns {Promise<Order | null>} заказ или null
 */
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
    const orders = await getCurrentUserOrders();
    return orders.find(order => order.orderNumber === orderNumber) || null;
};


// Пользователи

/**
 * Регистрирует нового пользователя
 * @param {Object} userData - данные пользователя
 * @returns {Object} созданный пользователь
 */
export const registerUser = async (userData: UserData): Promise<User | null> => {

    // 1. Отправляем запрос на сервер
    const { token, user } = await registerUserApi(userData);

    // 2. Сохраняем токен
    localStorage.setItem('auth_token', token);

    // 3. Сохраняем пользователя
    setCurrentUser(user);

    // 4. Мигрируем гостевые данные
    await migrateGuestToUser(user.email);
    await linkOrdersByEmail(user.email);

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

    const { token, user } = await loginUserApi({ email, password });

    localStorage.setItem('auth_token', token);
    setCurrentUser(user);
    
    await migrateGuestToUser(user.email);
    await linkOrdersByEmail(user.email);

    window.dispatchEvent(new CustomEvent('auth:change', {
        detail: { user, type: 'register' }
    }));
    return user;
};

/**
 * Мигрирует гостевые данные в пользовательские 
 * @param {string} email - Email пользователя
 */
export async function migrateGuestToUser(email: string): Promise<void> {
    // получаем гостевые данные
    const guestCart = getGuestCart();
    const guestFavorites = getGuestFavorites();

    // если данных нет — выходим
    if (guestCart.length === 0 && guestFavorites.length === 0) {
        console.log('Нет гостевых данных для миграции');
        return;
    }

    try {
        await migrateGuestDataApi(
            email,
            guestCart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            guestFavorites.map(item => ({
                productId: item.productId
            }))
        );

        // Очищаем гостевые данные
        sessionStorage.removeItem('cart_guest');
        sessionStorage.removeItem('favorites_guest');
        
        console.log('Миграция успешно завершена');
        
        // Уведомляем компоненты об обновлении
        window.dispatchEvent(new CustomEvent('cart:update'));
        window.dispatchEvent(new CustomEvent('favorites:update'));
        
    } catch (error) {
        console.error('Ошибка миграции гостевых данных:', error);
    }
}

/**
 * Привязывает заказы гостя по email (после регистрации/входа)
 * @param {string} email - Email пользователя
 */
async function linkOrdersByEmail(email: string): Promise<void> {
    try {
        await linkOrdersByEmailApi(email);
        console.log('Заказы привязаны');
        // Уведомляем об обновлении заказов
        window.dispatchEvent(new CustomEvent('orders:update'));
    } catch (error) {
        console.error('Ошибка привязки заказов:', error);
    }
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