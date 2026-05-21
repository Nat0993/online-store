// ============ ИМПОРТЫ ============
import type { ApiOrder, Order, OrderData, PaymentMethod } from '@/types';

// ============ КОНСТАНТЫ ============
const API_BASE_URL = 'http://localhost:3000/api';

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

// ============ ТРАНСФОРМАЦИЯ из snake_case в camelCase ============

function transformOrder(apiOrder: ApiOrder): Order {
    const fullName = [
        apiOrder.customer_last_name,
        apiOrder.customer_first_name,
        apiOrder.customer_middle_name
    ].filter(Boolean).join(' ');

    return {
        id: apiOrder.id,
        orderNumber: apiOrder.order_number,
        customer: {
            lastName: apiOrder.customer_last_name,
            firstName: apiOrder.customer_first_name,
            middleName: apiOrder.customer_middle_name || '',
            fullName: fullName,
            phone: apiOrder.customer_phone,
            email: apiOrder.customer_email,
            address: apiOrder.customer_address,
            comment: apiOrder.customer_comment || ''
        },
        payment: apiOrder.payment_method as PaymentMethod,  
        subtotal: Number(apiOrder.subtotal),
        delivery: Number(apiOrder.delivery),
        total: Number(apiOrder.total),
        items: apiOrder.items.map(item => ({
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            price: Number(item.price),
            image: item.image || undefined
        })),
        createdAt: apiOrder.created_at,
        userId: apiOrder.user_id,
        isGuest: apiOrder.is_guest
    };
};

// ============ API-ФУНКЦИИ ============

//создать заказ (авторизованный пользователь)
export async function addOrderApi(orderData: OrderData): Promise<Order> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });

    const data: ApiOrder = await handleResponse(response);
    return transformOrder(data);
};

//создать заказ (гость)
export async function addGuestOrderApi(orderData: OrderData): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/guest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });

    const data: ApiOrder = await handleResponse(response);
    return transformOrder(data);
};

//получить заказы (только для авторизованных)
export async function fetchOrdersApi(): Promise<Order[]> {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data: ApiOrder[] = await handleResponse(response);
    return data.map(transformOrder);
};