// ============ ИМПОРТЫ ============
import { escapeHtml } from '../utils/security.js';
import { addToCart } from '../data.js';
import { renderOrderDetailsModal } from './orderDetailsModal.js';
import { Order } from '../types/index.js';

// ============ ТИПЫ ============

/**
 * Интерфейс модального окна с деталями заказа
 */
interface OrderDetailsModal {
    container: HTMLElement;
    open: (order: Order) => void;
}

// ============ СОСТОЯНИЕ ============

/** Глобальная переменная для экземпляра модалки (синглтон) */
let orderDetailsModal: OrderDetailsModal | null = null;


// ============ УТИЛИТЫ ============

/**
 * Форматирует дату заказа для отображения
 */
function formatOrderDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку заказа в истории заказов
 */
function createOrderItem(order: Order): string {
    const formattedDate = formatOrderDate(order.createdAt);

    return `
    <li class="order-item" data-order-id="${escapeHtml(order.id)}">
        <div class="order-item__info">
            <div class="order-item__header">
            <span class="order-item__text order-item__text--bold">Заказ #${escapeHtml(order.orderNumber)}</span>
            <span class="order-item__text">
                ${escapeHtml(formattedDate)}
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

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику карточки заказа
 */
function initOrderItem(itemElement: HTMLElement, order: Order): void {
    const detailsBtn = itemElement.querySelector<HTMLButtonElement>('#details-btn');
    const repeatBtn = itemElement.querySelector<HTMLButtonElement>('#repeat-btn');

    if (!detailsBtn || !repeatBtn) {
        console.warn('Кнопки не найдены в элементе заказа');
        return;
    }

    // Инициализируем модалку при первом использовании
    if (!orderDetailsModal) {
        try {
            orderDetailsModal = renderOrderDetailsModal() as OrderDetailsModal;
            document.body.appendChild(orderDetailsModal.container);
        } catch (error) {
            console.error('Не удалось создать модалку заказа:', error);
            return;
        }
    }

    /**
     * Открывает модальное окно с деталями заказа
     */
    function handleShowDetails(): void {
        console.log('Детали заказа:', order.orderNumber);
        orderDetailsModal?.open(order);
    }

    /**
     * Повторяет заказ (добавляет товары в корзину)
     */
    function handleRepeatOrder(): void {
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
            
            const message = error instanceof Error 
                ? error.message 
                : 'Неизвестная ошибка';
                
            alert(`Не удалось добавить товары в корзину: ${message}\n\nПопробуйте еще раз или обратитесь в поддержку.`);
        }
    }

    // ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
    detailsBtn.addEventListener('click', handleShowDetails);
    repeatBtn.addEventListener('click', handleRepeatOrder);
}

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит компонент заказа в истории
 * @param {Object} order - объект заказа
 * @returns {HTMLElement} DOM-элемент заказа
 */
export function renderOrderItem(order: Order): HTMLElement {
    if (!order) {
        throw new Error('Требуется заказ');
    }

    const itemContainer = document.createElement('div');
    itemContainer.innerHTML = createOrderItem(order);

    const itemElement = itemContainer.firstElementChild as HTMLElement;
    if (!itemElement) {
        throw new Error('Не удалось создать элемент заказа');
    }

    initOrderItem(itemElement, order);

    return itemElement;
}