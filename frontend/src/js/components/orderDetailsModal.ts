// ============ ИМПОРТЫ ============
import { escapeHtml } from '../utils/security.js';
import { addToCart } from '../data.js';
import type { Order, OrderItem, PaymentMethod } from '../types/index.js';

// ============ ТИПЫ ============

/** Элементы DOM модального окна деталей заказа */
interface OrderDetailsModalElements {
    modal: HTMLElement;
    closeBtn: HTMLButtonElement;
    modalWrapper: HTMLElement;
    repeatBtn: HTMLButtonElement;
    titleElement: HTMLElement | null;
    dateElement: HTMLElement | null;
    customerNameElement: HTMLElement | null;
    customerPhoneElement: HTMLElement | null;
    customerEmailElement: HTMLElement | null;
    addressElement: HTMLElement | null;
    commentTextElement: HTMLElement | null;
    commentElement: HTMLElement | null;
    paymentElement: HTMLElement | null;
    itemsListElement: HTMLElement | null;
    itemsCountElement: HTMLElement | null;
    subtotalElement: HTMLElement | null;
    deliveryElement: HTMLElement | null;
    totalElement: HTMLElement | null;
}

/** Состояние модального окна */
interface OrderDetailsModalState {
    currentOrder: Order | null;
    isOpening: boolean;
    isDragging: boolean;
    startX: number;
    startY: number;
}

/** Внутреннее API модального окна (методы управления) */
interface OrderDetailsModalApi {
    open: (order: Order) => void;
    close: () => void;
}

/** Внешнее API модального окна (контейнер + методы) */
interface OrderDetailsModalReturn {
    container: HTMLElement;
    open: (order: Order) => void;
    close: () => void;
}

// ============ УТИЛИТЫ ============

/**
 * Преобразует способ оплаты в читаемый текст
 * @param {PaymentMethod} paymentMethod - способ оплаты
 * @returns {string} текстовое представление
 */
function getPaymentMethodText(paymentMethod: PaymentMethod): string {
    const paymentMap: Record<PaymentMethod, string> = {
        'card': 'Картой онлайн',
        'cash': 'Наличными при получении',
        'card_courier': 'Картой курьеру'
    };
    return paymentMap[paymentMethod] || 'Не указан';
}

/**
 * Форматирует дату заказа
 * @param {string} dateString - дата в ISO формате
 * @returns {string} отформатированная дата
 */
