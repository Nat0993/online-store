// ============ ИМПОРТЫ ============
import { escapeHtml } from "../utils/security.js"
import {
    getCartItemsWithProducts,
    getCurrentUser,
    saveCurrentCart,
    addOrder,
    updateCurrentUser
} from '../data.js';

import type {
    PaymentMethod,
    User,
    CartItem,
    OrderData
} from '../types/index.js';

// ============ ТИПЫ ============

/** Данные формы оформления заказа */
interface CheckoutFormData {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
    address: string;
    comment: string;
    payment: PaymentMethod;
}

/** Элементы DOM модалки оформления */
interface CheckoutModalElements {
    modal: HTMLElement;
    container: HTMLElement,
    formScreen: HTMLElement;
    closeBtn: HTMLButtonElement;
    confirmBtn: HTMLButtonElement;
    summaryContainer: HTMLElement;
    modalWrapper: HTMLElement;
    // Поля формы
    lastNameInput: HTMLInputElement;
    firstNameInput: HTMLInputElement;
    middleNameInput: HTMLInputElement;
    phoneInput: HTMLInputElement;
    emailInput: HTMLInputElement;
    addressInput: HTMLInputElement;
    commentInput: HTMLTextAreaElement;
    paymentRadios: NodeListOf<HTMLInputElement>;
    // Элементы ошибок
    lastNameError: HTMLElement;
    firstNameError: HTMLElement;
    middleNameError: HTMLElement;
    phoneError: HTMLElement;
    emailError: HTMLElement;
    addressError: HTMLElement;
}

/** Состояние модалки */
interface CheckoutModalState {
    isSubmitting: boolean;
    isDragging: boolean;
    startX: number;
    startY: number;
    successScreen: HTMLElement | null;
}

// ============ КОНСТАНТЫ ============

/** Стоимость доставки при заказе до 5000₽ */
const DELIVERY_COST = 500;

/** Порог бесплатной доставки */
const FREE_DELIVERY_THRESHOLD = 5000;

/** Время анимации закрытия/открытия (соответственно transition в CSS) */
const ANIMATION_DURATION = 300;

// ============ УТИЛИТЫ ============

/**
 * Рассчитывает общую стоимость товаров в заказе
 * @param {CartItem[]} orderItems - Массив товаров в корзине (с привязанными продуктами)
 * @returns {number} Сумма всех товаров с учетом количества
 */
function calculateOrderTotal(orderItems: CartItem[]): number {
    return orderItems.reduce((total, item) => {
        if (!item.product) return total;
        return total + (item.product.price * item.quantity);
    }, 0);
}

/**
 * Рассчитывает стоимость доставки
 * @param total - Сумма заказа
 * @returns Стоимость доставки
 */
function calculateDeliveryCost(total: number): number {
    return total > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
}

/**
 * Нормализует номер телефона (убирает все нецифровые символы кроме +)
 * @param phone - номер телефона
 * @returns номер в формате +7XXXXXXXXXX
 */
function normalizePhone(phone: string): string {
    if (!phone) return '';

    // Оставляем только + и цифры
    const normalized = phone.replace(/[^\d+]/g, '');

    // Если начинается с +7, оставляем как есть
    if (normalized.startsWith('+7')) {
        return normalized;
    }

    // Если начинается с 7, добавляем +
    if (normalized.startsWith('7')) {
        return '+' + normalized;
    }

    // Если начинается с 8, меняем на +7
    if (normalized.startsWith('8')) {
        return '+7' + normalized.substring(1);
    }

    // Если начинается с 9, добавляем +7
    if (normalized.startsWith('9')) {
        return '+7' + normalized;
    }

    // По умолчанию добавляем +7
    return '+7' + normalized;
}

// ============ РАЗМЕТКА ============

/**
 * Создает секцию формы для контактных данных
 * @returns HTML-разметка секции контактов
 */
