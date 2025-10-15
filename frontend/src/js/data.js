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
 
//Получаем корзину текущего пользователя
export const getCurrentCart = () => {
    const user = getCurrentUser();
    const key = user ? `cart_${user.id}` : 'cart_guest';
    return loadFromLocalStorage(key) || [];
};

//Сохраняем корзину текущ пользователя
export const saveCurrentCart = (cartData) => {
    const user = getCurrentUser();
    const key = user ? `cart_${user.id}` : 'cart_guest';
    saveToLocalStorage(key, cartData);
};

export const addToCart = (productId, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) return cart;

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

export const removeFromCart = (cartItemId) => {
    const cart = getCurrentCart();
    const updatedCart = cart.filter(item => item.id !== cartItemId);
    saveCurrentCart(updatedCart);
    return updatedCart;
};

export const getCartItemsWithProducts = () => {
    const cart = getCurrentCart();
    return cart.map(item => {
        const product = getProductById(item.productId);
        return { ...item, product };
    }).filter(item => item.product); // убираем товары, которые не найдены
};

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

//Получаем избранное текущ пользов-ля
export const getCurrentFavorites = () => {
    const user = getCurrentUser();
    const key = user ? `favorites_${user.id}` : 'favorites_guest';
    return loadFromLocalStorage(key) || [];
};

// Сохраняем избранное текущ пользователя
export const saveCurrentFavorites = (favoritesData) => {
    const user = getCurrentUser();
    const key = user ? `favorites_${user.id}` : 'favorites_guest';
    saveToLocalStorage(key, favoritesData);
};

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

export const getFavoritesWithProducts = () => {
    const favorites = getCurrentFavorites();
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

    // Мигрируем гостевые данные в новую учетку
    migrateGuestToUser(newUser.id);

    setCurrentUser(newUser);

    return newUser;
};

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

export function migrateGuestToUser (userId) {
    const guestCart = loadFromLocalStorage('cart_guest') || [];
    const userCart = loadFromLocalStorage(`cart_${userId}`) || [];

    if(guestCart.length > 0) {
        const mergedCart = [...userCart];
        
        guestCart.forEach(guestItem => {
            const existingItem = mergedCart.find(item => item.productId === guestItem.productId);
            if (existingItem) {
                existingItem.quantity += guestItem.quantity;
            } else {
                mergedCart.push(guestItem);
            }
        });
        
        saveToLocalStorage(`cart_${userId}`, mergedCart);
        localStorage.removeItem('cart_guest');
    }

    // Мигрируем избранное
    const guestFavorites = loadFromLocalStorage('favorites_guest') || [];
    const userFavorites = loadFromLocalStorage(`favorites_${userId}`) || [];
    
    if (guestFavorites.length > 0) {
        // Объединяем избранное (убираем дубликаты)
        const mergedFavorites = [...userFavorites, ...guestFavorites];
        const uniqueFavorites = mergedFavorites.filter((fav, index, array) => 
            array.findIndex(f => f.productId === fav.productId) === index
        );
        saveToLocalStorage(`favorites_${userId}`, uniqueFavorites);
        localStorage.removeItem('favorites_guest');
    }
}

export const setCurrentUser = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('currentUser') || null);
};

export const logoutUser = () => {
    localStorage.removeItem('currentUser');
}