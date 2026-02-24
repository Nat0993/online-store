import { escapeHtml } from '../utils/security.js';
import { updateCartQuantity, removeFromCart, getCartItemsWithProducts } from '../data.js';
import type { CartItemWithProduct } from '../types/index.js';

// Интерфейс для DOM-элементов
interface CartItemElements {
    minusBtn: HTMLButtonElement;
    plusBtn: HTMLButtonElement;
    removeBtn: HTMLButtonElement;
    quantityEl: HTMLElement;
    totalPriceEl: HTMLElement;
    cartItemId: string;
}

/**
 * Получает все необходимые элементы из DOM
 */
function getCartItemElements(itemElement: HTMLElement): CartItemElements | null {
    const minusBtn = itemElement.querySelector<HTMLButtonElement>('.cart-item__quantity-btn--minus');
    const plusBtn = itemElement.querySelector<HTMLButtonElement>('.cart-item__quantity-btn--plus');
    const removeBtn = itemElement.querySelector<HTMLButtonElement>('.cart-item__remove');
    const quantityEl = itemElement.querySelector<HTMLElement>('.cart-item__quantity');
    const totalPriceEl = itemElement.querySelector<HTMLElement>('.cart-item__total-price');
    const cartItemId = itemElement.dataset.cartItemId;

    if (!minusBtn || !plusBtn || !removeBtn || !quantityEl || !totalPriceEl || !cartItemId) {
        console.warn('Не все элементы товара в корзине найдены');
        return null;
    }

    return {
        minusBtn,
        plusBtn,
        removeBtn,
        quantityEl,
        totalPriceEl,
        cartItemId
    };
}

/**
 * Создает HTML-разметку товара в корзине
 * 
 * TODO (API): при подключении бэкенда:
 * 1. Добавить проверку item.product (сейчас всегда есть из data.ts)
 * 2. Создать отдельный рендер для товаров без product (удалены из каталога)
 * 3. Добавить обработку состояния загрузки
 */
function createCartItem(item: CartItemWithProduct): string {
    const totalPrice = item.product.price * item.quantity;

    return `
    <li class="cart-item" data-cart-item-id="${escapeHtml(item.id)}">
        <div class="cart-item__info">
            <img class="cart-item__img" src="${escapeHtml(item.product.image || '')}" alt="${escapeHtml(item.product.name)}" loading="lazy">
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
 * 
 * TODO (API): добавить обработку случая, когда товар удален из каталога
 * (сейчас все товары валидны, так как отфильтрованы в getCartItemsWithProducts)
 */
function initCartItem(itemElement: HTMLElement, item: CartItemWithProduct): void {
    const elements = getCartItemElements(itemElement);
    if (!elements) return;

    const { minusBtn, plusBtn, removeBtn, quantityEl, totalPriceEl, cartItemId } = elements;

    /**
     * Обновляет отображение количества и суммы товара
     */
    function updateItemDisplay(quantity: number): void {
        // TODO (API): добавить проверку item.product перед вычислением
        const totalPrice = item.product.price * quantity;
        quantityEl.textContent = quantity.toString();
        totalPriceEl.textContent = `${totalPrice.toLocaleString()} ₽`;
    }

    /**
     * Обрабатывает удаление товара из корзины
     */
    function handleRemoveItem(): void {
        if (!confirm('Удалить товар из корзины?')) return;

        //Находим все элементы после удаляемого
        const allItems = Array.from(document.querySelectorAll<HTMLElement>('.cart-item'));
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
    function handleDecreaseQuantity(): void {
        const cartItems = getCartItemsWithProducts() as CartItemWithProduct[];
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
    function handleIncreaseQuantity(): void {
        const cartItems = getCartItemsWithProducts() as CartItemWithProduct[];
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
 * 
 * TODO (API):
 * 1. Добавить проверку item.product
 * 2. Для товаров без product рендерить специальную заглушку
 * 3. Добавить состояние загрузки
 */
export function renderCartItem(item: CartItemWithProduct): HTMLElement {
    const itemContainer = document.createElement('div');
    itemContainer.innerHTML = createCartItem(item);

    const itemElement = itemContainer.firstElementChild as HTMLElement | null;

    if (!itemElement) {
        console.error('renderCartItem: не удалось создать элемент');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Ошибка загрузки товара';
        return errorDiv;
    }

    initCartItem(itemElement, item);

    return itemElement;
}