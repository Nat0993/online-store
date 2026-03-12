// ============ ИМПОРТЫ ============
import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderCartItem } from '../components/cartItem.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { getCartItemsWithProducts, saveCurrentCart } from '../data.js';
import { renderCheckoutModal } from '../components/checkoutModal.js';
import type { CartItemWithProduct } from '../types/index.js';

// ============ ТИПЫ ============

/** Элементы DOM страницы корзины */
interface CartPageElements {
    cartList: HTMLElement;
    cartMain: HTMLElement;
    checkoutBtn: HTMLButtonElement;
    clearBtn: HTMLButtonElement;
    itemsTotalEl: HTMLElement;
    deliveryPriceEl: HTMLElement;
    totalPriceEl: HTMLElement;
    breadcrumbs: HTMLElement;
    pageHeader: HTMLElement;
}

// ============ КОНСТАНТЫ ============

/** Порог бесплатной доставки */
const FREE_DELIVERY_THRESHOLD = 5000;

/** Стоимость доставки */
const DELIVERY_COST = 500;

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку страницы корзины
 * @returns {string} HTML-разметка
 */
function createCartPage(): string {
    return `
    <section class="cart">
        <div class="container">
            <!-- breadcrumbs добавим через JS -->
            
            <div class="cart__header page-header">
                <h1 class="page-header__title">Корзина</h1>
                <span class="page-header__description">Товары, которые Вы выбрали</span>
            </div>

            <div class="cart__content">
                <!-- EmptyMessage добавим динамически при необходимости -->

                <!-- Контент корзины -->
                <div class="cart__main">
                    <ul class="cart__list">
                        <li class="cart__loading">Загрузка корзины...</li>
                    </ul>

                    <div class="cart__sidebar">
                        <div class="cart__total">
                            <h3 class="cart__total-title">Ваш заказ</h3>
                            <div class="cart__total-row">
                                <span class="cart__total-text">Товары:</span>
                                <span class="cart__total-price" id="items-total">0 ₽</span>
                            </div>
                            <div class="cart__total-row">
                                <span class="cart__total-text">Доставка:</span>
                                <span class="cart__total-price" id="delivery-price">0 ₽</span>
                            </div>
                            <div class="cart__total-row cart__total-row--final">
                                <span class="cart__total-text">Итого:</span>
                                <span class="cart__total-price cart__total-price--final" id="total-price">0 ₽</span>
                            </div>
                        </div>

                        <button class="cart__checkout-btn btn" type="button" disabled>
                            Оформить заказ
                        </button>

                        <button class="cart__clear-btn" type="button">
                            Очистить корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
}

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param {HTMLElement} container - контейнер страницы
 * @returns {CartPageElements | null} объект с элементами или null
 */
function getCartPageElements(container: HTMLElement): CartPageElements | null {
    const cartList = container.querySelector<HTMLElement>('.cart__list');
    const cartMain = container.querySelector<HTMLElement>('.cart__main');
    const checkoutBtn = container.querySelector<HTMLButtonElement>('.cart__checkout-btn');
    const clearBtn = container.querySelector<HTMLButtonElement>('.cart__clear-btn');
    const itemsTotalEl = container.querySelector<HTMLElement>('#items-total');
    const deliveryPriceEl = container.querySelector<HTMLElement>('#delivery-price');
    const totalPriceEl = container.querySelector<HTMLElement>('#total-price');
    const breadcrumbs = container.querySelector<HTMLElement>('.breadcrumbs');
    const pageHeader = container.querySelector<HTMLElement>('.page-header');

    if (!cartList || !cartMain || !checkoutBtn || !clearBtn || 
        !itemsTotalEl || !deliveryPriceEl || !totalPriceEl ||
        !breadcrumbs || !pageHeader) {
        console.warn('[CartPage] Не все элементы найдены');
        return null;
    }

    return {
        cartList,
        cartMain,
        checkoutBtn,
        clearBtn,
        itemsTotalEl,
        deliveryPriceEl,
        totalPriceEl,
        breadcrumbs,
        pageHeader
    };
}

// ============ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ============

/**
 * Обновляет блок с итоговой стоимостью заказа
 * @param {CartPageElements} elements - элементы страницы
 */
function updateTotals(elements: CartPageElements): void {
    const cartItems = getCartItemsWithProducts() as CartItemWithProduct[];
    const { itemsTotalEl, deliveryPriceEl, totalPriceEl, checkoutBtn } = elements;

    // В случае пустой корзины
    if (cartItems.length === 0) {
        itemsTotalEl.textContent = '0 ₽';
        deliveryPriceEl.textContent = '0 ₽';
        totalPriceEl.textContent = '0 ₽';
        checkoutBtn.disabled = true;
        return;
    }

    // Расчет сумм для непустой корзины
    const itemsTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    // Бесплатная доставка при заказе от 5000 рублей
    const deliveryPrice = itemsTotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
    const totalPrice = itemsTotal + deliveryPrice;

    // Отоброжение сумм в разметке
    itemsTotalEl.textContent = `${itemsTotal.toLocaleString()} ₽`;
    deliveryPriceEl.textContent = deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString()} ₽`;
    totalPriceEl.textContent = `${totalPrice.toLocaleString()} ₽`;

    // Активация кнопки оформления заказа
    checkoutBtn.disabled = false;
}

