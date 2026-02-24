import {
    addToCart,
    removeFromCart,
    toggleFavorite,
    getCartItemsWithProducts,
    updateCartQuantity,
    getCurrentCart,
    getCurrentFavorites,
} from '../data.js';
import { escapeHtml, isValidProduct } from '../utils/security.js';
import { CartItem, FavoriteItem, Product } from '../types/index.js';

/**
 * Проверяет, находится ли товар в избранном
 * @param {string} productId - ID товара
 * @returns {boolean} true если товар в избранном
 */
function getIsFavorite(productId: string): boolean {
    const currentFavorites = getCurrentFavorites();
    return currentFavorites.some((fav: FavoriteItem) => fav.productId === productId);
}

interface ProductCardElements {
    card: HTMLElement;
    cartControls: HTMLElement;
    favoriteBtn: HTMLButtonElement;
    productId: string;
}

/**
 * Получает все необходимые элементы из DOM
 * @param container - контейнер карточки товара
 * @returns объект с элементами или null
 */
function getProductCardElements(container: HTMLElement): ProductCardElements | null {
    const cartControls = container.querySelector<HTMLElement>('.product-card__cart-controls');
    const productId = container.dataset.productId;
    const favoriteBtn = container.querySelector<HTMLButtonElement>('.product-card__favorite');

    if (!cartControls || !productId || !favoriteBtn) {
        console.warn('Не все элементы карточки найдены');
        return null;
    }

    return {
        card: container,
        cartControls,
        favoriteBtn,
        productId
    }
}

/**
 * Создает HTML-разметку карточки товара
 * @param {Object} product - Объект товара
 * @returns {string} HTML-разметка карточки
 */
function createProductCard(product: Product): string {
    const isFavorite = getIsFavorite(product.id);

    return `
    <div class="product-card" data-product-id="${escapeHtml(product.id)}">
            <img class="product-card__image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
            <button class="product-card__favorite ${isFavorite ? 'product-card__favorite--active' : ''}" 
                    type="button" aria-label="Добавить в избранное">
                <svg class="product-card__favorite-icon" width="30" height="30">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-favorite-card"></use>
                </svg>
                <svg class="product-card__favorite-icon product-card__favorite-icon--active">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-favorite-card-active"></use>
                </svg>
            </button>
            <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
            <span class="product-card__price">${product.price.toLocaleString()} ₽</span>
            <div class="product-card__cart-controls">
                <button class="product-card__cart-btn btn" type="button">
                    В корзину
                </button>
            </div>
        </div>
    `;
}

/**
 * Обновляет состояние кнопки избранного
 * @param - объект элементов карточки товара
 */
function updateFavoriteState(elements: ProductCardElements): void {
    const isFavorite = getIsFavorite(elements.productId);
    elements.favoriteBtn.classList.toggle('product-card__favorite--active', isFavorite);
}

/**
 * Обновляет отображение корзины (кнопка или счетчик)
 * @param - объект элементов карточки товара
 */
function updateCartButton(elements: ProductCardElements): void {
    const currentCart = getCurrentCart();
    const cartItem = currentCart.find((item: CartItem) => item.productId === elements.productId);
    const inCart = Boolean(cartItem);
    const quantity = inCart ? cartItem.quantity : 0;

    if (inCart) {
        console.log('Товар в корзине, показываем счетчик');
        renderCartCounter(elements, quantity);
        setupCartHandlers(elements);
    } else {
        console.log('Товара нет в корзине, показываем кнопку');
        renderAddToCardButton(elements);
        setupAddToCartHandler(elements);
    }
}

/**
 * Рендерит счетчик количества в корзине
 * @param - объект элементов карточки товара, количество 
 */
function renderCartCounter(elements: ProductCardElements, quantity: number): void {
    elements.cartControls.innerHTML = `
                <button class="product-card__quantity-btn product-card__quantity-btn--minus" type="button" aria-label="Уменьшить количество">
                    -
                </button>
                <span class="product-card__quantity">${quantity}</span>
                <button class="product-card__quantity-btn product-card__quantity-btn--plus" type="button" aria-label="Увеличить количество">
                    +
                </button>
            `;
    elements.cartControls.classList.add('product-card__cart-controls--active');
}

