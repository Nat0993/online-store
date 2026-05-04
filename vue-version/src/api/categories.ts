// ============ ИМПОРТЫ ============
import type { Category } from '@/types';

// ============ КОНСТАНТЫ ============
const API_BASE_URL = 'http://localhost:3000/api';

// ============ ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ КАТЕГОРИЙ ============

//получение всех категорий
export const fetchCategoriesFromApi = async (): Promise<Category[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if(!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Ошибка загрузки категорий товаров:', error);
        return [];
    }
}