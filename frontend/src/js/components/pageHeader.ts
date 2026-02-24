// ============ ИМПОРТЫ ============
import { escapeHtml } from "../utils/security.js";

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку заголовка страницы с описанием
 * 
 * @param title - заголовок страницы
 * @param description - описание страницы
 * @returns HTML-разметка заголовка
 */

function createPageHeader (title: string, description: string): string {
    return `
     <div class="page-header">
            <h1 class="page-header__title">${escapeHtml(title)}</h1>
            <span class="page-header__description">${escapeHtml(description)}</span>
        </div>
    `;
}

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит компонент заголовка страницы
 * 
 * @param title - заголовок страницы
 * @param description - описание страницы
 * @returns DOM-элемент заголовка страницы
 */
export function renderPageHeader (title: string, description: string): HTMLElement {
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = createPageHeader(title, description);

    return headerContainer.firstElementChild as HTMLElement || headerContainer;
}