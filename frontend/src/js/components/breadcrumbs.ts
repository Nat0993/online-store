import { escapeHtml } from '../utils/security.js';

interface BreadcrumbLink {
    url?: string;
    text: string;
}

/**
 * Создает HTML-разметку хлебных крошек
 * @param links - массив объектов ссылок {url, text}
 * @returns HTML-разметка хлебных крошек
 */
function createBreadcrumbs(links: BreadcrumbLink[]): string {
    if (!Array.isArray(links) || links.length === 0) {
        return '';
    }

    const validLinks = links.filter((link): link is BreadcrumbLink => 
        link !== null && 
        link !== undefined && 
        typeof link.text === 'string'
    );
    
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
 * @param links - Массив объектов ссылок
 * @returns DOM-элемент хлебных крошек
 */
export function renderBreadcrumbs (links: BreadcrumbLink[]): HTMLElement {
    const breadcrumbsContainer = document.createElement('div');
    breadcrumbsContainer.innerHTML = createBreadcrumbs(links);

    return breadcrumbsContainer;
}