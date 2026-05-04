// ============ ИМПОРТЫ ============
import type { ApiProduct, Product } from '@/types';

// ============ КОНСТАНТЫ ============
const API_BASE_URL = 'http://localhost:3000/api';

// ============ ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ТОВАРОВ ============

//получение всех товаров (с фильтрацией по категории)
export const fetchProductsFromAPI = async (categoryId: string): Promise<Product[]> => {
    try {
        let url = `${API_BASE_URL}/products`;
        if(categoryId) {
            url += `?categoryId=${categoryId}`;
        }

        const response = await fetch(url);
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

//получение товара по id
export const fetchProductByIdFromApi = async (id: string): Promise<Product | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await response.json();

        // Преобразуем поля из snake_case в camelCase
        return {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            categoryId: product.category_id,
            inStock: (product.in_stock === 1),
            image: product.image,
            description: product.description
        };
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        return null;
    }
}