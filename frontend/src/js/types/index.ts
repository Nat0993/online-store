/**
 * Основные интерфейсы 
 */


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
    password?: string;     // только для регистрации/логина
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    login?: string;
    createdAt: string;
    name?: string;        // полное имя 
}

// Элемент корзины
export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product?: Product;    // расширенные данные
}

// Избранное
export interface FavoriteItem {
    id: string;
    productId: string;
    product?: Product;
}

// Заказ
export interface Order {
    id: string;
    orderNumber: string;
    items: OrderItem[];
    customer: OrderCustomer;
    payment: 'card' | 'cash' | 'card_courier';
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