function createContactFormSection(): string {
    // Получаем данные пользователя
    const currentUser = getCurrentUser();

    const firstName = currentUser?.firstName || '';
    const lastName = currentUser?.lastName || '';
    const middleName = currentUser?.middleName || '';
    const phone = currentUser?.phone || '';
    const email = currentUser?.email || '';

    return `
    <div class="checkout-form__group">
        <h3 class="checkout-form__group-title">Контактные данные</h3>
        
        <div class="checkout-form__group-inner">
            <!-- Поле: Фамилия -->
            <div class="checkout-form__field">
                <input type="text" 
                       id="checkout-last-name" 
                       class="checkout-form__input" 
                       placeholder="Фамилия" 
                       value="${escapeHtml(lastName)}"
                       required>
                <span class="checkout-form__error" id="last-name-error"></span>
            </div>
            
            <!-- Поле: Имя -->
            <div class="checkout-form__field">
                <input type="text" 
                       id="checkout-first-name" 
                       class="checkout-form__input" 
                       placeholder="Имя" 
                       value="${escapeHtml(firstName)}"
                       required>
                <span class="checkout-form__error" id="first-name-error"></span>
            </div>
            
            <!-- Поле: Отчество -->
            <div class="checkout-form__field">
                <input type="text" 
                       id="checkout-middle-name" 
                       class="checkout-form__input" 
                       placeholder="Отчество (необязательно)"
                       value="${escapeHtml(middleName)}">
                <span class="checkout-form__error" id="middle-name-error"></span>
            </div>
            
            <!-- Поле: Телефон -->
            <div class="checkout-form__field">
                <input type="tel" 
                       id="checkout-phone" 
                       class="checkout-form__input" 
                       placeholder="+7 (999) 999 99 99" 
                       value="${escapeHtml(phone)}"
                       required>
                <span class="checkout-form__error" id="phone-error"></span>
            </div>
            
            <!-- Поле: Email -->
            <div class="checkout-form__field">
                <input type="email" 
                       id="checkout-email" 
                       class="checkout-form__input" 
                       placeholder="Email" 
                       value="${escapeHtml(email || '')}"
                       required>
                <span class="checkout-form__error" id="email-error"></span>
            </div>
        </div>
    </div>`;

}

/**
 * Создает секцию формы для адреса доставки
 * @returns HTML-разметка секции доставки
 */
function createDeliveryFormSection(): string {
    return `
    <div class="checkout-form__group">
            <h3 class="checkout-form__group-title">Адрес доставки</h3>
            
            <div class="checkout-form__group-inner">
              <!-- Поле: Адрес -->
              <div class="checkout-form__field">
                <input type="text" 
                       id="checkout-address" 
                       class="checkout-form__input" 
                       placeholder="Город, улица, дом, квартира" 
                       required>
                <span class="checkout-form__error" id="address-error"></span>
              </div>
              
              <!-- Поле: Комментарий -->
              <div class="checkout-form__field">
                <textarea id="checkout-comment" 
                          class="checkout-form__textarea checkout-form__input" 
                          placeholder="Комментарий для курьера (необязательно)"></textarea>
              </div>
            </div>
          </div>`;
}

/**
 * Создает секцию формы для выбора способа оплаты
 * @returns HTML-разметка секции оплаты
 */
function createPaymentFormSection(): string {
    return `
    <div class="checkout-form__group">
            <h3 class="checkout-form__group-title">Способ оплаты</h3>
            
            <!-- Группа радио-кнопок -->
            <div class="checkout-form__radio-group">
              
              <!-- Вариант 1: Картой онлайн -->
              <label class="checkout-form__radio-label">
                <input type="radio" 
                       name="payment" 
                       value="card" 
                       class="checkout-form__radio" 
                       checked>
                <span class="checkout-form__radio-custom"></span>
                <span class="checkout-form__radio-text">Картой онлайн</span>
              </label>
              
              <!-- Вариант 2: Наличными -->
              <label class="checkout-form__radio-label">
                <input type="radio" 
                       name="payment" 
                       value="cash" 
                       class="checkout-form__radio">
                <span class="checkout-form__radio-custom"></span>
                <span class="checkout-form__radio-text">Наличными при получении</span>
              </label>
              
              <!-- Вариант 3: Картой курьеру -->
              <label class="checkout-form__radio-label">
                <input type="radio" 
                       name="payment" 
                       value="card_courier" 
                       class="checkout-form__radio">
                <span class="checkout-form__radio-custom"></span>
                <span class="checkout-form__radio-text">Картой курьеру</span>
              </label>
              
            </div>
          </div>`;
}

/**
 * Создает HTML-разметку экрана формы оформления заказа
 * @returns HTML-разметка формы
 */
