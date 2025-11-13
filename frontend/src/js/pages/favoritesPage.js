import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderProductCard } from '../components/product-card.js';
import { getFavoritesWithProducts } from '../data.js';

/**
 * Создает HTML-разметку страницы избранных товаров
 * @returns {string} Html-разметка страницы
 */
function createFavoritesPage() {
    return `
        <section class="favorites">
            <div class="container">
                <!-- здесь встанет Breadcrumbs -->
                <div class="favorites__header">
                    <h1 class="favorites__title">Избранные товары</h1>
                    <span class="favorites__description">Товары, которые вам понравились</span>
                </div>

                <ul class="favorites__list">
                    <!-- здесь будут подгружаться карточки -->
                    <li class="favorites__loading">Загрузка избранных товаров...</li>
                </ul>
            </div>
        </section>
    `;
}

/**
 * Инициализирует логику избранного
 * @param {HTMLElement} pageContainer - контейнер страницы 
 */
function initFavoritesPage(pageContainer) {
    const favorites = getFavoritesWithProducts();
    const favoritesList = pageContainer.querySelector('.favorites__list')

    //Очищаем список 
    favoritesList.innerHTML = '';

    //Проверяем, есть ли избранные товары
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
        <li class="favorites__empty-message">
                <h3 class="favorites__empty-title">В избранном пока нет товаров</h3>
                <a href="/catalog" class="favorites__empty-btn btn">Перейти в каталог</a>
            </li>
        `;
        return;
    }

    //Добавляем карточки для избранных товаров
    favorites.forEach(favItem => {
        const listItem = document.createElement('li');
        listItem.className = 'favorites__item';

        const productCard = renderProductCard(favItem.product);
        listItem.appendChild(productCard);

        favoritesList.appendChild(listItem);
    });
}

/**
 * Рендерит страницу избранных товаров 
 * @returns {HTMLElement} pageContainer - DOM-элемент страницы
 */

export function renderFavoritesPage() {
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createFavoritesPage();

    const container = pageContainer.querySelector('.container');
    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { text: 'Избранное' }
    ]);
    container.prepend(breadcrumbs);

    initFavoritesPage(pageContainer);

    return pageContainer;
}