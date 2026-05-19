// ============ ИМПОРТЫ ============
import type { FavoriteItem, ApiFavoriteItem } from '@/types';

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

// ============ ТРАНСФОРМАЦИЯ ДАННЫХ ============

/**
 * Трансформирует ответ сервера в формат FavoriteItem
 */
function transformFavoriteItem(item: ApiFavoriteItem): FavoriteItem {
   return {
        id: item.id,
        productId: item.product_id,
        addedAt: item.created_at,
        product: {
            id: item.product_id,
            name: item.name,
            price: Number(item.price),
            categoryId: item.category_id,
            inStock: item.in_stock === 1,
            image: item.image || '',
            description: item.description || ''
        }
    };
}

// ============ API-ФУНКЦИИ ============

//получить всё избранное текущего пользователя
export async function fetchFavoritesApi(): Promise<FavoriteItem[]> {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await handleResponse(response);
    return data.map(transformFavoriteItem);
}

//добавить товар в избранное
export async function addToFavoritesApi(productId: string): Promise<FavoriteItem[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
    });

    const data = await handleResponse(response);
    return data.map(transformFavoriteItem);
}

//удалить товар из избранного
export async function removeFromFavoritesApi(productId: string): Promise<FavoriteItem[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Необходима авторизация');

    const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await handleResponse(response);
    return data.map(transformFavoriteItem);
}
