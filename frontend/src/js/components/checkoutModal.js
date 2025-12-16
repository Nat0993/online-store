import { escapeHtml } from "../utils/security.js"
import {
    getCartItemsWithProducts,
    getCurrentUser,
    saveCurrentCart,
    addOrder,
    generateOrderNumber,
    updateCurrentUser
} from '../data.js';

/**
 * Рассчитывает общую стоимость товаров в заказе
 * @param {Array} orderItems - Массив товаров в корзине
 * @returns {number} Сумма всех товаров с учетом количества
 */
function calculateOrderTotal(orderItems) {
    return orderItems.reduce((total, item) =>
        total + (item.product.price * item.quantity), 0);
}

/**
 * Создает HTML-разметку экрана формы оформления заказа
 * @returns {string} HTML-разметка формы
 */
function createFormScreen() {
    const currentUser = getCurrentUser();

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
 * Создает секцию формы для контактных данных
 * @returns {string} HTML-разметка секции контактов
 */
function createContactFormSection() {
    // Получаем данные пользователя
    const currentUser = getCurrentUser();

    let firstName = '';
    let lastName = '';
    let middleName = '';
    let phone = '';
    let email = currentUser?.email || '';

    // Если у пользователя есть сохраненные данные, используем их
    if (currentUser) {
        firstName = currentUser.firstName || '';
        lastName = currentUser.lastName || '';
        middleName = currentUser.middleName || '';
        phone = currentUser.phone || '';
    }
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
                       placeholder="Телефон" 
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
 * @returns {string} HTML-разметка секции доставки
 */
function createDeliveryFormSection() {
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
 * @returns {string} HTML-разметка секции оплаты
 */
function createPaymentFormSection() {
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
 * Создает блок с итоговой информацией о заказе
 * @param {Array} orderItems - Товары в заказе
 * @param {number} total - Общая стоимость товаров
 * @param {number} deliveryCost - Стоимость доставки
 * @returns {string} HTML-разметка сводки заказа
 */
function createOrderSummaryHTML(orderItems, total, deliveryCost) {
    const finalTotal = total + deliveryCost;

    return `
    <h3 class="checkout-summary__title">
        Ваш заказ 
        <span class="checkout-summary__items-count">(${orderItems.length} товар${orderItems.length !== 1 ? 'а' : ''})</span>
    </h3>
    
    <ul class="checkout-summary__items-list">
    ${orderItems.map(item => `
        <li class="checkout-summary__item">
            <div class="checkout-summary__item-info">
                <span class="checkout-summary__item-name">${escapeHtml(item.product.name)}</span>
                <span class="checkout-summary__item-quantity">× ${item.quantity}</span>
            </div>
            <span class="checkout-summary__item-price">
                ${(item.product.price * item.quantity).toLocaleString()} ₽
            </span>
        </li>
    `).join('')}
    </ul>
    
    <div class="checkout-summary__total">
        <div class="checkout-summary__total-row">
            <span>Товары (${orderItems.length}):</span>
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
 * @returns {string} HTML-разметка экрана успеха
 */
function createSuccessScreenHTML(orderNumber) {
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
        <button type="button" class="checkout-modal__succes-btn btn" id="continue-shopping">
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
 * @returns {string} Полная HTML-разметка модалки с двумя состояниями
 */
function createCheckoutModalHTML() {
    const orderItems = getCartItemsWithProducts();

    if (orderItems.length === 0) {
        console.warn('Попытка открыть модалку оформления с пустой корзиной');
        return '<div class="checkout-modal"></div>';
    }

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

/**
 * Инициализирует логику модального окна оформления заказа
 * @param {HTMLElement} modalContainer - DOM-элемент модалки
 * @returns {Object} Объект с методами управления модалкой
 */
function initCheckoutModal(modalContainer) {
    const modal = modalContainer.querySelector('.checkout-modal');
    const formScreen = modalContainer.querySelector('.checkout-modal__content--form');
    const closeBtn = modalContainer.querySelector('.checkout-modal__close');
    const confirmBtn = modalContainer.querySelector('#confirm-order');
    const summaryContainer = modalContainer.querySelector('#checkout-summary');
    const modalWrapper = modalContainer.querySelector('.checkout-modal__wrapper')

    // Поля формы 
    const lastNameInput = modalContainer.querySelector('#checkout-last-name');
    const firstNameInput = modalContainer.querySelector('#checkout-first-name');
    const middleNameInput = modalContainer.querySelector('#checkout-middle-name');
    const phoneInput = modalContainer.querySelector('#checkout-phone');
    const emailInput = modalContainer.querySelector('#checkout-email');
    const addressInput = modalContainer.querySelector('#checkout-address');
    const commentInput = modalContainer.querySelector('#checkout-comment');
    const paymentRadios = modalContainer.querySelectorAll('input[name="payment"]');

    // Элементы ошибок
    const lastNameError = modalContainer.querySelector('#last-name-error');
    const firstNameError = modalContainer.querySelector('#first-name-error');
    const middleNameError = modalContainer.querySelector('#middle-name-error');
    const phoneError = modalContainer.querySelector('#phone-error');
    const emailError = modalContainer.querySelector('#email-error');
    const addressError = modalContainer.querySelector('#address-error');

    let isSubmitting = false;
    let successScreen = null; // Будет создаваться динамически



    /**
     * Обновляет блок с итогами заказа
     */
    function updateOrderSummary() {
        const orderItems = getCartItemsWithProducts();
        const total = calculateOrderTotal(orderItems);
        const deliveryCost = total > 5000 ? 0 : 500;

        if (summaryContainer && orderItems.length > 0) {
            summaryContainer.innerHTML = createOrderSummaryHTML(orderItems, total, deliveryCost);
        }
    }

    /**
 * Создает объект заказа из данных формы
 * @param {Object} formData - Данные формы
 * @returns {Object} Объект заказа
 */
    function createOrderObject(formData) {
        const orderItems = getCartItemsWithProducts();
        const total = calculateOrderTotal(orderItems);
        const deliveryCost = total > 5000 ? 0 : 500;

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

    /**
     * Показывает экран формы
     */
    function showFormScreen() {
        // Удаляем успешный экран, если он существует
        if (successScreen && successScreen.parentNode) {
            successScreen.parentNode.removeChild(successScreen);
            successScreen = null;
        }

        // Показываем форму
        formScreen.style.display = 'flex';

        // Обновляем итоги (актуальные данные)
        updateOrderSummary();
    }

    /**
     * Показывает экран успеха
     * @param {string} orderNumber - номер заказа
     */
    function showSuccessScreen(orderNumber) {
        // 1. Скрываем форму с анимацией
        formScreen.style.opacity = '0';

        // 2. Ждем завершения анимации скрытия формы
        setTimeout(() => {
            // 3. Скрываем форму из потока
            formScreen.style.display = 'none';

            // 4. Создаем и добавляем успешный экран
            const successHTML = createSuccessScreenHTML(orderNumber);
            modalWrapper.insertAdjacentHTML('beforeend', successHTML);

            successScreen = modalContainer.querySelector('.checkout-modal__content--success');
            const continueBtn = modalContainer.querySelector('#continue-shopping');
            const orderNumberEl = modalContainer.querySelector('#order-number');

            // Обновляем номер заказа
            if (orderNumberEl) {
                orderNumberEl.textContent = `#${orderNumber}`;
            }

            // 5. Устанавливаем начальное состояние для анимации
            successScreen.style.display = 'flex';

            // 6. Назначаем обработчик для кнопки "Продолжить покупки"
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    close();
                    window.history.pushState({}, '', '/catalog');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                }, { once: true });
            }

            // 7. Небольшая задержка перед показом для корректной анимации
            setTimeout(() => {
                successScreen.style.opacity = '1';
            }, 50);

        }, 300); // Время должно совпадать с CSS transition
    }
    /**
     * Открывает модальное окно с анимацией
     */
    function open() {
        console.log('Открытие модалки оформления заказа');

        // Вставляем модалку в DOM если ее еще нет
        if (!document.body.contains(modalContainer)) {
            document.body.appendChild(modalContainer);
        }

        // Сбрасываем к начальному состоянию
        resetForm();
        showFormScreen();

        // Автозаполнение полей из данных пользователя
        const currentUser = getCurrentUser();
        if (currentUser) {
            // Автозаполнение ФИО
            if (lastNameInput && !lastNameInput.value) lastNameInput.value = currentUser.lastName || '';
            if (firstNameInput && !firstNameInput.value) firstNameInput.value = currentUser.firstName || '';
            if (middleNameInput && !middleNameInput.value) middleNameInput.value = currentUser.middleName || '';
            if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
            if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
        }

        // Запускаем анимацию открытия
        setTimeout(() => {
            modal.classList.add('checkout-modal--active');
        }, 10);

        //Убираем скролл страницы
        document.body.classList.add('modal-open');
        document.addEventListener('keydown', handleEscapePress);
    }

    /**
     * Закрывает модальное окно с анимацией
     */
    function close() {
        modal.classList.remove('checkout-modal--active');

        // Ждем завершения анимации перед удалением
        setTimeout(() => {
            if (modalContainer.parentNode) {
                modalContainer.parentNode.removeChild(modalContainer);
            }

            //Возвращаем скролл
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', handleEscapePress);
        }, 300);
    }

    /**
     * Обработчик нажатия клавиши Escape
     */
    function handleEscapePress(event) {
        if (event.key === 'Escape') {
            close();
        }
    }

    /**
     * Сбрасывает форму к исходному состоянию
     */
    function resetForm() {
        if (modalContainer.querySelector('#checkout-form')) {
            modalContainer.querySelector('#checkout-form').reset();
        }
        clearAllErrors();
        isSubmitting = false;
    }

    /**
 * Валидирует поле фамилии
 */
    function validateLastName() {
        const value = lastNameInput.value.trim();
        if (!value) {
            showError(lastNameInput, lastNameError, 'Введите фамилию');
            return false;
        }
        if (value.length < 2) {
            showError(lastNameInput, lastNameError, 'Фамилия слишком короткая');
            return false;
        }
        clearError(lastNameInput, lastNameError);
        return true;
    }

    /**
     * Валидирует поле имени
     */
    function validateFirstName() {
        const value = firstNameInput.value.trim();
        if (!value) {
            showError(firstNameInput, firstNameError, 'Введите имя');
            return false;
        }
        if (value.length < 2) {
            showError(firstNameInput, firstNameError, 'Имя слишком короткое');
            return false;
        }
        clearError(firstNameInput, firstNameError);
        return true;
    }

    /**
     * Валидирует поле отчества (необязательное)
     */
    function validateMiddleName() {
        const value = middleNameInput.value.trim();
        // Отчество необязательное, но если заполнено - проверяем
        if (value && value.length < 2) {
            showError(middleNameInput, middleNameError, 'Отчество слишком короткое');
            return false;
        }
        clearError(middleNameInput, middleNameError);
        return true;
    }


    /**
     * Валидирует поле телефона
     */
    function validatePhone() {
        const value = phoneInput.value.trim();
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;

        if (!value) {
            showError(phoneInput, phoneError, 'Введите номер телефона');
            return false;
        }

        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
            showError(phoneInput, phoneError, 'Номер слишком короткий');
            return false;
        }

        if (!phoneRegex.test(value)) {
            showError(phoneInput, phoneError, 'Неверный формат номера');
            return false;
        }

        clearError(phoneInput, phoneError);
        return true;
    }

    /**
     * Валидирует поле email
     */
    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            showError(emailInput, emailError, 'Введите email');
            return false;
        }

        if (!emailRegex.test(value)) {
            showError(emailInput, emailError, 'Неверный формат email');
            return false;
        }

        clearError(emailInput, emailError);
        return true;
    }

    /**
     * Валидирует поле адреса
     */
    function validateAddress() {
        const value = addressInput.value.trim();
        if (!value) {
            showError(addressInput, addressError, 'Введите адрес доставки');
            return false;
        }
        if (value.length < 5) {
            showError(addressInput, addressError, 'Адрес слишком короткий');
            return false;
        }
        clearError(addressInput, addressError);
        return true;
    }

    /**
     * Показывает ошибку поля
     */
    function showError(inputElement, errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
        inputElement.classList.add('checkout-form__input--error');
    }

    /**
     * Скрывает ошибку поля
     */
    function clearError(inputElement, errorElement) {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
        inputElement.classList.remove('checkout-form__input--error');
    }

    /**
    * Очищает все ошибки
    */
    function clearAllErrors() {
        clearError(lastNameInput, lastNameError);
        clearError(firstNameInput, firstNameError);
        clearError(middleNameInput, middleNameError);
        clearError(phoneInput, phoneError);
        clearError(emailInput, emailError);
        clearError(addressInput, addressError);
    }

    /**
    * Валидирует всю форму
    */
    function validateForm() {
        const isLastNameValid = validateLastName();
        const isFirstNameValid = validateFirstName();
        const isMiddleNameValid = validateMiddleName();
        const isPhoneValid = validatePhone();
        const isEmailValid = validateEmail();
        const isAddressValid = validateAddress();

        return isLastNameValid && isFirstNameValid && isMiddleNameValid &&
            isPhoneValid && isEmailValid && isAddressValid;
    }

    /**
     * Собирает данные из формы
     */
    function getFormData() {
        const selectedPayment = Array.from(paymentRadios).find(radio => radio.checked);

        return {
            lastName: lastNameInput.value.trim(),
            firstName: firstNameInput.value.trim(),
            middleName: middleNameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            address: addressInput.value.trim(),
            comment: commentInput.value.trim(),
            payment: selectedPayment ? selectedPayment.value : 'card'
        };
    }

    /**
     * Обрабатывает отправку формы
     */
    async function handleSubmit() {
        if (isSubmitting) return;

        if (!validateForm()) {
            return;
        }

        isSubmitting = true;
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Оформляем...';

        try {
            const formData = getFormData();
            const currentUser = getCurrentUser();

            // 1. Обновляем данные пользователя
            if (currentUser) {
                const fullName = [
                    formData.lastName,
                    formData.firstName,
                    formData.middleName
                ].filter(Boolean).join(' ');

                // Создаем объект обновления
                const userUpdates = {
                    lastName: formData.lastName,
                    firstName: formData.firstName,
                    middleName: formData.middleName,
                    name: fullName // Полное имя для обратной совместимости
                };

                // Проверяем, менялось ли имя
                const currentFullName = [
                    currentUser.lastName,
                    currentUser.firstName,
                    currentUser.middleName
                ].filter(Boolean).join(' ');

                if (currentFullName !== fullName) {
                    // Если пользователь ранее не заполнял имя или изменил его
                    if (!currentUser.firstName || confirm('Сохранить ваше имя для будущих заказов?')) {
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
            const savedOrder = addOrder(orderData);

            // Имитация задержки сервера
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Очищаем корзину
            saveCurrentCart([]);

            // 4. Показываем экран успеха
            showSuccessScreen(savedOrder.orderNumber);

            // 5. Отправляем события
            window.dispatchEvent(new CustomEvent('cart:update'));

        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
        } finally {
            isSubmitting = false;
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Подтвердить заказ';
        }
    }

    // Навешиваем обработчики событий
    if (closeBtn) {
        closeBtn.addEventListener('click', close);
    } else {
        console.error('Кнопка закрытия не найдена');
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleSubmit);
    } else {
        console.error('Кнопка подтверждения заказа не найдена');
    }


    // Валидация в реальном времени
    if (lastNameInput) {
        lastNameInput.addEventListener('blur', validateLastName);
        lastNameInput.addEventListener('input', () => clearError(lastNameInput, lastNameError));
    } else {
        console.error('Поле фамилии не найдено');
    }

    if (firstNameInput) {
        firstNameInput.addEventListener('blur', validateFirstName);
        firstNameInput.addEventListener('input', () => clearError(firstNameInput, firstNameError));
    } else {
        console.error('Поле имени не найдено');
    }

    if (middleNameInput) {
        middleNameInput.addEventListener('blur', validateMiddleName);
        middleNameInput.addEventListener('input', () => clearError(middleNameInput, middleNameError));
    } else {
        console.error('Поле отчества не найдено');
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', validatePhone);
        phoneInput.addEventListener('input', () => clearError(phoneInput, phoneError));
    } else {
        console.error('Поле телефона не найдено');
    }

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', () => clearError(emailInput, emailError));
    } else {
        console.error('Поле email не найдено');
    }

    if (addressInput) {
        addressInput.addEventListener('blur', validateAddress);
        addressInput.addEventListener('input', () => clearError(addressInput, addressError));
    } else {
        console.error('Поле адреса не найдено');
    }
    // Закрытие по клику вне модалки (предотвращаем закрытие при выделении текста)
    let isDragging = false;
    let startX, startY;

    modalWrapper.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
    });

    modalWrapper.addEventListener('mousemove', (e) => {
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
            isDragging = true; // пользователь выделяет текст
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal && !isDragging) {
            close(); // закрываем только если не было выделения
        }
        isDragging = false;
    });

    return {
        open,
        close
    };
}

/**
 * Рендерит модальное окно оформления заказа
 * @returns {Object} Объект с методами управления модалкой
 */
export function renderCheckoutModal() {
    const modalContainer = document.createElement('div');

    // Создаем HTML-шаблон без данных о товарах
    modalContainer.innerHTML = createCheckoutModalHTML();

    // Инициализируем логику
    const { open, close } = initCheckoutModal(modalContainer);

    return {
        container: modalContainer,
        open: function () {
            // Проверяем, что корзина не пуста
            const orderItems = getCartItemsWithProducts();
            if (orderItems.length === 0) {
                alert('Ваша корзина пуста!');
                return;
            }
            open();
        },
        close
    };
}

