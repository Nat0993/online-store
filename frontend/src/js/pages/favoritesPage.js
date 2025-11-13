import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { renderPageHeader } from '../components/pageHeader.js';
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
                <!-- здесь будет заголовок или сообщение о пустоте -->

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
        // Удаляем список товаров
        favoritesList.remove();
        
        // Удаляем заголовок страницы (если есть)
        const pageHeader = pageContainer.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.remove();
        }

        // Создаем сообщение о пустом избранном
        const emptyMessage = renderEmptyMessage('В Избранном пока нет товаров', 'Выберите понравившиеся Вам товары', {url: '/catalog', text: 'Перейти в каталог'});

        const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
        breadcrumbs.after(emptyMessage);
        return;
    }

    // Если есть товары - оставляем заголовок и добавляем товары
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

    const pageHeader = renderPageHeader('Избранные товары', 'Товары, которые Вам понравились');
    breadcrumbs.after(pageHeader);
    
    initFavoritesPage(pageContainer);

    return pageContainer;
}