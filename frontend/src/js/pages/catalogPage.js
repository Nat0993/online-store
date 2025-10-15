import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { getCategoryById, getProductsByCategory } from "../data.js";
import { renderProductCard } from "../components/product-card.js";

function createCatalogPage(categoryId) {
    const category = getCategoryById(categoryId);
    const products = getProductsByCategory(categoryId);

    if (!category) {
        return '<div>Категория не найдена</div>';
    }

    return `
    <section class="catalog">
            <div class="container">
                <!-- здесь встанет Breadcrumbs -->

                <div class="catalog__controls">
                    <div class="catalog__filters">
                        <button class="catalog__filter-btn">
                            <svg width="20" height="20" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-filter"></use>
                            </svg>
                            Фильтры
                        </button>
                        <!-- Здесь будут фильтры -->
                    </div>
                    
                    <div class="catalog__sort">
                        <select class="catalog__sort-select">
                            <option value="popular">По популярности</option>
                            <option value="price-asc">По цене (возрастание)</option>
                            <option value="price-desc">По цене (убывание)</option>
                            <option value="new">По новизне</option>
                        </select>
                    </div>
                </div>

                <ul class="catalog__product-list" id="product-list">
                <!-- здесь будут подгружаться карточки -->
                <li class="catalog__empty">Загрузка товаров...</li>
            </ul>
            </div>
        </section>
    `
}

function initCatalogPage(pageContainer, categoryId) {
    console.log('Инициализация каталога для категории:', categoryId);

    const products = getProductsByCategory(categoryId);
    const productList = pageContainer.querySelector('#product-list');

    // Очищаем список
    productList.innerHTML = '';

    // Проверяем есть ли товары
    if (products.length === 0) {
        const container = pageContainer.querySelector('.container');
        container.innerHTML = `
            <div class="catalog__empty-message">
                <h3 class="catalog__empty-title">Товары не найдены</h3>
                <p class="catalog__empty-description">В данной категории пока нет товаров</p>
                <a href="/catalog" class="catalog__empty-btn btn">Вернуться в каталог</a>
            </div>
        `;
        return;
    }

    // Добавляем карточки через renderProductCard
    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.className = 'catalog__product-item';

        const productCard = renderProductCard(product);
        listItem.appendChild(productCard);

        productList.appendChild(listItem);
    });
}

export function renderCatalogPage(categoryId) {
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCatalogPage(categoryId);

    const category = getCategoryById(categoryId);
    const container = pageContainer.querySelector('.container');
    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { url: '/catalog', text: 'Категории' }, 
        { text: category.name }
    ]);

    container.prepend(breadcrumbs);

    initCatalogPage(pageContainer, categoryId);

    return pageContainer;
}