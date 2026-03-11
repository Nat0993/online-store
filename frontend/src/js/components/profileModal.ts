// ============ ИМПОРТЫ ============
import { escapeHtml } from '../utils/security.js';
import { getCurrentUser, updateCurrentUser } from '../data.js';
import type { User } from '../types/index.js';

// ============ ТИПЫ ============

/** Элементы DOM модального окна профиля */
interface ProfileModalElements {
    modal: HTMLElement;
    modalWrapper: HTMLElement;
    closeBtn: HTMLButtonElement;
    cancelBtn: HTMLButtonElement;
    saveBtn: HTMLButtonElement;
    form: HTMLFormElement;
    lastNameInput: HTMLInputElement;
    firstNameInput: HTMLInputElement;
    middleNameInput: HTMLInputElement;
    phoneInput: HTMLInputElement;
    emailInput: HTMLInputElement;
    lastNameError: HTMLElement;
    firstNameError: HTMLElement;
    middleNameError: HTMLElement;
    phoneError: HTMLElement;
}

/** Состояние модального окна */
interface ProfileModalState {
    isSubmitting: boolean;
    isDragging: boolean;
    startX: number;
    startY: number;
    originalData: ProfileFormData;
}

/** Данные формы профиля */
interface ProfileFormData {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
}

/** Внутреннее API модального окна */
interface ProfileModalApi {
    open: () => void;
    close: () => void;
    updateUserData: (userData: Partial<User>) => void;
}

/** Внешнее API модального окна */
interface ProfileModalReturn {
    container: HTMLElement;
    open: () => void;
    close: () => void;
    updateUserData: (userData: Partial<User>) => void;
}

// ============ УТИЛИТЫ ============

/**
 * Нормализует номер телефона
 * @param {string} phone - номер телефона
 * @returns {string} нормализованный номер
 */
function normalizePhone(phone: string): string {
    if (!phone) return '';
    const normalized = phone.replace(/[^\d+]/g, '');
    
    if (normalized.startsWith('+7')) return normalized;
    if (normalized.startsWith('7')) return '+' + normalized;
    if (normalized.startsWith('8')) return '+7' + normalized.substring(1);
    if (normalized.startsWith('9')) return '+7' + normalized;
    
    return '+7' + normalized;
}

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку модального окна редактирования профиля
 * @param {Partial<User>} userData - данные текущего пользователя
 * @returns {string} HTML-разметка
 */
