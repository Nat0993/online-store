import { escapeHtml } from '../utils/security.js';
import { getCurrentUser, updateCurrentUser } from '../data.js';

/**
 * Создает HTML-разметку модального окна редактирования профиля
 * @param {Object} userData - данные текущего пользователя
 * @returns {string} HTML-разметка
 */
function createProfileModal(userData) {
    return `
    <div class="profile-modal">
        <div class="profile-modal__wrapper">
            <button class="profile-modal__close" type="button" aria-label="Закрыть окно">
                <svg width="20" height="20" aria-hidden="true">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                </svg>
            </button>
            
            <h2 class="profile-modal__title">Редактирование профиля</h2>
            
            <form class="profile-modal__form" id="profile-form">
                <!-- Фамилия -->
                <div class="profile-modal__field">
                    <label class="profile-modal__label" for="profile-last-name">Фамилия</label>
                    <input type="text" 
                           id="profile-last-name" 
                           class="profile-modal__input" 
                           value="${escapeHtml(userData.lastName || '')}"
                           placeholder="Введите фамилию">
                    <span class="profile-modal__error" id="last-name-error"></span>
                </div>
                
                <!-- Имя -->
                <div class="profile-modal__field">
                    <label class="profile-modal__label" for="profile-first-name">Имя</label>
                    <input type="text" 
                           id="profile-first-name" 
                           class="profile-modal__input" 
                           value="${escapeHtml(userData.firstName || '')}"
                           placeholder="Введите имя">
                    <span class="profile-modal__error" id="first-name-error"></span>
                </div>
                
                <!-- Отчество -->
                <div class="profile-modal__field">
                    <label class="profile-modal__label" for="profile-middle-name">Отчество</label>
                    <input type="text" 
                           id="profile-middle-name" 
                           class="profile-modal__input" 
                           value="${escapeHtml(userData.middleName || '')}"
                           placeholder="Введите отчество (необязательно)">
                    <span class="profile-modal__error" id="middle-name-error"></span>
                </div>
                
                <!-- Телефон -->
                <div class="profile-modal__field">
                    <label class="profile-modal__label" for="profile-phone">Телефон</label>
                    <input type="tel" 
                           id="profile-phone" 
                           class="profile-modal__input" 
                           value="${escapeHtml(userData.phone || '')}"
                           placeholder="+7 (999) 999 99 99">
                    <span class="profile-modal__error" id="phone-error"></span>
                </div>
                
                <!-- Email (только чтение) -->
                <div class="profile-modal__field">
                    <label class="profile-modal__label" for="profile-email">Email</label>
                    <input type="email" 
                           id="profile-email" 
                           class="profile-modal__input profile-modal__input--readonly" 
                           value="${escapeHtml(userData.email || '')}"
                           readonly
                           disabled>
                    <span class="profile-modal__hint">Email нельзя изменить</span>
                </div>
                
                <!-- Кнопки -->
                <div class="profile-modal__buttons">
                    <button type="submit" class="profile-modal__save-btn btn">
                        Сохранить изменения
                    </button>
                    <button type="button" class="profile-modal__cancel-btn">
                        Отменить
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}

/**
 * Нормализует номер телефона
 */
function normalizePhone(phone) {
    if (!phone) return '';
    const normalized = phone.replace(/[^\d+]/g, '');
    
    if (normalized.startsWith('+7')) return normalized;
    if (normalized.startsWith('7')) return '+' + normalized;
    if (normalized.startsWith('8')) return '+7' + normalized.substring(1);
    if (normalized.startsWith('9')) return '+7' + normalized;
    
    return '+7' + normalized;
}

/**
 * Инициализирует логику модального окна
 * @param {HTMLElement} modalContainer - DOM-элемент модалки
 * @returns {Object} Объект с методами управления модалкой
 */
function initProfileModal(modalContainer) {
    const modal = modalContainer.querySelector('.profile-modal');
    const modalWrapper = modalContainer.querySelector('.profile-modal__wrapper');
    const closeBtn = modalContainer.querySelector('.profile-modal__close');
    const cancelBtn = modalContainer.querySelector('.profile-modal__cancel-btn');
    const saveBtn = modalContainer.querySelector('.profile-modal__save-btn');
    const form = modalContainer.querySelector('#profile-form');
    
    // Поля формы
    const lastNameInput = modalContainer.querySelector('#profile-last-name');
    const firstNameInput = modalContainer.querySelector('#profile-first-name');
    const middleNameInput = modalContainer.querySelector('#profile-middle-name');
    const phoneInput = modalContainer.querySelector('#profile-phone');
    const emailInput = modalContainer.querySelector('#profile-email');
    
    // Элементы ошибок
    const lastNameError = modalContainer.querySelector('#last-name-error');
    const firstNameError = modalContainer.querySelector('#first-name-error');
    const middleNameError = modalContainer.querySelector('#middle-name-error');
    const phoneError = modalContainer.querySelector('#phone-error');
    
    let isSubmitting = false;
    
    /**
     * Показывает ошибку поля
     */
    function showError(inputElement, errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
        inputElement.classList.add('profile-modal__input--error');
    }
    
    /**
     * Скрывает ошибку поля
     */
    function clearError(inputElement, errorElement) {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
        inputElement.classList.remove('profile-modal__input--error');
    }
    
    /**
     * Очищает все ошибки
     */
    function clearAllErrors() {
        clearError(lastNameInput, lastNameError);
        clearError(firstNameInput, firstNameError);
        clearError(middleNameInput, middleNameError);
        clearError(phoneInput, phoneError);
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
     * Валидирует поле отчества
     */
    function validateMiddleName() {
        const value = middleNameInput.value.trim();
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
        
        if (!value) {
            showError(phoneInput, phoneError, 'Введите номер телефона');
            return false;
        }
        
        const normalizedPhone = normalizePhone(value);
        
        if (!normalizedPhone.startsWith('+7')) {
            showError(phoneInput, phoneError, 'Номер должен начинаться с +7');
            return false;
        }
        
        if (normalizedPhone.length !== 12) {
            showError(phoneInput, phoneError, 'В номере должно быть 10 цифр после +7');
            return false;
        }
        
        const digitsOnly = normalizedPhone.substring(2);
        if (!/^\d{10}$/.test(digitsOnly)) {
            showError(phoneInput, phoneError, 'Номер содержит недопустимые символы');
            return false;
        }
        
        clearError(phoneInput, phoneError);
        return true;
    }
    
    /**
     * Валидирует всю форму
     */
    function validateForm() {
        const isLastNameValid = validateLastName();
        const isFirstNameValid = validateFirstName();
        const isMiddleNameValid = validateMiddleName();
        const isPhoneValid = validatePhone();
        
        return isLastNameValid && isFirstNameValid && isMiddleNameValid && isPhoneValid;
    }
    
    /**
     * Собирает данные из формы
     */
    function getFormData() {
        return {
            lastName: lastNameInput.value.trim(),
            firstName: firstNameInput.value.trim(),
            middleName: middleNameInput.value.trim(),
            phone: normalizePhone(phoneInput.value.trim())
        };
    }
    
    /**
     * Обрабатывает отправку формы
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (isSubmitting) return;
        
        if (!validateForm()) {
            return;
        }
        
        isSubmitting = true;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';
        
        try {
            const formData = getFormData();
            const updatedUser = updateCurrentUser(formData);
            
            // Имитация задержки сервера
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Отправляем событие об обновлении пользователя
            window.dispatchEvent(new CustomEvent('auth:change', {
                detail: {
                    user: updatedUser,
                    type: 'profile-update'
                }
            }));
            
            close();
            alert('Данные успешно сохранены!');
            
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
            alert('Произошла ошибка при сохранении. Попробуйте еще раз.');
        } finally {
            isSubmitting = false;
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить изменения';
        }
    }
    
    /**
     * Открывает модальное окно
     */
    function open() {
        // Загружаем актуальные данные пользователя
        const currentUser = getCurrentUser();
        if (currentUser) {
            lastNameInput.value = currentUser.lastName || '';
            firstNameInput.value = currentUser.firstName || '';
            middleNameInput.value = currentUser.middleName || '';
            phoneInput.value = currentUser.phone || '';
            emailInput.value = currentUser.email || '';
        }
        
        clearAllErrors();
        modal.classList.add('profile-modal--active');
        document.addEventListener('keydown', handleEscapePress);
        
        // Фокус на первое поле
        setTimeout(() => {
            lastNameInput.focus();
        }, 100);
    }
    
    /**
     * Закрывает модальное окно
     */
    function close() {
        modal.classList.remove('profile-modal--active');
        document.removeEventListener('keydown', handleEscapePress);
        clearAllErrors();
    }
    
    /**
     * Обработчик клавиши Escape
     */
    function handleEscapePress(event) {
        if (event.key === 'Escape') {
            close();
        }
    }
    
    // Назначаем обработчики событий
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    form.addEventListener('submit', handleSubmit);
    
    // Валидация в реальном времени
    lastNameInput.addEventListener('blur', validateLastName);
    lastNameInput.addEventListener('input', () => clearError(lastNameInput, lastNameError));
    
    firstNameInput.addEventListener('blur', validateFirstName);
    firstNameInput.addEventListener('input', () => clearError(firstNameInput, firstNameError));
    
    middleNameInput.addEventListener('blur', validateMiddleName);
    middleNameInput.addEventListener('input', () => clearError(middleNameInput, middleNameError));
    
    phoneInput.addEventListener('blur', validatePhone);
    phoneInput.addEventListener('input', () => clearError(phoneInput, phoneError));
    
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
 * Рендерит модальное окно редактирования профиля
 * @returns {Object} Объект с методами управления модалкой
 */
export function renderProfileModal() {
    const modalContainer = document.createElement('div');
    const currentUser = getCurrentUser() || {};
    
    modalContainer.innerHTML = createProfileModal(currentUser);
    const { open, close } = initProfileModal(modalContainer);
    
    return {
        container: modalContainer,
        open,
        close
    };
}