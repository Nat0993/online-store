// ============ ИМПОРТЫ ============
import type { ApiProduct, Product } from '@/types';

// ============ КОНСТАНТЫ ============
const API_BASE_URL = 'http://localhost:3000/api';

// ============ ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ТОВАРОВ ============

//получение всех товаров
export const fetchProductsFromAPI = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Преобразуем поля из snake_case в camelCase
        return data.map((p: ApiProduct) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            categoryId: p.category_id,
            inStock: (p.in_stock === 1),
            image: p.image,
            description: p.description
        }));
    } catch (error) {
         console.error('Ошибка загрузки товаров:', error);
        return [];
    }
}