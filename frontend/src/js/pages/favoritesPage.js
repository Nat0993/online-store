import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { renderPageHeader } from '../components/pageHeader.js';
import { renderProductCard } from '../components/product-card.js';
import { getFavoritesWithProducts, toggleFavorite } from '../data.js';

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

                <ul class="product-list">
                    <!-- здесь будут подгружаться карточки -->
                    <li class="favorites__loading">Загрузка избранных товаров...</li>
                </ul>
            </div>
        </section>
    `;
}

/**
 * Заменяет кнопку избранного на кнопку удаления в карточке товара
 * @param {HtmlElement} productCard - DOM-элемент карточки товара
 * @param {string} productId - ID товара
 */
function replaceFavoriteButton(productCard, productId) {
    const favoriteBtn = productCard.querySelector('.product-card__favorite');

    if (!favoriteBtn) {
        return;
    }

    // Удаляем старый обработчик на карточке
    const newFavoriteBtn = favoriteBtn.cloneNode(true);
    favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);

    // Теперь работаем с новой кнопкой
    const cleanFavoriteBtn = newFavoriteBtn;
    
    // Заменяем разметку
    cleanFavoriteBtn.innerHTML = `
        <svg class="product-card__favorite-icon product-card__favorite-icon--remove" aria-hidden="true">
            <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
        </svg>
    `;

    cleanFavoriteBtn.className = 'product-card__favorite product-card__favorite--remove';
    cleanFavoriteBtn.setAttribute('aria-label', 'Удалить из избранного');

    // Добавляем новый обработчик
    cleanFavoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromFavorites(productId, productCard.closest('.product-list__item'));
    });
}

/**
 * Обновляет заголовок страницы с CSS-анимацией
 * @param {number} newCount - новое количество товаров
 */
function updatePageHeader(newCount) {
    const description = document.querySelector('.page-header__description');
    if (!description) return;

    // Добавляем класс для анимации исчезновения
    description.classList.add('page-header__description--updating');

    // Ждем немного для анимации и меняем текст
    setTimeout(() => {
        description.textContent = `${newCount} ${getProductsWord(newCount)}, которые Вам понравились`;
        
        // Убираем класс для анимации появления
        description.classList.remove('page-header__description--updating');
    }, 250); // Половина времени анимации
}

/**
 * Удаляет товар из избранного и обновляет интерфейс
 * @param {string} productId - ID товара
 * @param {HTMLElement} listItem - элемент списка для удаления
 */
function removeFromFavorites(productId, listItem) {
    // Удаляем из данных
    toggleFavorite(productId);

    //Обновляем заголовок
    const favorites = getFavoritesWithProducts();
    updatePageHeader(favorites.length);

    // Удаляем из DOM с анимацией

    //Находим все карточки после удаляемой
    const allItems = Array.from(document.querySelectorAll('.product-list__item'));
    const removedIndex = allItems.indexOf(listItem);
    const itemsAfter = allItems.slice(removedIndex + 1);

    // Добавляем классы для анимации
    itemsAfter.forEach(item => {
        item.classList.add('product-list__item--sliding');
    });

    listItem.classList.add('product-list__item--removing');

    //Удаление
    setTimeout(() => {
        listItem.remove();

        // Возвращаем остальные карточки на место
        itemsAfter.forEach(item => {
            item.classList.remove('product-list__item--sliding');
        });
        
        // Обновляем счетчики
        window.dispatchEvent(new CustomEvent('favorites:update'));

        // Если товаров не осталось - перезагружаем страницу
        const remainingItems = document.querySelectorAll('.product-list__item');
        if (remainingItems.length === 0) {
            window.history.pushState({}, '', '/favorites');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }, 300);
}

/**
 * Инициализирует логику избранного
 * @param {HTMLElement} pageContainer - контейнер страницы 
 * @param {Array} favorites - массив избранных товаров
 */
function initFavoritesPage(pageContainer, favorites) {
    const favoritesList = pageContainer.querySelector('.product-list')

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
        const emptyMessage = renderEmptyMessage('В Избранном пока нет товаров', 'Выберите понравившиеся Вам товары', { url: '/catalog', text: 'Перейти в каталог' });

        const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
        breadcrumbs.after(emptyMessage);
        return;
    }

    // Если есть товары - оставляем заголовок и добавляем товары
    favorites.forEach(favItem => {
        const listItem = document.createElement('li');
        listItem.className = 'product-list__item';

        const productCard = renderProductCard(favItem.product);

        // Заменяем кнопку избранного на кнопку удаления
        replaceFavoriteButton(productCard, favItem.product.id);
        
        listItem.appendChild(productCard);
        favoritesList.appendChild(listItem);
    });

    // При смене пользователя перезагружаем страницу
    window.addEventListener('auth:change', () => {
        if (window.location.pathname === '/favorites') {
            // Небольшая задержка для гарантии, что данные в data.js обновились
            setTimeout(() => {
                window.history.pushState({}, '', '/favorites');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 150);
        }
    });

    // Слушаем обновления избранного для обновления заголовка
    window.addEventListener('favorites:update', () => {
        const updatedFavorites = getFavoritesWithProducts();
        updatePageHeader(updatedFavorites.length);
    });
}

/**
 * Корректировка написания текста относительно кол-ва избранных товаров
 * @param {Number} count - количество избранных 
 * @returns {String} слово с верным окончанием
 */
function getProductsWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'товар';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'товара';
    return 'товаров';
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

    const favorites = getFavoritesWithProducts();
    const description = `${favorites.length} ${getProductsWord(favorites.length)}, которые Вам понравились`;
    const pageHeader = renderPageHeader('Избранные товары', description);
    breadcrumbs.after(pageHeader);

    initFavoritesPage(pageContainer, favorites);

    return pageContainer;
}