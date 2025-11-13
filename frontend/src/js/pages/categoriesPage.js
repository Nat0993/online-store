import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { renderPageHeader } from '../components/pageHeader.js';
import { categories } from '../data.js';
import { isValidCategory, escapeHtml } from '../utils/security.js';

/**
 * Создает HTML-разметку страницы категорий
 * @returns {string} HTML-разметка
 */
function createCategoriesPage() {
    const validCategories = categories.filter(isValidCategory);
    return `
        <section class="categories">
            <div class="container">
                <!-- здесь встанет Breadcrumbs -->
                <!-- здесь встанет PageHeader или EmptyMessage -->

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
    //Валидация категорий
    const validCategories = categories.filter(isValidCategory);

    if(validCategories.length === 0) {
        //Удаляем заголовок, если есть
        const pageHeader = pageContainer.querySelector('.page-header');
        if(pageHeader) {
            pageHeader.remove();
        }

        //Удаляем список категорий
        const categoriesList = pageContainer.querySelector('.categories__wrapper');
        if(categoriesList) {
            categoriesList.remove();
        }

        //Вставляем сообщение о ошибке
        const emptyMessage = renderEmptyMessage('Категории временно недоступны', 'Попробуйте обновить страницу позже', {url: '/', text: 'На главную'});
        const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
        breadcrumbs.after(emptyMessage);
        return;
    }
    //Добавляем карточки категорий
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

    const hasError = pageContainer.querySelector('.categories__error');

    if(!hasError) {
        const pageHeader = renderPageHeader('Категории мебели', 'Выберите интересующую вас категорию');
        breadcrumbs.after(pageHeader);
    }
    
    initCategoriesPage(pageContainer);
    return pageContainer;
}