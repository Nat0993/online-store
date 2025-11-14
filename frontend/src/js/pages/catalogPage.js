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
                        <div class="catalog__active-filters">
                        <!-- Здесь будут отображаться активные фильтры -->
                    </div>
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

                <!-- Модальное окно фильтров -->
            <div class="filters-modal">
                <div class="filters-modal__content">
                    <div class="filters-modal__header">
                        <h3 class="filters-modal__title">Фильтры</h3>
                        <button class="filters-modal__close" type="button" aria-label="Закрыть окно фильтрации">
                            <svg class="filters-modal__icon-close" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="filters-modal__body">
                        <div class="filters-modal__wrapper">
                            <!-- Фильтр по цене -->
                            <div class="filters-modal__group">
                                <h4 class="filters-modal__group-title">Цена, ₽</h4>
                                <div class="filters-modal__group-inner">
                                    <input type="text" class="filters-modal__input" id="min-price" placeholder="0" min="0">
                                    <span class="filters-modal__separator">-</span>
                                    <input type="text" class="filters-modal__input" id="max-price" placeholder="100000" min="0">
                                </div>
                            </div>
                            
                            <!-- Фильтр по наличию -->
                            <div class="filters-modal__group">
                                <h4 class="filters-modal__group-title">Наличие</h4>
                                <input class="filters-modal__checkbox-input" type="checkbox" id="in-stock" value="in-stock">
                                <label class="filters-modal__label" for="in-stock">
                                    <svg class="filters-modal__icon-check" aria-hidden="true">
                                    <use xlink:href="/src/assets/images/sprite.svg#icon-check"></use>
                                </svg>
                                    <span class="filters-modal__checkbox-text">В наличии</span>
                                </label>
                            </div>
                        </div>
                        <button class="filters-modal__reset">Сбросить фильтры</button>
                    </div>
                    
                    <div class="filters-modal__footer">
                        
                        <button class="filters-modal__apply btn">Применить</button>
                    </div>
                </div>
            </div>

                <ul class="product-list">
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
    const productList = pageContainer.querySelector('.product-list');
    const sortSelect = pageContainer.querySelector('.catalog__sort-select');

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
        if (catalogControls) {
            catalogControls.remove();
        };

        // Используем emptyMessage для пустой категории
        const emptyMessage = renderEmptyMessage('В данной категории пока нет товаров', 'Скоро мы добавим новые товары в эту категорию', { url: '/catalog', text: 'Вернуться в каталог' });
        const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
        breadcrumbs.after(emptyMessage);
        return;
    }

    //Функция сортировки товаров
    function sortProducts(sortType) {

        //Дублируем массив
        const sortedProducts = [...products];

        //Возвращаем новый массив после сортировки
        switch (sortType) {
            case 'price-asc':
                return sortedProducts.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sortedProducts.sort((a, b) => b.price - a.price);
            case 'new':
                // Пока сортируем по Id как по новизне
                return sortedProducts.sort((a, b) => b.id.localeCompare(a.id));
            case 'popular':
            default:
                // По умолчанию - как в исходном порядке
                return sortedProducts;
        }
    }

    // Функция рендера товаров
    function renderProducts (productsToRender) {

        productList.innerHTML = ''; 

        productsToRender.forEach(product => {
            const listItem = document.createElement('li');
            listItem.className = 'product-list__item';
    
            const productCard = renderProductCard(product);
            listItem.appendChild(productCard);
    
            productList.appendChild(listItem);
        });
    }

    // Обработчик изменения сортировки
    sortSelect.addEventListener('change', (e) => {
        const sortedProducts = sortProducts(e.target.value);
        renderProducts(sortedProducts);
    });

    renderProducts(products);
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