import { escapeHtml } from '../utils/security.js';
import { updateCartQuantity, removeFromCart, getCartItemsWithProducts } from '../data.js';


/**
 * Создает HTML-разметку товара в корзине
 * @param {Object} item - объект товара в корзине
 * @returns {string} HTML-разметка
 */
function createCartItem(item) {
    const totalPrice = item.product.price * item.quantity;

    return `
    <li class="cart-item" data-cart-item-id="${escapeHtml(item.id)}">
        <div class="cart-item__info">
            <img class="cart-item__img" src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}" loading="lazy">
            <div class="cart-item__inner">
                <h3 class="cart-item__title">${escapeHtml(item.product.name)}</h3>
                <span class="cart-item__price">${item.product.price.toLocaleString()} ₽</span>
            </div>
        </div>
        
        
        <div class="cart-item__wrapper">
            <div class="cart-item__total">
                <div class="cart-item__controls">
                    <button class="cart-item__quantity-btn cart-item__quantity-btn--minus" type="button" aria-label="Уменьшить количество">
                        -
                    </button>
                    <span class="cart-item__quantity">${item.quantity}</span>
                    <button class="cart-item__quantity-btn cart-item__quantity-btn--plus" type="button" aria-label="Увеличить количество">
                        +
                    </button>
                </div>
                <span class="cart-item__total-price">${totalPrice.toLocaleString()} ₽</span>
            </div>

            <button class="cart-item__remove" type="button" aria-label="Удалить товар">
                <svg aria-hidden="true">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                </svg>
            </button>
        </div>
    </li>
    `;
}

/**
 * Инициализирует логику товара в корзине
 * @param {HTMLElement} itemElement - DOM-элемент товара
 * @param {Object} item - объект товара
 */
function initCartItem(itemElement, item) {
    const minusBtn = itemElement.querySelector('.cart-item__quantity-btn--minus');
    const plusBtn = itemElement.querySelector('.cart-item__quantity-btn--plus');
    const removeBtn = itemElement.querySelector('.cart-item__remove');
    const quantityEl = itemElement.querySelector('.cart-item__quantity');
    const totalPriceEl = itemElement.querySelector('.cart-item__total-price');
    const cartItemId = itemElement.dataset.cartItemId;

    /**
     * Обновляет отображение количества и суммы товара
     * @param {number} quantity - новое количество
     */
    function updateItemDisplay(quantity) {
        const totalPrice = item.product.price * quantity;
        quantityEl.textContent = quantity;
        totalPriceEl.textContent = `${totalPrice.toLocaleString()} ₽`;
    }

    /**
     * Обрабатывает удаление товара из корзины
     */
    function handleRemoveItem() {
        if (!confirm('Удалить товар из корзины?')) return; 

        //Находим все элементы после удаляемого
        const allItems = Array.from(document.querySelectorAll('.cart-item'));
        const removedIndex = allItems.indexOf(itemElement);
        const itemsAfter = allItems.slice(removedIndex + 1);

        // Добавляем классы для анимации
        itemsAfter.forEach(item => {
            item.classList.add('cart-item--sliding');
        });

        // Анимация удаления текущего элемента
        itemElement.classList.add('cart-item--removing');

        // Удаляем из данных и DOM после анимации
        setTimeout(() => {
            removeFromCart(cartItemId);
            
            // Возвращаем остальные карточки на место
            itemsAfter.forEach(item => {
                item.classList.remove('cart-item--sliding');
            });
            
            // Обновляем глобальное состояние
            window.dispatchEvent(new CustomEvent('cart:update'));
        }, 300);
    }

    /**
     * Обрабатывает уменьшение количества товара
     */
    function handleDecreaseQuantity() {
        const cartItems = getCartItemsWithProducts();
        const cartItem = cartItems.find(cartItem => cartItem.id === cartItemId);

        if (cartItem && cartItem.quantity > 1) {
            const newQuantity = cartItem.quantity - 1;
            updateCartQuantity(cartItemId, newQuantity);
            updateItemDisplay(newQuantity);
            window.dispatchEvent(new CustomEvent('cart:update'));
        } else if (cartItem && cartItem.quantity === 1) {
            handleRemoveItem();
        }
    }

    /**
     * Обрабатывает увеличение количества товара
     */
    function handleIncreaseQuantity() {
        const cartItems = getCartItemsWithProducts();
        const cartItem = cartItems.find(cartItem => cartItem.id === cartItemId);

        if (cartItem) {
            const newQuantity = cartItem.quantity + 1;
            updateCartQuantity(cartItemId, newQuantity);
            updateItemDisplay(newQuantity);
            window.dispatchEvent(new CustomEvent('cart:update'));
        }
    }

    // Назначаем обработчики событий
    minusBtn.addEventListener('click', handleDecreaseQuantity);
    plusBtn.addEventListener('click', handleIncreaseQuantity);
    removeBtn.addEventListener('click', handleRemoveItem);
}

/**
 * Рендерит компонент товара в корзине
 * @param {Object} item - объект товара
 * @returns {HTMLElement} DOM-элемент товара
 */
export function renderCartItem(item) {
    const itemContainer = document.createElement('div');
    itemContainer.innerHTML = createCartItem(item);

    const itemElement = itemContainer.firstElementChild;
    initCartItem(itemElement, item);

    return itemElement;
}