function formatOrderDate(dateString: string): string {
    const orderDate = new Date(dateString);
    return orderDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку товара в заказе для модалки
 * @param {OrderItem} item - товар в заказе
 * @returns {string} HTML-разметка
 */
function createOrderItem(item: OrderItem): string {
    const totalPrice = item.price * item.quantity;
    
    return `
    <li class="order-details-modal__item" data-product-id="${escapeHtml(item.productId)}">
        <img class="order-details-modal__item-image" src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.productName)}" loading="lazy">
        <div class="order-details-modal__item-info">
            <h4 class="order-details-modal__item-title">${escapeHtml(item.productName)}</h4>
            <div class="order-details-modal__item-details">
                <span class="order-details-modal__item-price">${item.price.toLocaleString()} ₽</span>
                <span class="order-details-modal__item-quantity">× ${item.quantity}</span>
                <span class="order-details-modal__item-total">${totalPrice.toLocaleString()} ₽</span>
            </div>
        </div>
    </li>
    `;
}

/**
 * Создает HTML-разметку модального окна деталей заказа
 * @returns {string} HTML-разметка
 */
function createOrderDetailsModal(): string {
    return `
    <div class="order-details-modal">
        <div class="order-details-modal__wrapper">
            <button class="order-details-modal__close" type="button" aria-label="Закрыть окно">
                <svg width="20" height="20" aria-hidden="true">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                </svg>
            </button>
            <!-- Шапка с номером и статусом -->
            <div class="order-details-modal__header">
                <h2 class="order-details-modal__title">
                    Заказ #00000000
                </h2>
                <span class="order-details-modal__date">
                    1 января 2025, 12:00
                </span>
            </div>
            
            
            <div class="order-details-modal__content">
                <!-- Детали доставки и оплаты -->
                <div class="order-details-modal__info-section">
                    <h3 class="order-details-modal__section-title">Детали заказа:</h3>
                    
                    <div class="order-details-modal__info-grid">
                        <!-- Клиент -->
                        <div class="order-details-modal__info-group">
                            <h4 class="order-details-modal__info-title">Клиент</h4>
                            <p class="order-details-modal__info-text" id="order-customer-name">
                                Иван Иванов
                            </p>
                            <p class="order-details-modal__info-text" id="order-customer-phone">
                                +7 (999) 999-99-99
                            </p>
                            <p class="order-details-modal__info-text" id="order-customer-email">
                                email@example.com
                            </p>
                        </div>
                        
                        <!-- Доставка -->
                        <div class="order-details-modal__info-group">
                            <h4 class="order-details-modal__info-title">Доставка</h4>
                            <p class="order-details-modal__info-text" id="order-address">
                                Город, улица, дом
                            </p>
                            <p class="order-details-modal__comment" id="order-comment"">
                                <strong>Комментарий:</strong> 
                                <span id="order-comment-text"></span>
                            </p>
                        </div>
                        
                        <!-- Оплата -->
                        <div class="order-details-modal__info-group">
                            <h4 class="order-details-modal__info-title">Оплата</h4>
                            <p class="order-details-modal__info-text" id="order-payment">
                                Картой онлайн
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Товары в заказе -->
                <div class="order-details-modal__items-section">
                    <h3 class="order-details-modal__section-title">
                        Товары в заказе
                        <span class="order-details-modal__items-count" id="order-items-count">
                            (0)
                        </span>
                    </h3>
                    
                    <ul class="order-details-modal__items-list" id="order-items-list">
                        <!-- Товары будут добавляться динамически -->
                        <li class="order-details-modal__empty">
                            Нет товаров
                        </li>
                    </ul>
                </div>
                
                <!-- Итоговая сумма -->
                <div class="order-details-modal__total-section">
                    <div class="order-details-modal__total-row">
                        <span>Товары:</span>
                        <span id="order-subtotal">0 ₽</span>
                    </div>
                    <div class="order-details-modal__total-row">
                        <span>Доставка:</span>
                        <span id="order-delivery">0 ₽</span>
                    </div>
                    <div class="order-details-modal__total-row order-details-modal__total-row--final">
                        <span>Итого к оплате:</span>
                        <span class="order-details-modal__total-amount" id="order-total">
                            0 ₽
                        </span>
                    </div>
                </div>
                
                <!-- Кнопки -->
                <button type="button" class="order-details-modal__repeat-btn btn">
                    Повторить заказ
                    <svg width="20" height="20" aria-hidden="true">
                        <use xlink:href="/src/assets/images/sprite.svg#icon-basket"></use>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    `;
}

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param {HTMLElement} container - контейнер модалки
 * @returns {OrderDetailsModalElements | null} объект с элементами или null
 */
function getModalElements(container: HTMLElement): OrderDetailsModalElements | null {
    const modal = container.querySelector<HTMLElement>('.order-details-modal');
    const closeBtn = container.querySelector<HTMLButtonElement>('.order-details-modal__close');
    const modalWrapper = container.querySelector<HTMLElement>('.order-details-modal__wrapper');
    const repeatBtn = container.querySelector<HTMLButtonElement>('.order-details-modal__repeat-btn');

    if (!modal || !closeBtn || !modalWrapper || !repeatBtn) {
        console.warn('[OrderDetailsModal] Не все основные элементы найдены');
        return null;
    }

    return {
        modal,
        closeBtn,
        modalWrapper,
        repeatBtn,
        titleElement: container.querySelector<HTMLElement>('.order-details-modal__title'),
        dateElement: container.querySelector<HTMLElement>('.order-details-modal__date'),
        customerNameElement: container.querySelector<HTMLElement>('#order-customer-name'),
        customerPhoneElement: container.querySelector<HTMLElement>('#order-customer-phone'),
        customerEmailElement: container.querySelector<HTMLElement>('#order-customer-email'),
        addressElement: container.querySelector<HTMLElement>('#order-address'),
        commentTextElement: container.querySelector<HTMLElement>('#order-comment-text'),
        commentElement: container.querySelector<HTMLElement>('#order-comment'),
        paymentElement: container.querySelector<HTMLElement>('#order-payment'),
        itemsListElement: container.querySelector<HTMLElement>('#order-items-list'),
        itemsCountElement: container.querySelector<HTMLElement>('#order-items-count'),
        subtotalElement: container.querySelector<HTMLElement>('#order-subtotal'),
        deliveryElement: container.querySelector<HTMLElement>('#order-delivery'),
        totalElement: container.querySelector<HTMLElement>('#order-total')
    };
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует модальное окно деталей заказа
 * @param {HTMLElement} modalContainer - DOM-элемент модалки
 * @returns {OrderDetailsModalReturn | null} Объект с методами управления модалкой
 */
function initOrderDetailsModal(modalContainer: HTMLElement): OrderDetailsModalApi | null {
    const elements = getModalElements(modalContainer);
    if (!elements) {
        console.error('[OrderDetailsModal] Не удалось получить элементы модалки');
        return null;
    }

    const {
        modal,
        closeBtn,
        modalWrapper,
        repeatBtn,
        titleElement,
        dateElement,
        customerNameElement,
        customerPhoneElement,
        customerEmailElement,
        addressElement,
        commentTextElement,
        commentElement,
        paymentElement,
        itemsListElement,
        itemsCountElement,
        subtotalElement,
        deliveryElement,
        totalElement
    } = elements;

    // Состояние модалки
    const state: OrderDetailsModalState = {
        currentOrder: null,
        isOpening: false,
        isDragging: false,
        startX: 0,
        startY: 0
    };


    // ============ ЗАПОЛНЕНИЕ ДАННЫМИ ============

    /**
     * Заполняет модалку данными заказа
     * @param {Order} order - объект заказа
     */
    function populateOrderData(order: Order): void {
        state.currentOrder = order;
        
        // Заголовок и дата
        if (titleElement) {
            titleElement.textContent = `Заказ #${order.orderNumber}`;
        }
        
        if (dateElement) {
            dateElement.textContent = formatOrderDate(order.createdAt);
        }
        
        // Данные пользователя
        if (customerNameElement) {
            customerNameElement.textContent = order.customer?.fullName || 
                                             `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 
                                             'Не указано';
        }
        
        if (customerPhoneElement) {
            customerPhoneElement.textContent = order.customer?.phone || 'Не указан';
        }
        
        if (customerEmailElement) {
            customerEmailElement.textContent = order.customer?.email || 'Не указан';
        }
        
        // Доставка 
        if (addressElement) {
            addressElement.textContent = order.customer?.address || 'Не указан';
        }
        
        if (commentTextElement) {
            commentTextElement.textContent = order.customer?.comment || '—';
        }
        
        // Скрываем блок комментария, если комментария нет
        if (commentElement) {
            commentElement.style.display = order.customer?.comment ? 'block' : 'none';
        }
        
        // Оплата
        if (paymentElement) {
            paymentElement.textContent = getPaymentMethodText(order.payment);
        }
        
        // Товары 
        if (itemsListElement) {
            itemsListElement.innerHTML = '';
            
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    itemsListElement.innerHTML += createOrderItem(item);
                });
                
            } else {
                itemsListElement.innerHTML = `
                    <div class="order-details-modal__empty">
                        Нет товаров
                    </div>
                `;
            }
        }
        
        if (itemsCountElement) {
            itemsCountElement.textContent = `(${order.items?.length || 0}):`;
        }
        
        // Суммы
        if (subtotalElement) {
            subtotalElement.textContent = `${(order.subtotal || 0).toLocaleString()} ₽`;
        }
        
        if (deliveryElement) {
            deliveryElement.textContent = order.delivery === 0 ? 'Бесплатно' : `${(order.delivery || 0).toLocaleString()} ₽`;
        }
        
        if (totalElement) {
            totalElement.textContent = `${(order.total || 0).toLocaleString()} ₽`;
        }
    }
    
    // ============ УПРАВЛЕНИЕ МОДАЛКОЙ ============

    /**
     * Открывает модальное окно с данными заказа
     * @param {Order} order - объект заказа
     */
    function open(order: Order): void {
        if (!order) {
            console.error('[OrderDetailsModal] Не передан объект заказа');
            return;
        }
        
        state.isOpening = true;
        populateOrderData(order);
        
        // Вставляем модалку в DOM если ее еще нет
        if (!document.body.contains(modalContainer)) {
            document.body.appendChild(modalContainer);
        }
        
        // Запускаем анимацию открытия
        setTimeout(() => {
            modal.classList.add('order-details-modal--active');
            document.body.classList.add('modal-open');
            document.addEventListener('keydown', handleEscapePress);
        }, 10);
        
        setTimeout(() => {
            state.isOpening = false;
        }, 100);
    }
    
    /**
     * Закрывает модальное окно
     */
    function close(): void {
        modal.classList.remove('order-details-modal--active');
        
        setTimeout(() => {
            if (modalContainer.parentNode) {
                modalContainer.parentNode.removeChild(modalContainer);
            }
            
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', handleEscapePress);
        }, 300);
    }
    
    /**
     * Обработчик клавиши Escape
     * @param {KeyboardEvent} event - событие клавиатуры
     */
    function handleEscapePress(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            close();
        }
    }
    
    // ============ ОБРАБОТЧИК ПОВТОРА ЗАКАЗА ============

    /**
     * Обрабатывает повтор заказа
     */
    function handleRepeatOrder(): void {
        if (!state.currentOrder) return;
        
        if (!confirm('Добавить все товары из этого заказа в корзину?')) {
            return;
        }
        
        try {
            state.currentOrder.items.forEach(item => {
                addToCart(item.productId, item.quantity);
            });
            
            close();
            
            alert(`Товары из заказа #${state.currentOrder.orderNumber} добавлены в корзину!`);
            
            window.dispatchEvent(new CustomEvent('cart:update'));
            
            if (confirm('Перейти в корзину?')) {
                window.history.pushState({}, '', '/cart');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
            
        } catch (error) {
            console.error('[OrderDetailsModal] Ошибка при повторении заказа:', error);
            const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
            alert(`Не удалось добавить товары в корзину: ${message}\n\nПопробуйте еще раз или обратитесь в поддержку.`);
        }
    }
    
    // ============ НАСТРОЙКА ОБРАБОТЧИКОВ ============

    // Закрытие по кнопке
    closeBtn.addEventListener('click', close);


    // Повтор заказа
    repeatBtn.addEventListener('click', handleRepeatOrder);
    
    // Закрытие по клику вне модалки (с защитой от выделения текста)
    modalWrapper.addEventListener('mousedown', (e: MouseEvent): void => {
        state.isDragging = false;
        state.startX = e.clientX;
        state.startY = e.clientY;
    });
    
    modalWrapper.addEventListener('mousemove', (e: MouseEvent) => {
        if (Math.abs(e.clientX - state.startX) > 5 || Math.abs(e.clientY - state.startY) > 5) {
            state.isDragging = true;
        }
    });
    
    modal.addEventListener('click', (e: MouseEvent) => {
        if (state.isOpening) return;
        
        if (e.target === modal && !state.isDragging) {
            close();
        }
        state.isDragging = false;
    });
    
    return {
        open,
        close
    };
}

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит модальное окно деталей заказа
 * @returns {OrderDetailsModalReturn} Объект с контейнером и методами управления модалкой
 */
export function renderOrderDetailsModal(): OrderDetailsModalReturn {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = createOrderDetailsModal();
    
    const modalApi = initOrderDetailsModal(modalContainer);

    // Если не удалось инициализировать, возвращаем заглушку
    if (!modalApi) {
        console.error('[OrderDetailsModal] Не удалось инициализировать модалку');
        return {
            container: modalContainer,
            open: () => console.warn('[OrderDetailsModal] Модалка не инициализирована'),
            close: () => console.warn('[OrderDetailsModal] Модалка не инициализирована')
        };
    }
    
    return {
        container: modalContainer,
        open: modalApi.open,
        close: modalApi.close
    };
}
