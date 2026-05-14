

//Интерфейсы

//Товар
export interface Product {
    id: string;
    name: string;
    categoryId: string;
    price: number;
    image?: string; 
    description?: string;
    inStock: boolean;
}

//Категория 
export interface Category {
    id: string;
    name: string;
    image?: string;
    description?: string;
}

// Пользователь
export interface User {
    id: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    login?: string;
    createdAt: string;
}

// Элемент корзины
export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product?: Product;    // расширенные данные
    addedAt: string;
}

//Элемент корзины с гарантированным продуктом (приходит с бэкенда после JOIN)
export interface CartItemWithProduct extends CartItem {
    product: Product;  // обязательный
}

// Избранное
export interface FavoriteItem {
    id: string;
    productId: string;
    product?: Product;
    addedAt: string;
}

// Заказ
export interface Order {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    customer: OrderCustomer;
    payment: PaymentMethod;
    subtotal: number;
    delivery: number;
    total: number;
    createdAt: string;
    userId: string | null;
    isGuest: boolean;
}

// Товар в заказе
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
}

// Данные клиента для заказа
export interface OrderCustomer {
    lastName: string;
    firstName: string;
    middleName?: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    comment?: string;
}

//Данные навигационных ссылок
export interface NavLink {
    href: string;
    label: string;
}

//Данные хлебных крошек
export interface BreadcrumbLink {
    url?: string;
    text: string;
}

//Данные ссылок на соц.сети
export interface SocialLink {
    href: string;
    icon: string;
    label: string;
}

// API types (ответы от бэкенда)

//товары
export interface ApiProduct {
    id: string;
    name: string;
    price: number;
    category_id: string; // snake_case, как в БД
    in_stock: number; //MySQL возвращает 1(true) или 0(false)
    image: string;
    description: string;
}

//авторизация
export interface ApiAuthUser {
    token: string;
    user: User;
}

//корзина
export interface ApiCartItem {
    id: string;
    quantity: number;
    product_id: string;
    created_at: string;
    name: string;
    price: number;
    image: string;
    in_stock: number;
    category_id: string;
    description: string;
}


//Типы

//Способ оплаты 
export type PaymentMethod = 'card' | 'cash' | 'card_courier';

//Данные для формирования заказа
export type OrderData = Omit<Order, 'id' | 'orderNumber' | 'createdAt'>;

//Данные для регистрации пользователя 
export type UserData = Omit<User, 'id' | 'createdAt' | 'login'>;