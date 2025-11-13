import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { getCategoryById, getProductsByCategory } from "../data.js";
import { renderProductCard } from "../components/product-card.js";
import { escapeHtml } from '../utils/security.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';

/**
 * Создает HTML-разметку страницы каталога
 * @param {string} categoryId - ID категории товаров
 * @returns {string} HTML-разметка страницы
 */
function createCatalogPage(categoryId) {
    const category = getCategoryById(categoryId);

    if (!category) {
        return `
            <section class="catalog">
                <div class="container">
                    <div class="catalog__error">
                        <h1>Категория не найдена</h1>
                        <p>Запрошенная категория товаров не существует</p>
                        <a href="/catalog" class="btn">Вернуться в каталог</a>
                    </div>
                </div>
            </section>
        `;
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

/**
 * Инициализирует логику страницы каталога
 * @param {HTMLElement} pageContainer - контейнер страницы
 * @param {string} categoryId - id категории товаров
 */
function initCatalogPage(pageContainer, categoryId) {
    console.log('Инициализация каталога для категории:', categoryId);

    const products = getProductsByCategory(categoryId);
    const productList = pageContainer.querySelector('#product-list');

    // Очищаем список
    productList.innerHTML = '';

    // Проверяем есть ли товары
    if (products.length === 0) {

        //Удаляем список
        productList.remove();

        //Удаляем заголовок, если есть
        const pageHeader = pageContainer.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.remove();
        };

        //Удаляем фильтры и сортировку
        const catalogControls = pageContainer.querySelector('.catalog__controls');
        if(catalogControls) {
            catalogControls.remove();
        };

        // Используем emptyMessage для пустой категории
        const emptyMessage = renderEmptyMessage('В данной категории пока нет товаров', 'Скоро мы добавим новые товары в эту категорию', {url: '/catalog', text: 'Вернуться в каталог'});
        const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
        breadcrumbs.after(emptyMessage);
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

/**
 * Рендерит страницу каталога товаров
 * @param {string} categoryId - ID категории для отображения
 * @returns {HTMLElement} DOM-элемент страницы каталога
 */
export function renderCatalogPage(categoryId) {
    if (!categoryId || typeof categoryId !== 'string') {
        console.error('Invalid categoryId provided to renderCatalogPage');
        categoryId = '';
    }

    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCatalogPage(categoryId);

    const category = getCategoryById(categoryId);
    const container = pageContainer.querySelector('.container');
    if (category) {
        const breadcrumbs = renderBreadcrumbs([
            { url: '/', text: 'Главная' },
            { url: '/catalog', text: 'Категории' }, 
            { text: category.name }
        ]);
        container.prepend(breadcrumbs);
    }


    initCatalogPage(pageContainer, categoryId);

    return pageContainer;
}