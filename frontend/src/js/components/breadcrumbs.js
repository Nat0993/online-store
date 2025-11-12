import { escapeHtml } from '../utils/security.js';

/**
 * Создает HTML-разметку хлебных крошек
 * @param {Array} links - массив объектов ссылок {url, text}
 * @returns {string} HTML-разметка хлебных крошек
 */
function createBreadcrumbs(links) {
    if (!Array.isArray(links) || links.length === 0) {
        return '';
    }

    const validLinks = links.filter(link => link && typeof link.text === 'string');
    
    if (validLinks.length === 0) {
        return '';
    }

    return `
        <nav class="breadcrumbs" aria-label="Хлебные крошки">
            ${validLinks.map((link, index) => 
                `${index > 0 ? '<span class="breadcrumbs__separator breadcrumbs__text">/</span>' : ''}${
                    link.url 
                        ? `<a href="${escapeHtml(link.url)}" class="breadcrumbs__link breadcrumbs__text">${escapeHtml(link.text)}</a>`
                        : `<span class="breadcrumbs__current breadcrumbs__text">${escapeHtml(link.text)}</span>`
                }`
            ).join('')}
        </nav>
    `;
}

/**
 * Рендерит компонент хлебных крошек
 * @param {Array} links - Массив объектов ссылок
 * @returns {HTMLElement} DOM-элемент хлебных крошек
 */
export function renderBreadcrumbs (links) {
    const breadcrumbsContainer = document.createElement('div');
    breadcrumbsContainer.innerHTML = createBreadcrumbs(links);

    return breadcrumbsContainer;
}