// ============ ИМПОРТЫ ============
import { renderIntro } from '../components/intro.js';
import { renderPortfolio } from '../components/portfolio.js';

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит главную страницу приложения
 * @returns {HTMLElement} DOM-элемент главной страницы
 */
export function renderHomePage(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'home-page';

    const introSection = renderIntro();
    const portfolioSection = renderPortfolio();

    page.appendChild(introSection);
    page.appendChild(portfolioSection);

    return page;
}