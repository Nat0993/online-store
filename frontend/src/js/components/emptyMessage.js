import { escapeHtml } from "../utils/security.js";

/**
 * Создает сообщение о пустой странице
 * @param {string} title - заголовок сообщения
 * @param {string} description - описание
 * @param {Object} options - параметры кнопки
 * @param {string} options.url - URL для кнопки
 * @param {string} options.text - текст кнопки
 * @returns {string} Html-разметка сообщения
 */
function createEmptyMessage(title, description, { url, text }) {
    return `
    <div class="empty-message">
        <div class="page-header">
            <h3 class="page-header__title">${escapeHtml(title)}</h3>
            <span class="page-header__description">${escapeHtml(description)}</span>
        </div>
            <a href="${escapeHtml(url)}" class="empty-message__btn btn">${escapeHtml(text)}</a>
    </div>
    `;
}

/**
 * Рендерит сообщение о пустой странице
 * @param {string} title - заголовок сообщения
 * @param {string} description - описание
 * @param {Object} options - параметры кнопки
 * @param {string} options.url - URL для кнопки
 * @param {string} options.text - текст кнопки
 * @returns {HTMLElement} DOM-элемент сообщения
 */

export function renderEmptyMessage(title, description, { url, text }) {
    const emptyContainer = document.createElement('div');
    emptyContainer.innerHTML = createEmptyMessage(title, description, { url, text });

    return emptyContainer.firstElementChild || emptyContainer;
}