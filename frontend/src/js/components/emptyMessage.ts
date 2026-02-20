import { escapeHtml } from "../utils/security.js";
import { NavLink } from "../types/index";

/**
 * Создает сообщение о пустой странице
 * @param title - заголовок сообщения
 * @param description - описание
 * @param link - объект ссылки для кнопки {href, label}
 * @returns HTML-разметка сообщения
 */
function createEmptyMessage(title: string, description: string, link: NavLink): string {
    return `
    <div class="empty-message">
        <div class="page-header">
            <h3 class="page-header__title">${escapeHtml(title)}</h3>
            <span class="page-header__description">${escapeHtml(description)}</span>
        </div>
            <a href="${escapeHtml(link.href)}" class="empty-message__btn btn">${escapeHtml(link.label)}</a>
    </div>
    `;
}

/**
 * Рендерит сообщение о пустой странице
 * @param title - заголовок сообщения
 * @param description - описание
 * @param link - объект ссылки для кнопки {href, label}
 * @returns DOM-элемент сообщения
 */

export function renderEmptyMessage(title: string, description: string, link: NavLink): HTMLElement {
    const emptyContainer = document.createElement('div');
    emptyContainer.innerHTML = createEmptyMessage(title, description, link);

    return emptyContainer.firstElementChild as HTMLElement || emptyContainer;
}