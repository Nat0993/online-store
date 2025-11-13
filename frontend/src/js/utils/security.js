/**
 * Экранирует HTML-символы для защиты от XSS-атак
 * @param {string} unsafe - небезопасная строка
 * @returns {string} безопасная строка с экранированными символами
 */

export function escapeHtml(unsafe) {
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

export function isValidCategory(category) {
    return category &&
    category.id &&
    typeof category.id === 'string' &&
    category.name &&
    typeof category.name === 'string' &&
    category.image &&
    typeof category.image === 'string';
}

/**
 * Валидирует данные продукта
 * @param {Object} product - Объект продукта
 * @returns {boolean} true если данные валидны
 */
export function isValidProduct(product) {
    return product && 
           product.id && 
           typeof product.id === 'string' &&
           product.name && 
           typeof product.name === 'string' &&
           product.categoryId && 
           typeof product.categoryId === 'string' &&
           typeof product.price === 'number' &&
           product.price >= 0;
}