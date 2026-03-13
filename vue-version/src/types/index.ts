

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
    password?: string;     // только для регистрации/логина
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

// Элемент корзины с гарантированным продуктом
// TODO (API): использовать там, где product точно есть (после фильтрации)
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

//Типы

//Способ оплаты 
export type PaymentMethod = 'card' | 'cash' | 'card_courier';

//Данные для формирования заказа
export type OrderData = Omit<Order, 'id' | 'orderNumber' | 'createdAt'>;

//Данные для регистрации пользователя 
export type UserData = Omit<User, 'id' | 'createdAt'>;