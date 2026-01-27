import { escapeHtml } from '../utils/security.js';
import { addToCart } from '../data.js';
import { renderOrderDetailsModal } from '../components/orderDetailsModal.js';

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
            <span class="order-item__text order-item__text--bold">Заказ #${escapeHtml(order.orderNumber)}</span>
            <span class="order-item__text">
                ${new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </span>
            </div>
            <div class="order-item__summary">
            <div class="order-item__goods">
                <span class="order-item__text order-item__text--bold">Товары:</span>
                <span class="order-item__text">${order.items.length} шт.</span>
            </div>
            <div class="order-item__summ">
                <span class="order-item__text order-item__text--bold">Сумма:</span>
                <span class="order-item__text">${order.total.toLocaleString()} ₽</span>
            </div>
            </div>
        </div>
        <div class="order-item__btn-inner">
            <button class="order-item__btn btn" id="details-btn" type="button">
            Подробнее
            </button>
            <button class="order-item__btn btn" id="repeat-btn" type="button">
            Повторить заказ
            </button>
        </div>
    </li>
    `;
}

// Глобальная переменная для экземпляра модалки
let orderDetailsModal = null;

/**
 * Инициализирует логику карточки заказа
 * @param {HTMLElement} itemElement - DOM-элемент заказа
 * @param {Object} order - объект заказа
 */
function initOrderItem(itemElement, order) {
    const detailsBtn = itemElement.querySelector('#details-btn');
    const repeatBtn = itemElement.querySelector('#repeat-btn');

    // Инициализируем модалку при первом использовании
    if (!orderDetailsModal) {
        orderDetailsModal = renderOrderDetailsModal();
        document.body.appendChild(orderDetailsModal.container);
    }

    /**
     * Открывает модальное окно с деталями заказа
     */
    function handleShowDetails() {
        console.log('Детали заказа:', order.orderNumber);
        orderDetailsModal.open(order);
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

        try {
            order.items.forEach(item => {
                addToCart(item.productId, item.quantity);
            });

            alert(`Товары из заказа #${order.orderNumber} добавлены в корзину!`);

            window.dispatchEvent(new CustomEvent('cart:update'));

            if (confirm('Перейти в корзину?')) {
                window.history.pushState({}, '', '/cart');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }

        } catch (error) {
            console.error('Ошибка при повторении заказа:', error);
            alert(`Не удалось добавить товары в корзину: ${error.message}\n\nПопробуйте еще раз или обратитесь в поддержку.`);
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