import { escapeHtml } from '../utils/security.js';
import { addToCart } from '../data.js';

/**
 * Создает HTML-разметку заказа в истории заказов
 * @param {Object} item - объект заказа в истории
 * @returns {string} HTML-разметка
 */
function createOrderItem(order) {
    return `
    <li class="order-item" data-order-id="${escapeHtml(order.id)}">
        <div class="order-item__info">
            <div class="order-item__header">
            <span class="order-item__number">Заказ #${escapeHtml(order.orderNumber)}</span>
            <span class="order-item__date">
                ${new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </span>
            </div>
            <div class="order-item__summary">
            <div class="order-item__goods">
                <span>Товары:</span>
                <span>${order.items.length} шт.</span>
            </div>
            <div class="order-item__summ">
                <span>Сумма:</span>
                <span class="order-item__total">${order.total.toLocaleString()} ₽</span>
            </div>
            </div>
        </div>
        <div class="order-item__btn-inner">
            <button class="order-item__details-btn btn" type="button">
            Подробнее
            </button>
            <button class="order-item__repeat-btn btn" type="button">
            Повторить заказ
            </button>
        </div>
    </li>
    `;
}

/**
 * Инициализирует логику карточки заказа
 * @param {HTMLElement} itemElement - DOM-элемент заказа
 * @param {Object} order - объект заказа
 */
function initOrderItem(itemElement, order) {
    const detailsBtn = itemElement.querySelector('.order-item__details-btn');
    const repeatBtn = itemElement.querySelector('.order-item__repeat-btn');

    /**
     * Открывает детали заказа (пока заглушка)
     */
    function handleShowDetails() {
        console.log('Детали заказа:', order.orderNumber);
        // TODO: модальное окно с деталями
        alert(`Детали заказа #${order.orderNumber}\n\n` +
            `Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}\n` +
            `Товаров: ${order.items.length}\n` +
            `Сумма: ${order.total.toLocaleString()} ₽\n` +
            `Адрес доставки: ${order.customer?.address || 'Не указан'}\n` +
            `Способ оплаты: ${getPaymentMethodText(order.payment)}`);
    }

    /**
     * Возвращает текст способа оплаты
     */
    function getPaymentMethodText(paymentMethod) {
        const paymentMap = {
            'card': 'Картой онлайн',
            'cash': 'Наличными при получении',
            'card_courier': 'Картой курьеру'
        };
        return paymentMap[paymentMethod] || 'Не указан';
    }

    /**
     * Повторяет заказ (добавляет товары в корзину)
     */
    function handleRepeatOrder() {
        console.log('Повтор заказа:', order.orderNumber);

        if (!confirm('Добавить все товары из этого заказа в корзину?')) {
            return;
        }


        order.items.forEach(item => {
            addToCart(item.productId, item.quantity);
        });

        alert(`Товары из заказа #${order.orderNumber} добавлены в корзину!`);

        // Обновляем счетчик корзины
        window.dispatchEvent(new CustomEvent('cart:update'));

        // Можно предложить переход в корзину
        if (confirm('Перейти в корзину?')) {
            window.history.pushState({}, '', '/cart');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }

    // Обработчики событий
    detailsBtn.addEventListener('click', handleShowDetails);
    repeatBtn.addEventListener('click', handleRepeatOrder);
}

/**
 * Рендерит компонент заказа в истории
 * @param {Object} order - объект заказа
 * @returns {HTMLElement} DOM-элемент заказа
 */
export function renderOrderItem(order) {
    const itemContainer = document.createElement('div');
    itemContainer.innerHTML = createOrderItem(order);

    const itemElement = itemContainer.firstElementChild;
    initOrderItem(itemElement, order);

    return itemElement;
}