function createFormScreen(): string {

    return `
    <div class="checkout-modal__content checkout-modal__content--form">
        <!-- Заголовок и закрытие -->
        <h2 class="checkout-modal__title">Оформление заказа</h2>
        
        <div class="checkout-modal__inner">
            <!-- Основной контент -->
            <div class="checkout-modal__main-content">
                <!-- Левая колонка: форма -->
                <form class="checkout-form" id="checkout-form">
                    ${createContactFormSection()}
                    ${createDeliveryFormSection()}
                    ${createPaymentFormSection()}
                </form>
                
                <!-- Правая колонка: итоги -->
                <div class="checkout-summary" id="checkout-summary">
                    <!-- Будет заполнено динамически -->
                    <div class="checkout-summary__loading">Загрузка...</div>
                </div>
            </div>
            
            <!-- Футер с кнопкой подтверждения -->
            <div class="checkout-modal__footer">
                <button type="button" 
                        class="checkout-modal__confirm-btn btn" 
                        id="confirm-order">
                    Подтвердить заказ
                </button>
                <p class="checkout-modal__agreement">
                    Нажимая кнопку, вы соглашаетесь с 
                    <a href="/agreement" class="checkout-modal__agreement-link" target="_blank">
                        условиями обработки персональных данных
                    </a>
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Создает блок с итоговой информацией о заказе
 * @param {CartItem[]} orderItems - Товары в заказе
 * @param {number} total - Общая стоимость товаров
 * @param {number} deliveryCost - Стоимость доставки
 * @returns {string} HTML-разметка сводки заказа
 */
function createOrderSummaryHTML(orderItems: CartItem[], total: number, deliveryCost: number): string {
    const finalTotal = total + deliveryCost;
    const itemsCount = orderItems.length;

    // Склонение слова "товар"
    const itemsCountText = itemsCount === 1 ? 'товар' :
        itemsCount >= 2 && itemsCount <= 4 ? 'товара' : 'товаров';

    return `
    <h3 class="checkout-summary__title">
        Ваш заказ 
        <span class="checkout-summary__items-count">(${itemsCount} ${itemsCountText})</span>
    </h3>
    
    <ul class="checkout-summary__items-list">
    ${orderItems.map(item => {
        if (!item.product) return '';
        return `
        <li class="checkout-summary__item">
            <div class="checkout-summary__item-info">
                <span class="checkout-summary__item-name">${escapeHtml(item.product.name)}</span>
                <span class="checkout-summary__item-quantity">× ${item.quantity}</span>
            </div>
            <span class="checkout-summary__item-price">
                ${(item.product.price * item.quantity).toLocaleString()} ₽
            </span>
        </li>
    `}).join('')}
    </ul>
    
    <div class="checkout-summary__total">
        <div class="checkout-summary__total-row">
            <span>Товары (${itemsCount}):</span>
            <span>${total.toLocaleString()} ₽</span>
        </div>
        <div class="checkout-summary__total-row">
            <span>Доставка:</span>
            <span>${deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toLocaleString()} ₽`}</span>
        </div>
        <div class="checkout-summary__total-row checkout-summary__total-row--final">
            <span>Итого:</span>
            <span>${finalTotal.toLocaleString()} ₽</span>
        </div>
    </div>`;
}

/**
 * Создает HTML-разметку экрана успешного оформления заказа
 * @param orderNumber - номер заказа
 * @returns HTML-разметка экрана успеха
 */
function createSuccessScreenHTML(orderNumber: string): string {
    return `
    <div class="checkout-modal__content checkout-modal__content--success" style="display: none;">
  
      <div class="checkout-modal__success-wrap">
        <!-- Заголовок -->
        <h2 class="checkout-modal__title checkout-modal__success-title">Спасибо за заказ!</h2>
  
        <!-- Сообщение -->
        <p class="checkout-modal__message">
          Ваш заказ успешно оформлен.<br>
          Скоро мы свяжемся с Вами для подтверждения.
        </p>
  
        <!-- Кнопка продолжения -->
        <button type="button" class="checkout-modal__success-btn btn" id="continue-shopping">
          Продолжить покупки
        </button>
  
        <!-- Информация о заказе -->
        <p class="checkout-modal__order-info">
          Номер вашего заказа: <strong id="order-number">#${escapeHtml(orderNumber)}</strong>
        </p>
  
  
      </div>
    </div>`;
}

/**
 * Создает полную HTML-разметку модального окна оформления заказа
 * @returns Полная HTML-разметка модалки с двумя состояниями
 */
function createCheckoutModalHTML(): string {
    return `
    <div class="checkout-modal">
        <div class="checkout-modal__wrapper">
        <button class="checkout-modal__close" type="button" aria-label="Закрыть окно оформления">
          <svg width="20" height="20" aria-hidden="true">
            <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
          </svg>
        </button>
            ${createFormScreen()}
            <!-- Успешный экран будет добавляться динамически -->
        </div>
    </div>`;
}

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param {HTMLElement} container - контейнер для поиска элементов
 * @param {HTMLElement} modalContainer - корневой контейнер модалки (сохраняется в elements)
 * @returns {CheckoutModalElements | null} объект с элементами или null
 */
