import { escapeHtml } from "../utils/security.js";

/**
 * Создает заголовок страницы с описанием
 * @param {string} title - заголовок страницы
 * @param {string} description - описание
 * @returns {string} Html-разметка заголовка
 */

function createPageHeader (title, description) {
    return `
     <div class="page-header">
            <h1 class="page-header__title">${escapeHtml(title)}</h1>
            <span class="page-header__description">${escapeHtml(description)}</span>
        </div>
    `;
}

/**
 * Рендерит компонент заголовка страницы
 * @param {string} title - заголовок страницы
 * @param {string} description - описание
 * @returns {HTMLElement} DOM-элемет заголовка
 */
export function renderPageHeader (title, description) {
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = createPageHeader(title, description);

    return headerContainer.firstElementChild || headerContainer;
}