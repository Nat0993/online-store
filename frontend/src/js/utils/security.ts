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
    return (
        typeof category === 'object' &&
        category !== null &&
        'id' in category &&
        typeof category.id === 'string' &&
        'name' in category &&
        typeof category.name === 'string'
    );
}

/**
 * Валидирует данные продукта
 * @param {Object} product - Объект продукта
 * @returns {boolean} true если данные валидны
 */
export function isValidProduct(product: unknown): product is Product {
    return (
        typeof product === 'object' &&
        product !== null &&
        'id' in product &&
        typeof product.id === 'string' &&
        'name' in product &&
        typeof product.name === 'string' &&
        'categoryId' in product &&
        typeof product.categoryId === 'string' &&
        'price' in product &&
        typeof product.price === 'number' &&
        'inStock' in product &&
        typeof product.inStock === 'boolean'
    );
}