function getModalElements(container: HTMLElement, modalContainer: HTMLElement): CheckoutModalElements | null {
    const modal = container.querySelector<HTMLElement>('.checkout-modal');
    const formScreen = container.querySelector<HTMLElement>('.checkout-modal__content--form');
    const closeBtn = container.querySelector<HTMLButtonElement>('.checkout-modal__close');
    const confirmBtn = container.querySelector<HTMLButtonElement>('#confirm-order');
    const summaryContainer = container.querySelector<HTMLElement>('#checkout-summary');
    const modalWrapper = container.querySelector<HTMLElement>('.checkout-modal__wrapper');

    // Поля формы
    const lastNameInput = container.querySelector<HTMLInputElement>('#checkout-last-name');
    const firstNameInput = container.querySelector<HTMLInputElement>('#checkout-first-name');
    const middleNameInput = container.querySelector<HTMLInputElement>('#checkout-middle-name');
    const phoneInput = container.querySelector<HTMLInputElement>('#checkout-phone');
    const emailInput = container.querySelector<HTMLInputElement>('#checkout-email');
    const addressInput = container.querySelector<HTMLInputElement>('#checkout-address');
    const commentInput = container.querySelector<HTMLTextAreaElement>('#checkout-comment');
    const paymentRadios = container.querySelectorAll<HTMLInputElement>('input[name="payment"]');

    // Элементы ошибок
    const lastNameError = container.querySelector<HTMLElement>('#last-name-error');
    const firstNameError = container.querySelector<HTMLElement>('#first-name-error');
    const middleNameError = container.querySelector<HTMLElement>('#middle-name-error');
    const phoneError = container.querySelector<HTMLElement>('#phone-error');
    const emailError = container.querySelector<HTMLElement>('#email-error');
    const addressError = container.querySelector<HTMLElement>('#address-error');

    if (!modal || !formScreen || !closeBtn || !confirmBtn || !summaryContainer || !modalWrapper ||
        !lastNameInput || !firstNameInput || !middleNameInput || !phoneInput || !emailInput ||
        !addressInput || !commentInput || paymentRadios.length === 0 ||
        !lastNameError || !firstNameError || !middleNameError || !phoneError || !emailError || !addressError) {
        console.warn('[CheckoutModal] Не все элементы модалки найдены');
        return null;
    }

    return {
        container: modalContainer,
        modal,
        formScreen,
        closeBtn,
        confirmBtn,
        summaryContainer,
        modalWrapper,
        lastNameInput,
        firstNameInput,
        middleNameInput,
        phoneInput,
        emailInput,
        addressInput,
        commentInput,
        paymentRadios,
        lastNameError,
        firstNameError,
        middleNameError,
        phoneError,
        emailError,
        addressError
    };
}

// ============ РАБОТА С ОШИБКАМИ ============

/**
 * Показывает ошибку поля
 * @param {HTMLElement} inputElement - поле ввода
 * @param {HTMLElement} errorElement - элемент для отображения ошибки
 * @param {string} message - текст ошибки
 */
function showError(inputElement: HTMLElement, errorElement: HTMLElement, message: string) {
    errorElement.textContent = message;
    errorElement.style.opacity = '1';
    inputElement.classList.add('checkout-form__input--error');
}

/**
 * Скрывает ошибку поля
 * @param {HTMLElement} inputElement - поле ввода
 * @param {HTMLElement} errorElement - элемент для отображения ошибки
 */
function clearError(inputElement: HTMLElement, errorElement: HTMLElement) {
    errorElement.textContent = '';
    errorElement.style.opacity = '0';
    inputElement.classList.remove('checkout-form__input--error');
}

/**
* Очищает все ошибки
*/
function clearAllErrors(elements: CheckoutModalElements): void {
    const {
        lastNameInput, lastNameError,
        firstNameInput, firstNameError,
        middleNameInput, middleNameError,
        phoneInput, phoneError,
        emailInput, emailError,
        addressInput, addressError
    } = elements;

    clearError(lastNameInput, lastNameError);
    clearError(firstNameInput, firstNameError);
    clearError(middleNameInput, middleNameError);
    clearError(phoneInput, phoneError);
    clearError(emailInput, emailError);
    clearError(addressInput, addressError);
}

// ============ ВАЛИДАЦИЯ ============

/**
* Валидирует поле фамилии
*/
function validateLastName(input: HTMLInputElement, errorElement: HTMLElement): boolean {
    const value = input.value.trim();
    if (!value) {
        showError(input, errorElement, 'Введите фамилию');
        return false;
    }
    if (value.length < 2) {
        showError(input, errorElement, 'Фамилия слишком короткая');
        return false;
    }
    clearError(input, errorElement);
    return true;
}

/**
* Валидирует поле имени
*/
function validateFirstName(input: HTMLInputElement, errorElement: HTMLElement): boolean {
    const value = input.value.trim();
    if (!value) {
        showError(input, errorElement, 'Введите имя');
        return false;
    }
    if (value.length < 2) {
        showError(input, errorElement, 'Имя слишком короткое');
        return false;
    }
    clearError(input, errorElement);
    return true;
}