function createProfileModal(userData: Partial<User> = {}): string {
    // Безопасные значения по умолчанию
    const safeUserData = {
        lastName: '',
        firstName: '',
        middleName: '',
        phone: '',
        email: '',
        ...userData // userData перезаписывает значения по умолчанию
    };
    
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
                <div class="profile-modal__form-inner">
                    <!-- Фамилия -->
                    <div class="profile-modal__field">
                        <label class="profile-modal__label" for="profile-last-name">Фамилия</label>
                        <input type="text" 
                            id="profile-last-name" 
                            class="profile-modal__input" 
                            value="${escapeHtml(safeUserData.lastName || '')}"
                            placeholder="Введите фамилию">
                        <span class="profile-modal__error" id="last-name-error"></span>
                    </div>
                    
                    <!-- Имя -->
                    <div class="profile-modal__field">
                        <label class="profile-modal__label" for="profile-first-name">Имя</label>
                        <input type="text" 
                            id="profile-first-name" 
                            class="profile-modal__input" 
                            value="${escapeHtml(safeUserData.firstName || '')}"
                            placeholder="Введите имя">
                        <span class="profile-modal__error" id="first-name-error"></span>
                    </div>
                    
                    <!-- Отчество -->
                    <div class="profile-modal__field">
                        <label class="profile-modal__label" for="profile-middle-name">Отчество</label>
                        <input type="text" 
                            id="profile-middle-name" 
                            class="profile-modal__input" 
                            value="${escapeHtml(safeUserData.middleName || '')}"
                            placeholder="Введите отчество (необязательно)">
                        <span class="profile-modal__error" id="middle-name-error"></span>
                    </div>
                    
                    <!-- Телефон -->
                    <div class="profile-modal__field">
                        <label class="profile-modal__label" for="profile-phone">Телефон</label>
                        <input type="tel" 
                            id="profile-phone" 
                            class="profile-modal__input" 
                            value="${escapeHtml(safeUserData.phone || '')}"
                            placeholder="+7 (999) 999 99 99">
                        <span class="profile-modal__error" id="phone-error"></span>
                    </div>
                    
                    <!-- Email (только чтение) -->
                    <div class="profile-modal__field">
                        <label class="profile-modal__label" for="profile-email">Email (нельзя изменить)</label>
                        <input type="email" 
                            id="profile-email" 
                            class="profile-modal__input profile-modal__input--readonly" 
                            value="${escapeHtml(safeUserData.email || '')}"
                            readonly
                            disabled>
                    </div>
                </div>
                <!-- Кнопки -->
                <div class="profile-modal__buttons">
                    <button type="submit" class="profile-modal__save-btn btn">
                        Сохранить изменения
                    </button>
                    <button type="button" class="profile-modal__cancel-btn btn">
                        Отменить
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param {HTMLElement} container - контейнер модалки
 * @returns {ProfileModalElements | null} объект с элементами
 */
function getModalElements(container: HTMLElement): ProfileModalElements | null {
    const modal = container.querySelector<HTMLElement>('.profile-modal');
    const modalWrapper = container.querySelector<HTMLElement>('.profile-modal__wrapper');
    const closeBtn = container.querySelector<HTMLButtonElement>('.profile-modal__close');
    const cancelBtn = container.querySelector<HTMLButtonElement>('.profile-modal__cancel-btn');
    const saveBtn = container.querySelector<HTMLButtonElement>('.profile-modal__save-btn');
    const form = container.querySelector<HTMLFormElement>('#profile-form');
    
    // Поля формы
    const lastNameInput = container.querySelector<HTMLInputElement>('#profile-last-name');
    const firstNameInput = container.querySelector<HTMLInputElement>('#profile-first-name');
    const middleNameInput = container.querySelector<HTMLInputElement>('#profile-middle-name');
    const phoneInput = container.querySelector<HTMLInputElement>('#profile-phone');
    const emailInput = container.querySelector<HTMLInputElement>('#profile-email');
    
    // Элементы ошибок
    const lastNameError = container.querySelector<HTMLElement>('#last-name-error');
    const firstNameError = container.querySelector<HTMLElement>('#first-name-error');
    const middleNameError = container.querySelector<HTMLElement>('#middle-name-error');
    const phoneError = container.querySelector<HTMLElement>('#phone-error');

    if (!modal || !modalWrapper || !closeBtn || !cancelBtn || !saveBtn || !form ||
        !lastNameInput || !firstNameInput || !middleNameInput || !phoneInput || !emailInput ||
        !lastNameError || !firstNameError || !middleNameError || !phoneError) {
        console.warn('[ProfileModal] Не все элементы модалки найдены');
        return null;
    }

    return {
        modal,
        modalWrapper,
        closeBtn,
        cancelBtn,
        saveBtn,
        form,
        lastNameInput,
        firstNameInput,
        middleNameInput,
        phoneInput,
        emailInput,
        lastNameError,
        firstNameError,
        middleNameError,
        phoneError
    };
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику модального окна профиля
 * @param {HTMLElement} modalContainer - DOM-элемент модалки
 * @returns {ProfileModalApi | null} Объект с методами управления модалкой
 */
function initProfileModal(modalContainer: HTMLElement): ProfileModalApi | null {
    const elements = getModalElements(modalContainer);
    if (!elements) {
        console.error('[ProfileModal] Не удалось получить элементы модалки');
        return null;
    }

    const {
        modal,
        modalWrapper,
        closeBtn,
        cancelBtn,
        saveBtn,
        form,
        lastNameInput,
        firstNameInput,
        middleNameInput,
        phoneInput,
        emailInput,
        lastNameError,
        firstNameError,
        middleNameError,
        phoneError
    } = elements;
    
    // Состояние модалки
    const state: ProfileModalState = {
        isSubmitting: false,
        isDragging: false,
        startX: 0,
        startY: 0,
        originalData: {
            lastName: '',
            firstName: '',
            middleName: '',
            phone: ''
        }
    };
    
    // ============ РАБОТА С ОШИБКАМИ ============

    /**
     * Показывает ошибку поля
     * @param {HTMLInputElement} inputElement - поле ввода
     * @param {HTMLElement} errorElement - элемент ошибки
     * @param {string} message - текст ошибки
     */
    function showError(inputElement: HTMLInputElement, errorElement: HTMLElement, message: string): void {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
        inputElement.classList.add('profile-modal__input--error');
    }
    
    /**
     * Скрывает ошибку поля
     * @param {HTMLInputElement} inputElement - поле ввода
     * @param {HTMLElement} errorElement - элемент ошибки
     */
    function clearError(inputElement: HTMLInputElement, errorElement: HTMLElement): void {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
        inputElement.classList.remove('profile-modal__input--error');
    }
    
    /**
     * Очищает все ошибки
     */
    function clearAllErrors(): void {
        clearError(lastNameInput, lastNameError);
        clearError(firstNameInput, firstNameError);
        clearError(middleNameInput, middleNameError);
        clearError(phoneInput, phoneError);
    }
    
    // ============ ВАЛИДАЦИЯ ============

    /**
     * Валидирует поле фамилии
     * @returns {boolean} результат валидации
     */
    function validateLastName(): boolean {
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
     * @returns {boolean} результат валидации
     */
    function validateFirstName(): boolean {
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
     * @returns {boolean} результат валидации
     */
    function validateMiddleName(): boolean {
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
     * @returns {boolean} результат валидации
     */
    function validatePhone(): boolean {
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
     * @returns {boolean} результат валидации
     */
    function validateForm(): boolean {
        const isLastNameValid = validateLastName();
        const isFirstNameValid = validateFirstName();
        const isMiddleNameValid = validateMiddleName();
        const isPhoneValid = validatePhone();
        
        return isLastNameValid && isFirstNameValid && isMiddleNameValid && isPhoneValid;
    }
    
    // ============ РАБОТА С ДАННЫМИ ============

    /**
     * Собирает данные из формы
     * @returns {ProfileFormData} данные формы
     */
    function getFormData(): ProfileFormData {
        return {
            lastName: lastNameInput.value.trim(),
            firstName: firstNameInput.value.trim(),
            middleName: middleNameInput.value.trim(),
            phone: normalizePhone(phoneInput.value.trim())
        };
    }
    
    /**
     * Проверяет, есть ли изменения в форме
     * @returns {boolean} true если есть изменения
     */
    function hasFormChanges(): boolean {
        const formData = getFormData();
        return (
            formData.lastName !== state.originalData.lastName ||
            formData.firstName !== state.originalData.firstName ||
            formData.middleName !== state.originalData.middleName ||
            formData.phone !== normalizePhone(state.originalData.phone)
        );
    }
    
    // ============ УПРАВЛЕНИЕ МОДАЛКОЙ ============

    /**
     * Открывает модальное окно
     */
    function open(): void {
        // Загружаем актуальные данные пользователя
        const currentUser = getCurrentUser();
        if (currentUser) {
            updateUserData(currentUser);
        }
        
        clearAllErrors();
        modal.classList.add('profile-modal--active');
        document.body.classList.add('modal-open');
        document.addEventListener('keydown', handleEscapePress);

    }

    /**
     * Закрывает модальное окно
     */
    function close(): void {
        modal.classList.remove('profile-modal--active');
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleEscapePress);
        clearAllErrors();
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
    
    /**
     * Обновляет данные пользователя в форме
     * @param {Partial<User>} userData - данные пользователя
     */
    function updateUserData(userData: Partial<User>): void {
        const currentUser = userData || {};
        state.originalData = {
            lastName: currentUser.lastName || '',
            firstName: currentUser.firstName || '',
            middleName: currentUser.middleName || '',
            phone: normalizePhone(currentUser.phone || '')
        };
        
        lastNameInput.value = state.originalData.lastName;
        firstNameInput.value = state.originalData.firstName;
        middleNameInput.value = state.originalData.middleName;
        phoneInput.value = state.originalData.phone;
        emailInput.value = currentUser.email || '';
        
        clearAllErrors();
    }
    
    // ============ ОБРАБОТЧИК ФОРМЫ ============

    /**
     * Обрабатывает отправку формы
     * @param {SubmitEvent} event - событие отправки
     */
    async function handleSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();
        
        if (state.isSubmitting) return;
        
        if (!validateForm()) {
            return;
        }
        
        // Проверяем, есть ли изменения
        if (!hasFormChanges()) {
            alert('Нет изменений для сохранения');
            close();
            return;
        }
        
        state.isSubmitting = true;
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
            console.error('[ProfileModal] Ошибка сохранения профиля:', error);
            alert('Произошла ошибка при сохранении. Попробуйте еще раз.');
        } finally {
            state.isSubmitting = false;
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить изменения';
        }
    }
    
    // ============ НАСТРОЙКА ОБРАБОТЧИКОВ ============

    // Закрытие по кнопкам
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    // Отправка формы
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
    
    // Закрытие по клику вне модалки (с защитой от выделения текста)
    modalWrapper.addEventListener('mousedown', (e: MouseEvent): void => {
        state.isDragging = false;
        state.startX = e.clientX;
        state.startY = e.clientY;
    });
    
    modalWrapper.addEventListener('mousemove', (e: MouseEvent): void => {
        if (Math.abs(e.clientX - state.startX) > 5 || Math.abs(e.clientY - state.startY) > 5) {
            state.isDragging = true;
        }
    });
    
    modal.addEventListener('click', (e: MouseEvent): void => {
        if (e.target === modal && !state.isDragging) {
            close();
        }
        state.isDragging = false;
    });
    
    return {
        open,
        close,
        updateUserData
    };
}

// ============ ПУБЛИЧНЫЙ API ============

// Для проверки на существование модалки в разметке (исключить повторных отрисовок) 
let profileModalInstance: ProfileModalReturn | null = null;

/**
 * Рендерит модальное окно редактирования профиля
 * @returns {ProfileModalReturn} Объект с методами управления модалкой
 */
export function renderProfileModal(): ProfileModalReturn {
    // Если модалка уже создана, возвращаем существующую
    if (profileModalInstance) {
        // Обновляем данные перед открытием
        const currentUser = getCurrentUser() || {};
        profileModalInstance.updateUserData(currentUser);
        return profileModalInstance;
    }
    
    const modalContainer = document.createElement('div');
    const currentUser = getCurrentUser() || {};
    
    modalContainer.innerHTML = createProfileModal(currentUser);
    const modalApi = initProfileModal(modalContainer);

    if (!modalApi) {
        console.error('[ProfileModal] Не удалось инициализировать модалку');
        // Возвращаем заглушку
        const fallbackInstance: ProfileModalReturn = {
            container: modalContainer,
            open: () => console.warn('[ProfileModal] Модалка не инициализирована'),
            close: () => console.warn('[ProfileModal] Модалка не инициализирована'),
            updateUserData: () => console.warn('[ProfileModal] Модалка не инициализирована')
        };
        profileModalInstance = fallbackInstance;
        return fallbackInstance;
    }
    
    profileModalInstance = {
        container: modalContainer,
        open: modalApi.open,
        close: modalApi.close,
        updateUserData: modalApi.updateUserData
    };
    
    return profileModalInstance;
}