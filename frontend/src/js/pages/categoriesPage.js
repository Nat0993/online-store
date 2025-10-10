import { categories } from '../../data.js';

function createCategoriesPage() {
    return `
        <section class="categories">
            <div class="container">
                <div class="categories__header">
                    <h1 class="categories__title">Категории мебели</h1>
                    <p class="categories__description">Выберите интересующую вас категорию</p>
                </div>

                <div class="categories__grid">
                    ${categories.map(category => `
                        <div class="category-card" data-category-id="${category.id}">
                            <div class="category-card__image">
                                <!-- Временная заглушка для изображения -->
                                <div class="category-card__image-placeholder">
                                    ${category.name}
                                </div>
                            </div>
                            <div class="category-card__content">
                                <h2 class="category-card__title">${category.name}</h2>
                                <button class="category-card__btn" data-category="${category.id}">
                                    Смотреть товары
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

function initCategoriesPage(pageContainer) {
    const categoryBtns = pageContainer.querySelectorAll('.category-card__btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryId = btn.dataset.category;
            console.log('🎯 Переход к категории:', categoryId);
            
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