/**
* Валидирует поле отчества (необязательное)
*/
function validateMiddleName(input: HTMLInputElement, errorElement: HTMLElement): boolean {
    const value = input.value.trim();
    // Отчество необязательное, но если заполнено - проверяем
    if (value && value.length < 2) {
        showError(input, errorElement, 'Отчество слишком короткое');
        return false;
    }
    clearError(input, errorElement);
    return true;
}

/**
* Валидирует поле телефона
*/
function validatePhone(input: HTMLInputElement, errorElement: HTMLElement): boolean {
    const value = input.value.trim();

    if (!value) {
        showError(input, errorElement, 'Введите номер телефона');
        return false;
    }

    // Нормализуем для проверки
    const normalizedPhone = normalizePhone(value);

    // 1. Проверяем, что номер начинается с +7
    if (!normalizedPhone.startsWith('+7')) {
        showError(input, errorElement, 'Номер должен начинаться с +7');
        return false;
    }

    // 2. Проверяем длину (должно быть 12 символов: +7 + 10 цифр)
    if (normalizedPhone.length !== 12) {
        showError(input, errorElement, 'В номере должно быть 10 цифр после +7');
        return false;
    }

    // 3. Проверяем, что после +7 только цифры
    const digitsOnly = normalizedPhone.substring(2);
    if (!/^\d{10}$/.test(digitsOnly)) {
        showError(input, errorElement, 'Номер содержит недопустимые символы');
        return false;
    }

    clearError(input, errorElement);
    return true;
}

/**
* Валидирует поле email
*/
function validateEmail(input: HTMLInputElement, errorElement: HTMLElement): boolean {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
        showError(input, errorElement, 'Введите email');
        return false;
    }

    if (!emailRegex.test(value)) {
        showError(input, errorElement, 'Неверный формат email');
        return false;
    }

    clearError(input, errorElement);
    return true;
}

/**
 * Валидирует поле адреса
 */
function validateAddress(input: HTMLInputElement, errorElement: HTMLElement): boolean {
    const value = input.value.trim();
    if (!value) {
        showError(input, errorElement, 'Введите адрес доставки');
        return false;
    }
    if (value.length < 5) {
        showError(input, errorElement, 'Адрес слишком короткий');
        return false;
    }
    clearError(input, errorElement);
    return true;
}

// ============ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ============

/**
* Обновляет блок с итогами заказа
*/
function updateOrderSummary(elements: CheckoutModalElements): void {
    const orderItems = getCartItemsWithProducts();
    const total = calculateOrderTotal(orderItems);
    const deliveryCost = calculateDeliveryCost(total);

    if (elements.summaryContainer && orderItems.length > 0) {
        elements.summaryContainer.innerHTML = createOrderSummaryHTML(orderItems, total, deliveryCost);
    }
}

// ============ ЛОГИКА ЗАКАЗА ============

/**
 * Создает объект заказа из данных формы
 * @param formData - Данные формы
 * @returns Объект заказа
 */
function createOrderObject(formData: CheckoutFormData): Omit<OrderData, 'userId' | 'isGuest'> {
    const orderItems = getCartItemsWithProducts();
    const total = calculateOrderTotal(orderItems);
    const deliveryCost = calculateDeliveryCost(total);

    // Формируем полное имя
    const fullName = [
        formData.lastName,
        formData.firstName,
        formData.middleName
    ].filter(Boolean).join(' ');

    return {
        items: orderItems.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.image
        })),
        customer: {
            lastName: formData.lastName,
            firstName: formData.firstName,
            middleName: formData.middleName,
            fullName: fullName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            comment: formData.comment || ''
        },
        payment: formData.payment,
        subtotal: total,
        delivery: deliveryCost,
        total: total + deliveryCost
    };
}

// ============ УПРАВЛЕНИЕ ЭКРАНАМИ ============

/**
* Показывает экран формы
*/
function showFormScreen(elements: CheckoutModalElements, state: CheckoutModalState): void {
    // Удаляем успешный экран, если он существует
    if (state.successScreen && state.successScreen.parentNode) {
        state.successScreen.parentNode.removeChild(state.successScreen);
        state.successScreen = null;
    }

    // Показываем форму
    elements.formScreen.style.display = 'flex';

    // Обновляем итоги (актуальные данные)
    updateOrderSummary(elements);
}

/**
 * Показывает экран успеха
 * @param {CheckoutModalElements} elements - элементы модалки
 * @param {CheckoutModalState} state - состояние модалки
 * @param {string} orderNumber - номер заказа
 */
