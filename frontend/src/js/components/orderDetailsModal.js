import { escapeHtml } from '../utils/security.js';
import { addToCart } from '../data.js';

/**
 * Преобразует способ оплаты в читаемый текст
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
 * Создает HTML-разметку товара в заказе для модалки
 * @param {Object} item - товар в заказе
 * @returns {string} HTML-разметка
 */
function createOrderItem(item) {
    const totalPrice = item.price * item.quantity;
    
    return `
    <li class="order-details-modal__item" data-product-id="${escapeHtml(item.productId)}">
        <img class="order-details-modal__item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.productName)}" loading="lazy">
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
 * Создает HTML-разметку модального окна 
 */
function createOrderDetailsModal() {
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

/**
 * Инициализирует модальное окно деталей заказа
 * @param {HTMLElement} modalContainer - DOM-элемент модалки
 * @returns {Object} Объект с методами управления модалкой
 */
function initOrderDetailsModal(modalContainer) {
    const modal = modalContainer.querySelector('.order-details-modal');
    const closeBtn = modalContainer.querySelector('.order-details-modal__close');
    const modalWrapper = modalContainer.querySelector('.order-details-modal__wrapper');
    const repeatBtn = modalContainer.querySelector('.order-details-modal__repeat-btn');
    
    let currentOrder = null;
    let isOpening = false;
    
    /**
     * Заполняет модалку данными заказа
     * @param {Object} order - объект заказа
     */
    function populateOrderData(order) {
        currentOrder = order;
        
        // Заголовок и дата
        const titleElement = modalContainer.querySelector('.order-details-modal__title');
        const dateElement = modalContainer.querySelector('.order-details-modal__date');
        
        if (titleElement) {
            titleElement.textContent = `Заказ #${order.orderNumber}`;
        }
        
        if (dateElement) {
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
            dateElement.textContent = formattedDate;
        }
        
        // Данные пользователя
        const customerNameElement = modalContainer.querySelector('#order-customer-name');
        const customerPhoneElement = modalContainer.querySelector('#order-customer-phone');
        const customerEmailElement = modalContainer.querySelector('#order-customer-email');
        
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
        const addressElement = modalContainer.querySelector('#order-address');
        const commentTextElement = modalContainer.querySelector('#order-comment-text');
        const commentElement = modalContainer.querySelector('#order-comment');
        
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
        const paymentElement = modalContainer.querySelector('#order-payment');
        if (paymentElement) {
            paymentElement.textContent = getPaymentMethodText(order.payment);
        }
        
        // Товары
        const itemsListElement = modalContainer.querySelector('#order-items-list');
        const itemsCountElement = modalContainer.querySelector('#order-items-count');
        
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
        const subtotalElement = modalContainer.querySelector('#order-subtotal');
        const deliveryElement = modalContainer.querySelector('#order-delivery');
        const totalElement = modalContainer.querySelector('#order-total');
        
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
    
    /**
     * Открывает модальное окно с данными заказа
     * @param {Object} order - объект заказа
     */
    function open(order) {
        if (!order) {
            console.error('Не передан объект заказа');
            return;
        }
        
        isOpening = true;
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
            isOpening = false;
        }, 100);
    }
    
    /**
     * Закрывает модальное окно
     */
    function close() {
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
     */
    function handleEscapePress(event) {
        if (event.key === 'Escape') {
            close();
        }
    }
    
    /**
     * Обрабатывает повтор заказа
     */
    function handleRepeatOrder() {
        if (!currentOrder) return;
        
        if (!confirm('Добавить все товары из этого заказа в корзину?')) {
            return;
        }
        
        try {
            currentOrder.items.forEach(item => {
                addToCart(item.productId, item.quantity);
            });
            
            close();
            
            alert(`Товары из заказа #${currentOrder.orderNumber} добавлены в корзину!`);
            
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
    
    // Назначение обработчиков
    closeBtn.addEventListener('click', close);
    repeatBtn.addEventListener('click', handleRepeatOrder);
    
    // Закрытие по клику вне модалки
    let isDragging = false;
    let startX, startY;
    
    modalWrapper.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
    });
    
    modalWrapper.addEventListener('mousemove', (e) => {
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
            isDragging = true;
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (isOpening) return;
        
        if (e.target === modal && !isDragging) {
            close();
        }
        isDragging = false;
    });
    
    return {
        open,
        close
    };
}

/**
 * Рендерит модальное окно деталей заказа
 * @returns {Object} Объект с методами управления модалкой
 */
export function renderOrderDetailsModal() {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = createOrderDetailsModal();
    
    const { open, close } = initOrderDetailsModal(modalContainer);
    
    return {
        container: modalContainer,
        open,
        close
    };
}
