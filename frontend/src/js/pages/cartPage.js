import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderCartItem } from '../components/cartItem.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { getCartItemsWithProducts, saveCurrentCart } from '../data.js';

/**
 * Создает HTML-разметку страницы корзины
 * @returns {string} HTML-разметка
 */
function createCartPage() {
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

/**
 * Инициализирует логику страницы корзины
 * @param {HTMLElement} pageContainer - DOM-элемент контейнера страницы корзины
 */
function initCartPage(pageContainer) {
    // Получаем DOM-элементы
    const cartList = pageContainer.querySelector('.cart__list');
    const cartMain = pageContainer.querySelector('.cart__main');
    const checkoutBtn = pageContainer.querySelector('.cart__checkout-btn');
    const clearBtn = pageContainer.querySelector('.cart__clear-btn');
    const itemsTotalEl = pageContainer.querySelector('#items-total');
    const deliveryPriceEl = pageContainer.querySelector('#delivery-price');
    const totalPriceEl = pageContainer.querySelector('#total-price');

    /**
     * Обновляет блок с итоговой стоимостью заказа
     * Рассчитывает суммы товаров, доставки и общую стоимость
     * Обновляет состояние кнопки оформления заказа
     */
    function updateTotals() {
        const cartItems = getCartItemsWithProducts();

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
        const deliveryPrice = itemsTotal > 5000 ? 0 : 500;
        const totalPrice = itemsTotal + deliveryPrice;

        // Отоброжение сумм в разметке
        itemsTotalEl.textContent = `${itemsTotal.toLocaleString()} ₽`;
        deliveryPriceEl.textContent = deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString()} ₽`;
        totalPriceEl.textContent = `${totalPrice.toLocaleString()} ₽`;

        // Активация кнопки оформления заказа
        checkoutBtn.disabled = false;
    }

    /**
     * Обрабатывает очистку всей корзины
     */
    function handleClearCart() {
        const cartItems = getCartItemsWithProducts();

        // Проверка на пустую корзину
        if (cartItems.length === 0) return;

        // Подтверждение действия пользователем
        if (confirm('Очистить всю корзину?')) {
            saveCurrentCart([]);
            updateCartDisplay();

            // Отправка события для обновления счетчиков в хедере
            window.dispatchEvent(new CustomEvent('cart:update'));
        }
    }

    /**
     * Обрабатывает оформление заказа
     * Временная заглушка (будет реализована полная логика оформления)
     */
    function handleCheckout() {
        const cartItems = getCartItemsWithProducts();

        // Проверка на пустую корзину
        if (cartItems.length === 0) return;

        // Временная реализация
        alert('Функция оформления заказа в разработке! Скоро будет доступна.');
    }

    /**
    * Обновляет отображение всей страницы корзины
    * Определяет состояние корзины (пустая/не пустая) и показывает соответствующий контент
    * Обновляет блок с итоговыми суммами
    */
    function updateCartDisplay() {
        const cartItems = getCartItemsWithProducts();

        // Очищаем список перед добавлением новых элементов
        cartList.innerHTML = '';

        // Если корзина пустая
        if (cartItems.length === 0) {
            // Удаляем основной контент корзины
            cartMain.remove();

            // Удаляем заголовок страницы
            const pageHeader = pageContainer.querySelector('.page-header');
            if (pageHeader) {
                pageHeader.remove();
            }

            // Создаем и добавляем сообщение о пустой корзине
            const emptyMessage = renderEmptyMessage(
                'Корзина пуста',
                'Добавьте товары из каталога',
                { url: '/catalog', text: 'Перейти в каталог' }
            );

            const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
            breadcrumbs.after(emptyMessage);

            // Обновляем итоги для пустой корзины
            updateTotals();

            return;
        }

        // Есть товары - рендерим каждый товар через компонент cartItem
        cartItems.forEach(item => {
            const cartItemElement = renderCartItem(item);
            cartList.appendChild(cartItemElement);
        });

        // Обновляем блок с суммами
        updateTotals();
    }

    // Назначаем обработчики событий
    clearBtn.addEventListener('click', handleClearCart);
    checkoutBtn.addEventListener('click', handleCheckout);

    // Слушаем глобальные события обновления корзины
    window.addEventListener('cart:update', updateCartDisplay);

    // Первоначальная инициализация отображения
    updateCartDisplay();
}

/**
 * Рендерит страницу корзины
 * Создает DOM-элемент страницы, добавляет breadcrumbs и инициализирует логику
 * @returns {HTMLElement} DOM-элемент страницы корзины
 */
export function renderCartPage() {
    // Создаем контейнер страницы
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCartPage();

    // Добавляем breadcrumbs для навигации
    const container = pageContainer.querySelector('.container');
    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { text: 'Корзина' }
    ]);
    container.prepend(breadcrumbs);

    // Инициализируем логику страницы
    initCartPage(pageContainer);

    return pageContainer;
}