function showSuccessScreen(elements: CheckoutModalElements, state: CheckoutModalState, orderNumber: string): void {
    const { modalWrapper, formScreen } = elements;

    // 1. Скрываем форму с анимацией
    formScreen.style.opacity = '0';

    // 2. Ждем завершения анимации скрытия формы
    setTimeout(() => {
        // 3. Скрываем форму из потока
        formScreen.style.display = 'none';

        // 4. Создаем и добавляем успешный экран
        const successHTML = createSuccessScreenHTML(orderNumber);
        modalWrapper.insertAdjacentHTML('beforeend', successHTML);

        state.successScreen = modalWrapper.querySelector('.checkout-modal__content--success');
        const continueBtn = modalWrapper.querySelector('#continue-shopping');
        const orderNumberEl = modalWrapper.querySelector('#order-number');

        // Обновляем номер заказа
        if (orderNumberEl) {
            orderNumberEl.textContent = `#${orderNumber}`;
        }

        // 5. Устанавливаем начальное состояние для анимации
        if (state.successScreen) {
            state.successScreen.style.display = 'flex';
        }

        // 6. Назначаем обработчик для кнопки "Продолжить покупки"
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                closeModal(elements, state);
                window.history.pushState({}, '', '/catalog');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, { once: true });
        }

        // 7. Небольшая задержка перед показом для корректной анимации
        setTimeout(() => {
            if (state.successScreen) {
                state.successScreen.style.opacity = '1';
            }
        }, 50);

    }, ANIMATION_DURATION); // Время должно совпадать с CSS transition
}

// ============ УПРАВЛЕНИЕ МОДАЛКОЙ ============

/**
* Открывает модальное окно с анимацией
*/
function openModal(elements: CheckoutModalElements,
    state: CheckoutModalState,
): void {
    const { modal, container, lastNameInput, firstNameInput, middleNameInput, phoneInput, emailInput } = elements;

    console.log('[CheckoutModal] Открытие модалки оформления заказа');

    // Вставляем модалку в DOM если ее еще нет
    if (!document.body.contains(container)) {
        document.body.appendChild(container);
    }

    // Сбрасываем к начальному состоянию
    resetForm(elements, state);
    showFormScreen(elements, state);

    // Автозаполнение полей из данных пользователя
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (!lastNameInput.value) lastNameInput.value = currentUser.lastName || '';
        if (!firstNameInput.value) firstNameInput.value = currentUser.firstName || '';
        if (!middleNameInput.value) middleNameInput.value = currentUser.middleName || '';
        if (!phoneInput.value) phoneInput.value = currentUser.phone || '';
        if (!emailInput.value) emailInput.value = currentUser.email || '';
    }

    // Запускаем анимацию открытия
    setTimeout(() => {
        modal.classList.add('checkout-modal--active');
    }, 10);

    //Убираем скролл страницы
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', (e) => handleEscapePress(e, elements, state));
}

/**
 * Закрывает модальное окно с анимацией
 */
function closeModal(
    elements: CheckoutModalElements,
    state: CheckoutModalState
    ): void {

    const { modal, container } = elements;

    modal.classList.remove('checkout-modal--active');

    // Ждем завершения анимации перед удалением
    setTimeout(() => {
        // Проверяем, есть ли еще контейнер в DOM
        if (document.body.contains(container)) {
            container.parentNode?.removeChild(container);
        }

        // Возвращаем скролл (проверяем, что body еще существует)
        if (document.body) {
            document.body.classList.remove('modal-open');
        }
        document.removeEventListener('keydown', (e) => handleEscapePress(e, elements, state));
    }, ANIMATION_DURATION);
}

/**
 * Обработчик нажатия клавиши Escape
 * @param {KeyboardEvent} event - событие клавиатуры
 * @param {CheckoutModalElements} elements - элементы модалки
 * @param {CheckoutModalState} state - состояние модалки
 */
function handleEscapePress(event: KeyboardEvent,
    elements: CheckoutModalElements,
    state: CheckoutModalState): void {
    if (event.key === 'Escape') {
        closeModal(elements, state);
    }
}

/**
 * Сбрасывает форму к исходному состоянию
 * @param {CheckoutModalElements} elements - элементы модалки
 * @param {CheckoutModalState} state - состояние модалки
 */
function resetForm(
    elements: CheckoutModalElements,
    state: CheckoutModalState
): void {

    const form = elements.modalWrapper.querySelector('#checkout-form') as HTMLFormElement;

    if (form) {
        form.reset();
    }

    clearAllErrors(elements);
    state.isSubmitting = false;
}

// ============ ВАЛИДАЦИЯ ФОРМЫ ============

/**
 * Валидирует всю форму
 * @param {CheckoutModalElements} elements - элементы модалки
 * @returns {boolean} true если форма валидна
 */
