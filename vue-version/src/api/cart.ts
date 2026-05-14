// ============ ИМПОРТЫ ============
import type { CartItemWithProduct, ApiCartItem } from '@/types/index';

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

// ============ ПРЕОБРАЗОВАНИЕ (snake_case → camelCase) ============

function transformCartItem(item: ApiCartItem): CartItemWithProduct {
    return {
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        addedAt: item.created_at,
        product: {
            id: item.product_id,
            name: item.name,
            price: Number(item.price),
            image: item.image,
            inStock: (item.in_stock === 1),
            categoryId: item.category_id,
            description: item.description || '',
        }
    };
}

// ============ API-ФУНКЦИИ ============

// получить корзину
export async function fetchCartFromApi(): Promise<CartItemWithProduct[]> {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await handleResponse(response);
    return data.map(transformCartItem);
}

// добавить товар в корзину
export async function addToCartApi(productId: string, quantity: number = 1): Promise<CartItemWithProduct[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
    });

    const data = await handleResponse(response);
    return data.map(transformCartItem);
}

// изменить количество товара
export async function updateCartQuantityApi(cartItemId: string, quantity: number): Promise<CartItemWithProduct[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
    });

    const data = await handleResponse(response);
    return data.map(transformCartItem);
}

// удалить один товар из корзины
export async function removeFromCartApi(cartItemId: string): Promise<CartItemWithProduct[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await handleResponse(response);
    return data.map(transformCartItem);
}

// очистить всю корзину
export async function clearCartApi(): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await handleResponse(response);
    return data.map(transformCartItem);
}