// ============ ОБРАБОТЧИКИ ============

/**
 * Обрабатывает очистку всей корзины
 * @param {CartPageElements} elements - элементы страницы
 */
function handleClearCart(elements: CartPageElements, pageContainer: HTMLElement): void {
    const cartItems = getCartItemsWithProducts();

    // Проверка на пустую корзину
    if (cartItems.length === 0) return;

    // Подтверждение действия пользователем
    if (confirm('Очистить всю корзину?')) {
        saveCurrentCart([]);
        updateCartDisplay(elements, pageContainer);

        // Отправка события для обновления счетчиков в хедере
        window.dispatchEvent(new CustomEvent('cart:update'));
    }
}

/**
 * Обрабатывает оформление заказа
 */
function handleCheckout() {
    // Создаем модалку
    const checkoutModal = renderCheckoutModal();

    // Добавляем контейнер модалки в DOM (если еще не добавлен)
    if (!document.body.contains(checkoutModal.container)) {
        document.body.appendChild(checkoutModal.container);
    }

    // Открываем модалку
    checkoutModal.open();
}

// ============ ОБНОВЛЕНИЕ СТРАНИЦЫ ============

/**
 * Обновляет отображение всей страницы корзины
 * @param {CartPageElements} elements - элементы страницы
 * @param {HTMLElement} pageContainer - контейнер страницы
 */
function updateCartDisplay(elements: CartPageElements, pageContainer: HTMLElement): void {
    const cartItems = getCartItemsWithProducts() as CartItemWithProduct[];
    const { cartList, cartMain, breadcrumbs, pageHeader } = elements;

    // Удаляем все существующие empty-message элементы
    const existingEmptyMessages = pageContainer.querySelectorAll('.empty-message');
    existingEmptyMessages.forEach(msg => {
        if (msg.parentNode) {
            msg.remove();
        }
    });

    // Очищаем список перед добавлением новых элементов
    cartList.innerHTML = '';

    // Если корзина пустая
    if (cartItems.length === 0) {
        // Удаляем основной контент корзины
        cartMain.remove();

        // Удаляем заголовок страницы
        pageHeader.remove();

        // Создаем и добавляем сообщение о пустой корзине
        const emptyMessage = renderEmptyMessage(
            'Корзина пуста',
            'Добавьте товары из каталога',
            { href: '/catalog', label: 'Перейти в каталог' }
        );

        //Добавляем хлебные крошки
        breadcrumbs.after(emptyMessage);

        // Обновляем итоги для пустой корзины
        updateTotals(elements);

        return;
    }

    // Есть товары - рендерим каждый товар через компонент cartItem
    cartItems.forEach(item => {
        const cartItemElement = renderCartItem(item);
        cartList.appendChild(cartItemElement);
    });

    // Обновляем блок с суммами
    updateTotals(elements);
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику страницы корзины
 * @param {HTMLElement} pageContainer - DOM-элемент контейнера страницы корзины
 */
function initCartPage(pageContainer: HTMLElement): void {
    const elements = getCartPageElements(pageContainer);
    
    if (!elements) {
        console.error('[CartPage] Не удалось получить элементы страницы');
        return;
    }

    const { clearBtn, checkoutBtn } = elements;

    // ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
    clearBtn.addEventListener('click', () => handleClearCart(elements, pageContainer));
    checkoutBtn.addEventListener('click', handleCheckout);

    // ===== СЛУШАТЕЛИ СОБЫТИЙ =====
    window.addEventListener('cart:update', () => {
        updateCartDisplay(elements, pageContainer);
    });

    // При смене пользователя перезагружаем страницу
    window.addEventListener('auth:change', () => {
        if (window.location.pathname === '/cart') {
            // Небольшая задержка для гарантии, что данные в data.js обновились
            setTimeout(() => {
                window.history.pushState({}, '', '/cart');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 150);
        }
    });

    // ===== ПЕРВОНАЧАЛЬНОЕ ОБНОВЛЕНИЕ =====
    updateCartDisplay(elements, pageContainer);
}

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит страницу корзины
 * Создает DOM-элемент страницы, добавляет breadcrumbs и инициализирует логику
 * @returns {HTMLElement} DOM-элемент страницы корзины
 */
export function renderCartPage(): HTMLElement {
    // Создаем контейнер страницы
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCartPage();

    // Добавляем breadcrumbs для навигации
    const container = pageContainer.querySelector<HTMLElement>('.container');

    if (container) {
        const breadcrumbs = renderBreadcrumbs([
            { url: '/', text: 'Главная' },
            { text: 'Корзина' }
        ]);
        container.prepend(breadcrumbs);
    }

    // Инициализируем логику страницы
    initCartPage(pageContainer);

    return pageContainer;
}


