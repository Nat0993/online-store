import { categories } from '../data.js';

function createCategoriesPage() {
    return `
        <section class="categories">
            <div class="container">
                <nav class="breadcrumbs" aria-label="Хлебные крошки">
                    <a href="/" class="breadcrumbs__link breadcrumbs__text">Главная</a>
                    <span class="breadcrumbs__separator breadcrumbs__text">/</span>
                    <span class="breadcrumbs__current breadcrumbs__text">Категории</span>
                </nav>
                <div class="categories__header">
                    <h1 class="categories__title">Категории мебели</h1>
                    <p class="categories__description">Выберите интересующую вас категорию</p>
                </div>

                <div class="categories__wrapper">
                    ${categories.map(category => `
                        <button class="category-card" data-category-id="${category.id}" type="button" aria-label="Перейти к категории ${category.name}">
                            <img class="category-card__image" src="${category.image}" 
                                 alt="${category.name}" width="300" height="200"/>
                            <div class="category-card__content">
                                <h2 class="category-card__title">${category.name}</h2>
                                <p class="category-card__description">${category.description}</p>
                            </div>
                        </button>       
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

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

export function renderCategoriesPage() {
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCategoriesPage();
    initCategoriesPage(pageContainer);
    return pageContainer;
}