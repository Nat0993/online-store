// ============ ИМПОРТЫ ============
import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { renderPageHeader } from '../components/pageHeader.js';
import { renderProductCard } from '../components/product-card.js';
import { getFavoritesWithProducts, toggleFavorite } from '../data.js';
import type { FavoriteItem, Product } from '../types/index.js';

// ============ ТИПЫ ============

/** Элементы DOM страницы избранного */
interface FavoritesPageElements {
    container: HTMLElement;
    favoritesList: HTMLElement;
    breadcrumbs: HTMLElement;
    pageHeader: HTMLElement;
    description: HTMLElement;
}


// ============ УТИЛИТЫ ============

/**
 * Корректировка написания текста относительно кол-ва избранных товаров
 * @param {number} count - количество избранных 
 * @returns {string} слово с верным окончанием
 */
function getProductsWord(count: number): string {
    if (count % 10 === 1 && count % 100 !== 11) return 'товар';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'товара';
    return 'товаров';
}

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку страницы избранных товаров
 * @returns {string} Html-разметка страницы
 */
function createFavoritesPage(): string {
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

// ============ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ============

/**
 * Обновляет заголовок страницы с CSS-анимацией
 * @param {HTMLElement} description - элемент описания
 * @param {number} newCount - новое количество товаров
 */
function updatePageHeader(description: HTMLElement, newCount: number): void {

    // Добавляем класс для анимации исчезновения
    description.classList.add('page-header__description--updating');

    // Ждем немного для анимации и меняем текст
    setTimeout(() => {
        description.textContent = `${newCount} ${getProductsWord(newCount)}, которые Вам понравились`;

        // Убираем класс для анимации появления
        description.classList.remove('page-header__description--updating');
    }, 250); // Половина времени анимации
}

// ============ РАБОТА С КАРТОЧКАМИ ============

/**
 * Заменяет кнопку избранного на кнопку удаления в карточке товара
 * @param {HTMLElement} productCard - DOM-элемент карточки товара
 * @param {string} productId - ID товара
 * @param {FavoritesPageElements} elements - элементы страницы для обратной связи
 */
function replaceFavoriteButton(productCard: HTMLElement, productId: string, elements: FavoritesPageElements): void {
    const favoriteBtn = productCard.querySelector<HTMLButtonElement>('.product-card__favorite');

    if (!favoriteBtn) {
        return;
    }

    // Удаляем старый обработчик на карточке
    const newFavoriteBtn = favoriteBtn.cloneNode(true) as HTMLButtonElement;
    favoriteBtn.parentNode?.replaceChild(newFavoriteBtn, favoriteBtn);

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
    cleanFavoriteBtn.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const listItem = productCard.closest<HTMLElement>('.product-list__item');
        if (listItem) {
            removeFromFavorites(productId, listItem, elements);
        }
    });
}

// ============ УДАЛЕНИЕ ИЗ ИЗБРАННОГО ============

/**
 * Удаляет товар из избранного и обновляет интерфейс
 * @param {string} productId - ID товара
 * @param {HTMLElement} listItem - элемент списка для удаления
 * @param {FavoritesPageElements} elements - элементы страницы для обновления
 */
function removeFromFavorites(productId: string, listItem: HTMLElement, elements: FavoritesPageElements): void {
    const { favoritesList, description } = elements;

    // Удаляем из данных
    toggleFavorite(productId);

    //Обновляем заголовок
    const favorites = getFavoritesWithProducts();
    updatePageHeader(description, favorites.length);

    // Удаляем из DOM с анимацией

    //Находим все карточки после удаляемой
    const allItems = Array.from(favoritesList.querySelectorAll<HTMLElement>('.product-list__item'));
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
        const remainingItems = favoritesList.querySelectorAll<HTMLElement>('.product-list__item');
        if (remainingItems.length === 0) {
            window.history.pushState({}, '', '/favorites');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }, 300);
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику избранного
 * @param {FavoritesPageElements} elements - все элементы страницы
 * @param {FavoriteItem[]} favorites - массив избранных товаров
 */
function initFavoritesPage(elements: FavoritesPageElements, favorites: FavoriteItem[]): void {

    const { favoritesList, breadcrumbs, pageHeader, description } = elements;

    //Очищаем список 
    favoritesList.innerHTML = '';

    //Проверяем, есть ли избранные товары
    if (favorites.length === 0) {
        // Удаляем список товаров
        favoritesList.remove();

        // Удаляем заголовок страницы (если есть)
        pageHeader.remove();

        // Создаем сообщение о пустом избранном
        const emptyMessage = renderEmptyMessage('В Избранном пока нет товаров', 'Выберите понравившиеся Вам товары', { href: '/catalog', label: 'Перейти в каталог' });

        breadcrumbs.after(emptyMessage);

        return;
    }

    // Если есть товары - оставляем заголовок и добавляем товары
    // Отфильтровываем только те, у которых есть product
    const validFavorites = favorites.filter((fav): fav is FavoriteItem & { product: Product } =>
        fav.product !== undefined
    );
    validFavorites.forEach(favItem => {
        const listItem = document.createElement('li');
        listItem.className = 'product-list__item';

        const productCard = renderProductCard(favItem.product);

        // Заменяем кнопку избранного на кнопку удаления
        replaceFavoriteButton(productCard, favItem.product.id, elements);

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
        updatePageHeader(description, updatedFavorites.length);
    });
}



// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит страницу избранных товаров 
 * @returns {HTMLElement} DOM-элемент страницы
 */

export function renderFavoritesPage(): HTMLElement {
    // 1. Создаем контейнер страницы
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createFavoritesPage();

    // 2. Находим основные элементы
    const container = pageContainer.querySelector<HTMLElement>('.container');
    const favoritesList = pageContainer.querySelector<HTMLElement>('.product-list');

    if (!container || !favoritesList) {
        console.error('[FavoritesPage] Не удалось найти основные элементы');
        return pageContainer;
    }

    // 3. Создаем и вставляем хлебные крошки
    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { text: 'Избранное' }
    ]);
    container.prepend(breadcrumbs);

    // 4. Получаем данные и создаем заголовок
    const favorites = getFavoritesWithProducts();
    const descriptionText = `${favorites.length} ${getProductsWord(favorites.length)}, которые Вам понравились`;
    const pageHeader = renderPageHeader('Избранные товары', descriptionText);
    breadcrumbs.after(pageHeader);

    // 5. Находим описание внутри заголовка
    const description = pageHeader.querySelector<HTMLElement>('.page-header__description');
    if (!description) {
        console.error('[FavoritesPage] Не удалось найти описание в заголовке');
        return pageContainer;
    }

    // 6. Собираем все элементы в один объект
    const elements: FavoritesPageElements = {
        container,
        favoritesList,
        breadcrumbs,
        pageHeader,
        description
    };

    // 7. Инициализируем логику страницы, передавая все элементы
    initFavoritesPage(elements, favorites);

    return pageContainer;
}