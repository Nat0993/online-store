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

// ============ API-ФУНКЦИИ ============

/**
 * Миграция гостевых данных (корзина + избранное)
 */
export async function migrateGuestDataApi(
    email: string,
    cart: { productId: string; quantity: number }[],
    favorites: { productId: string }[]
): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Нет токена авторизации');

    const response = await fetch(`${API_BASE_URL}/migrate/guest-data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, cart, favorites })
    });

    await handleResponse(response);
}

/**
 * Привязка заказов гостя по email
 */
export async function linkOrdersByEmailApi(email: string): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Нет токена авторизации');

    const response = await fetch(`${API_BASE_URL}/auth/link-orders-by-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
    });

     await handleResponse(response);
}