function validateForm(elements: CheckoutModalElements): boolean {
    const {
        lastNameInput, lastNameError,
        firstNameInput, firstNameError,
        middleNameInput, middleNameError,
        phoneInput, phoneError,
        emailInput, emailError,
        addressInput, addressError
    } = elements;

    const isLastNameValid = validateLastName(lastNameInput, lastNameError);
    const isFirstNameValid = validateFirstName(firstNameInput, firstNameError);
    const isMiddleNameValid = validateMiddleName(middleNameInput, middleNameError);
    const isPhoneValid = validatePhone(phoneInput, phoneError);
    const isEmailValid = validateEmail(emailInput, emailError);
    const isAddressValid = validateAddress(addressInput, addressError);

    return isLastNameValid && isFirstNameValid && isMiddleNameValid &&
        isPhoneValid && isEmailValid && isAddressValid;
}

/**
 * Собирает данные из формы
 * @param {CheckoutModalElements} elements - элементы модалки
 * @returns {CheckoutFormData} объект с данными формы
 */
function getFormData(elements: CheckoutModalElements): CheckoutFormData {
    const {
        lastNameInput,
        firstNameInput,
        middleNameInput,
        phoneInput,
        emailInput,
        addressInput,
        commentInput,
        paymentRadios
    } = elements;

    const selectedPayment = Array.from(paymentRadios).find(radio => radio.checked);

    return {
        lastName: lastNameInput.value.trim(),
        firstName: firstNameInput.value.trim(),
        middleName: middleNameInput.value.trim(),
        phone: normalizePhone(phoneInput.value.trim()),
        email: emailInput.value.trim(),
        address: addressInput.value.trim(),
        comment: commentInput.value.trim(),
        payment: (selectedPayment?.value as PaymentMethod) || 'card'
    };
}

// ============ ОБРАБОТЧИК ОТПРАВКИ ============

/**
 * Обрабатывает отправку формы
 * @param {CheckoutModalElements} elements - элементы модалки
 * @param {CheckoutModalState} state - состояние модалки
 * @returns {Promise<void>}
 */
