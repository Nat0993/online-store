import type { Product, Category } from '../types/index.js';

/**
 * Экранирует HTML-символы для защиты от XSS-атак
 * @param {string} unsafe - небезопасная строка
 * @returns {string} безопасная строка с экранированными символами
 */

export function escapeHtml(unsafe: string): string {
    if (!unsafe) return '';

    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\//g, "&#x2F;");
}

/**
 * Валидирует данные категории
 * @param {Object} category - Объект категории
 * @returns {boolean} true если данные валидны
 */

export function isValidCategory(category: unknown): category is Category {
    if (typeof category !== 'object' || category === null) {
        return false;
    }

    const cat = category as Record<string, unknown>;
    return (
        'id' in cat &&
        typeof cat.id === 'string' &&
        'name' in cat &&
        typeof cat.name === 'string'
    );
}

/**
 * Валидирует данные продукта
 * @param {Object} product - Объект продукта
 * @returns {boolean} true если данные валидны
 */
export function isValidProduct(product: unknown): product is Product {
    if (typeof product !== 'object' || product === null) {
        return false;
    }
    
    const prod = product as Record<string, unknown>;
    return (
        'id' in prod &&
        typeof prod.id === 'string' &&
        'name' in prod &&
        typeof prod.name === 'string' &&
        'categoryId' in prod &&
        typeof prod.categoryId === 'string' &&
        'price' in prod &&
        typeof prod.price === 'number' &&
        'inStock' in prod &&
        typeof prod.inStock === 'boolean'
    );
}