/**
 * Рендерит кнопку "В корзину"
 * @param - объект элементов карточки товара
 */
function renderAddToCardButton(elements: ProductCardElements): void {
    elements.cartControls.innerHTML = `
                <button class="product-card__cart-btn btn" type="button">
                    В корзину
                </button>
            `;
    elements.cartControls.classList.remove('product-card__cart-controls--active');
}

/**
 * Обработчик добавления в избранное
 */
function handleFavoriteClick(elements: ProductCardElements): void {
    toggleFavorite(elements.productId);
    updateFavoriteState(elements);
    window.dispatchEvent(new CustomEvent('favorites:update'))
}

/**
 * Обработчик добавления в корзину
 */
function handleAddToCart(elements: ProductCardElements): void {
    addToCart(elements.productId);
    updateCartButton(elements);
    window.dispatchEvent(new CustomEvent('cart:update'));
}

/**
 * Обработчик уменьшения количества
 */
function handleDecreaseQuantity(elements: ProductCardElements): void {
    const cartItems = getCartItemsWithProducts();
    const cartItem = cartItems.find((item: CartItem) => item.productId === elements.productId);

    if (cartItem) {
        updateCartQuantity(cartItem.id, cartItem.quantity - 1);
        updateCartButton(elements);
        window.dispatchEvent(new CustomEvent('cart:update'));
    }
}

/**
 * Обработчик увеличения количества
 */
function handleIncreaseQuantity(elements: ProductCardElements): void {
    addToCart(elements.productId, 1);
    updateCartButton(elements);
    window.dispatchEvent(new CustomEvent('cart:update'));
}

/**
 * Настраивает обработчики для режима "счетчик"
 */
function setupCartHandlers(elements: ProductCardElements): void {
    const minusBtn = elements.cartControls.querySelector<HTMLButtonElement>('.product-card__quantity-btn--minus');
    const plusBtn = elements.cartControls.querySelector<HTMLButtonElement>('.product-card__quantity-btn--plus');

    if (!minusBtn || !plusBtn) return;

    minusBtn.addEventListener('click', () => handleDecreaseQuantity(elements));

    plusBtn.addEventListener('click', () => handleIncreaseQuantity(elements));
}

/**
 * Настраивает обработчик для режима "кнопка"
 */
function setupAddToCartHandler(elements: ProductCardElements): void {
    const cartBtn = elements.cartControls.querySelector<HTMLButtonElement>('.product-card__cart-btn');

    if (!cartBtn) return;

    cartBtn.addEventListener('click', () => handleAddToCart(elements));
}

/**
 * Инициализирует логику карточки товара (избранное, корзина, события)
 * @param - DOM-элемент карточки товара
 */
function initProductCard(cardElement: HTMLElement): void {
    const elements = getProductCardElements(cardElement);
    if(!elements) return;

    // Обработчик кнопки избранного
    elements.favoriteBtn.addEventListener('click', () => handleFavoriteClick(elements));

    //Слушаем событие авторизации для смены интерфейса выбранных товров
    window.addEventListener('auth:change', (() => {
        console.log('Обновляем карточку после смены пользователя:');
        updateCartButton(elements);
        updateFavoriteState(elements);
    }) as EventListener);

    updateCartButton(elements);
    updateFavoriteState(elements);
}

/**
 * Рендерит карточку товара
 * @param {Object} product - Объект товара
 * @returns {HTMLElement} DOM-элемент карточки товара
 */
export function renderProductCard(product: Product): HTMLElement {
    if (!isValidProduct(product)) {
        console.error('Invalid product provided to renderProductCard:', product);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'product-card product-card--error';
        errorDiv.textContent = 'Ошибка загрузки товара';
        return errorDiv;
    }

    const cardContainer = document.createElement('div');
    cardContainer.innerHTML = createProductCard(product);

    const cardElement = cardContainer.firstElementChild as HTMLElement | null;

    if (!cardElement) {
        console.error('renderProductCard: не удалось создать элемент');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'product-card product-card--error';
        errorDiv.textContent = 'Ошибка создания карточки товара';
        return errorDiv;
    }

    initProductCard(cardElement);

    return cardElement;
}