async function handleSubmit(
    elements: CheckoutModalElements,
    state: CheckoutModalState
): Promise<void> {
    if (state.isSubmitting) return;

    if (!validateForm(elements)) {
        return;
    }

    state.isSubmitting = true;
    elements.confirmBtn.disabled = true;
    elements.confirmBtn.textContent = 'Оформляем...';

    try {
        const formData = getFormData(elements);
        const currentUser = getCurrentUser();

        // 1. Обновляем данные пользователя
        if (currentUser) {
            const fullName = [
                formData.lastName,
                formData.firstName,
                formData.middleName
            ].filter(Boolean).join(' ');

            // Вычисляем текущее полное имя пользователя
            const currentFullName = [
                currentUser.lastName,
                currentUser.firstName,
                currentUser.middleName
            ].filter(Boolean).join(' ');

            // Создаем объект обновления
            const userUpdates: Partial<User> = {
                lastName: formData.lastName,
                firstName: formData.firstName,
                middleName: formData.middleName,
                phone: formData.phone
            };

            const hasNameChanged = currentFullName !== fullName;
            const hasPhoneChanged = currentUser.phone !== formData.phone;

            if (hasNameChanged || hasPhoneChanged) {
                let message = '';

                if (hasNameChanged && hasPhoneChanged) {
                    message = 'Сохранить ваши имя и телефон для будущих заказов?';
                } else if (hasNameChanged) {
                    message = 'Сохранить ваше имя для будущих заказов?';
                } else if (hasPhoneChanged) {
                    message = 'Сохранить ваш телефон для будущих заказов?';
                }

                // Если пользователь ранее не заполнял данные или согласен сохранить изменения
                if ((!currentUser.firstName && !currentUser.middleName && !currentUser.lastName && hasNameChanged) ||
                    (!currentUser.phone && hasPhoneChanged) ||
                    confirm(message)) {

                    const updatedUser = updateCurrentUser(userUpdates);

                    // Отправляем событие для обновления UI в хедере
                    window.dispatchEvent(new CustomEvent('auth:change', {
                        detail: {
                            user: updatedUser,
                            type: 'update'
                        }
                    }));
                }
            }
        }

        // 2. Создаем и сохраняем заказ
        const orderData = createOrderObject(formData);

        // Добавляем userId и isGuest
        const fullOrderData: OrderData = {
            ...orderData,
            userId: currentUser?.id || null,
            isGuest: !currentUser
        };

        const savedOrder = addOrder(fullOrderData);

        // Имитация задержки сервера
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Очищаем корзину
        saveCurrentCart([]);

        // 4. Показываем экран успеха
        showSuccessScreen(elements, state, savedOrder.orderNumber);

        // 5. Отправляем события
        window.dispatchEvent(new CustomEvent('cart:update'));

    } catch (error) {
        console.error('[CheckoutModal] Ошибка оформления заказа:', error);
        alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
        state.isSubmitting = false;
        elements.confirmBtn.disabled = false;
        elements.confirmBtn.textContent = 'Подтвердить заказ';
    }
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику модального окна оформления заказа
 * @param {HTMLElement} modalContainer - DOM-элемент модалки (корневой контейнер)
 * @returns {{ open: () => void; close: () => void } | null} Объект с методами управления модалкой или null
 */
function initCheckoutModal(modalContainer: HTMLElement): { open: () => void; close: () => void } | null {
    const elements = getModalElements(modalContainer, modalContainer);
    if (!elements) {
        console.error('[CheckoutModal] Не удалось получить элементы модалки');
        return null;
    }

    const {
        modal,
        modalWrapper,
        closeBtn,
        confirmBtn,
        lastNameInput, lastNameError,
        firstNameInput, firstNameError,
        middleNameInput, middleNameError,
        phoneInput, phoneError,
        emailInput, emailError,
        addressInput, addressError
    } = elements;

    // Состояние модалки
    const state: CheckoutModalState = {
        isSubmitting: false,
        isDragging: false,
        startX: 0,
        startY: 0,
        successScreen: null
    };

    // ============ НАСТРОЙКА ОБРАБОТЧИКОВ ============

    // Закрытие по кнопке
    closeBtn.addEventListener('click', () => closeModal(elements, state));

    // Подтверждение заказа
    confirmBtn.addEventListener('click', () => handleSubmit(elements, state));


    // Валидация в реальном времени
    lastNameInput.addEventListener('blur', () => validateLastName(lastNameInput, lastNameError));
    lastNameInput.addEventListener('input', () => clearError(lastNameInput, lastNameError));

    firstNameInput.addEventListener('blur', () => validateFirstName(firstNameInput, firstNameError));
    firstNameInput.addEventListener('input', () => clearError(firstNameInput, firstNameError));

    middleNameInput.addEventListener('blur', () => validateMiddleName(middleNameInput, middleNameError));
    middleNameInput.addEventListener('input', () => clearError(middleNameInput, middleNameError));

    phoneInput.addEventListener('blur', () => validatePhone(phoneInput, phoneError));
    phoneInput.addEventListener('input', () => clearError(phoneInput, phoneError));

    emailInput.addEventListener('blur', () => validateEmail(emailInput, emailError));
    emailInput.addEventListener('input', () => clearError(emailInput, emailError));

    addressInput.addEventListener('blur', () => validateAddress(addressInput, addressError));
    addressInput.addEventListener('input', () => clearError(addressInput, addressError));

    // Закрытие по клику вне модалки (предотвращаем закрытие при выделении текста)
    modalWrapper.addEventListener('mousedown', (e: MouseEvent) => {
        state.isDragging = false;
        state.startX = e.clientX;
        state.startY = e.clientY;
    });

    modalWrapper.addEventListener('mousemove', (e: MouseEvent) => {
        if (Math.abs(e.clientX - state.startX) > 5 || Math.abs(e.clientY - state.startY) > 5) {
            state.isDragging = true; // пользователь выделяет текст
        }
    });

    modal.addEventListener('click', (e: MouseEvent) => {
        if (e.target === modal && !state.isDragging) {
            closeModal(elements, state); // закрываем только если не было выделения
        }
        state.isDragging = false;
    });

    return {
        open: () => openModal(elements, state),
        close: () => closeModal(elements, state)
    };
}


// ============ ПУБЛИЧНЫЙ API ============


/**
 * Рендерит модальное окно оформления заказа
 * @returns {{ container: HTMLElement; open: () => void; close: () => void }} - Объект с контейнером и методами управления модалкой
 */
export function renderCheckoutModal(): { container: HTMLElement; open: () => void; close: () => void } {
    const modalContainer = document.createElement('div');

    // Создаем HTML-шаблон без данных о товарах
    modalContainer.innerHTML = createCheckoutModalHTML();

    // Инициализируем логику
    const modalApi = initCheckoutModal(modalContainer);

    if (!modalApi) {
        console.error('[CheckoutModal] Не удалось инициализировать модалку');
        return {
            container: modalContainer,
            open: () => { alert('Ошибка инициализации модалки'); },
            close: () => {}
        };
    }

    return {
        container: modalContainer,
        open: function () {
            // Проверяем, что корзина не пуста
            const orderItems = getCartItemsWithProducts();

            if (orderItems.length === 0) {
                alert('Ваша корзина пуста!');
                return;
            }
            modalApi.open();
        },
        close: modalApi.close
    };
}

