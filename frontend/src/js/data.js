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
        id: generateId('prod'),
        name: "Стул 'Mariano'",
        categoryId: 'chairs',
        price: 5500,
        image: "/src/assets/images/catalog/products/chair/chair1.jpg",
        description: "Элегантный стул с деревянными ножками",
        inStock: true
    },
    {
        id: generateId('prod'),
        name: "Стул 'Moose'",
        categoryId: 'chairs',
        price: 8300,
        image: "/src/assets/images/catalog/products/chair/chair2.jpg",
        description: "Современный стул в скандинавском стиле",
        inStock: true
    },
    {
        id: generateId('prod'),
        name: "Диван 'Milano'",
        categoryId: 'sofas',
        price: 45500,
        image: "/src/assets/images/catalog/products/sofas/sofa1.jpg",
        description: "Просторный угловой диван",
        inStock: true
    }
];

export let cart = loadFromLocalStorage('cart') || [];
export let favorites = loadFromLocalStorage('favorites') || [];
export let users = loadFromLocalStorage('users') || [];

// Функции для работы с данными
export const getProductsByCategory = (categoryId) => {
    return products.filter(product => product.categoryId === categoryId);
};

export const getProductById = (id) => {
    return products.find(product => product.id === id);
};

export const getCategoryById = (id) => {
    return categories.find(category => category.id === id);
};

// Работа с корзиной
export const addToCart = (productId, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) return cart;

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

    saveToLocalStorage('cart', cart);
    return cart;
};

export const removeFromCart = (cartItemId) => {
    cart = cart.filter(item => item.id !== cartItemId);
    saveToLocalStorage('cart', cart);
    return cart;
};

export const getCartItemsWithProducts = () => {
    return cart.map(item => {
        const product = getProductById(item.productId);
        return { ...item, product };
    }).filter(item => item.product); // убираем товары, которые не найдены
};

export function updateCartQuantity(cartItemId, newQuantity) {
    const cartItem = cart.find(item => item.id === cartItemId);
    if (cartItem) {
        if (newQuantity > 0) {
            cartItem.quantity = newQuantity;
            saveToLocalStorage('cart', cart);
        } else {
            removeFromCart(cartItemId);
        }

        return cart;
    }
}

// Избранное
export const toggleFavorite = (productId) => {
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

    saveToLocalStorage('favorites', favorites);
    return favorites;
};

export const isInFavorites = (productId) => {
    return favorites.some(fav => fav.productId === productId);
};

export const getFavoritesWithProducts = () => {
    return favorites.map(fav => {
        const product = getProductById(fav.productId);
        return { ...fav, product };
    }).filter(fav => fav.product);
};

// Локальное хранилище
export const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Данные сохранены в ${key}`);
    } catch (error) {
        console.error(`Ошибка сохранения в ${key}:`, error);
    }
};

export function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Ошибка загрузки из ${key}:`, error);
        return null;
    }
};

// Пользователи
export const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
};

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
    return newUser;
};

export const loginUser = (email, password) => {
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
        throw new Error('Неверный email или пароль');
    }

    return user;
};

export const setCurrentUser = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('currentUser') || null);
};

export const logoutUser = () => {
    localStorage.removeItem('currentUser');
}