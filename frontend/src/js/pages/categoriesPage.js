import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { categories } from '../data.js';
import { isValidCategory, escapeHtml } from '../utils/security.js';

/**
 * Создает HTML-разметку страницы категорий
 * @returns {string} HTML-разметка
 */
function createCategoriesPage() {
    //Валидация категорий
    const validCategories = categories.filter(isValidCategory);

    if(validCategories.length === 0) {
        return `
            <section class="categories">
                <div class="container">
                    <div class="categories__error">
                        <h1>Категории временно недоступны</h1>
                        <p>Попробуйте обновить страницу позже</p>
                    </div>
                </div>
            </section>
        `;
    }
    return `
        <section class="categories">
            <div class="container">
                <!-- здесь встанет Breadcrumbs -->
                <div class="categories__header">
                    <h1 class="categories__title">Категории мебели</h1>
                    <p class="categories__description">Выберите интересующую вас категорию</p>
                </div>

                <div class="categories__wrapper">
                    ${validCategories.map(category => `
                        <button class="category-card" data-category-id="${escapeHtml(category.id)}" type="button" aria-label="Перейти к категории ${escapeHtml(category.name)}">
                            <img class="category-card__image" src="${escapeHtml(category.image)}" 
                                 alt="${escapeHtml(category.name)}"/>
                            <div class="category-card__content">
                                <h2 class="category-card__title">${escapeHtml(category.name)}</h2>
                                <p class="category-card__description">${escapeHtml(category.description)}</p>
                            </div>
                        </button>       
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

/**
 * Инициализирует логику страницы категорий (навигация по карточкам)
 * @param {HTMLElement} pageContainer - контейнер страницы категорий
 */
function initCategoriesPage(pageContainer) {
    const categoryCards = pageContainer.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.dataset.categoryId;
            console.log('Переход к категории:', categoryId);

            // Навигация на страницу товаров категории
            window.history.pushState({}, '', `/catalog/${categoryId}`);
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
    });
}

/**
 * Рендерит страницу категорий товаров
 * @returns {HTMLElement} DOM-элемент страницы категорий
 */
export function renderCategoriesPage() {
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCategoriesPage();

    const container = pageContainer.querySelector('.container');
    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { text: 'Категории' }
    ]);

    container.prepend(breadcrumbs);
    
    initCategoriesPage(pageContainer);
    return pageContainer;
}