import {
    registerUser,
    loginUser,
} from '../data.js';
import type { UserData } from '../types/index.js';

// ============ ТИПЫ ============

/** Режимы работы модалки */
type AuthMode = 'login' | 'register';

/** Данные формы авторизации */
interface AuthFormData {
    email: string;
    password: string;
}

/** Элементы DOM модального окна */
interface ModalElements {
    modalWindow: HTMLElement;
    modalWrapper: HTMLElement;
    btnClose: HTMLButtonElement;
    btnSwitch: HTMLButtonElement;
    modalTitle: HTMLElement;
    modalBtn: HTMLButtonElement;
    authForm: HTMLFormElement;
    inputEmail: HTMLInputElement;
    inputPassword: HTMLInputElement;
    inputConfirm: HTMLInputElement;
    modalNote: HTMLElement;
    emailError: HTMLElement;
    passwordError: HTMLElement;
    confirmError: HTMLElement;
}

/** Возвращаемый объект модалки */
interface ModalReturn {
    container: HTMLElement;
    open: () => void;
}

// ============ СОСТОЯНИЯ ============
interface ModalState {
    currentMode: AuthMode;
    isOpening: boolean;
    isDragging: boolean;
    startX: number;
    startY: number;
}

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку модального окна
 */
function createModal(): string {
    return `
    <div class="auth">
        <div class="auth__wrapper">
            <div class="auth__inner">
                <span class="auth__title">Вход</span>
                <button class="auth__close">
                    <svg width="20" height="20" aria-hidden="true">
                        <use xlink:href="../src/assets/images/sprite.svg#icon-close"></use>
                    </svg>
                </button>
            </div>
            <form class="auth__form" action="#" method="post">
                <div class="auth__input-inner">
                    <input class="auth__input" type="email" id="user-email" placeholder="Адрес электронной почты">
                    <span class="auth__error auth__error--email"></span>
                </div>
                <div class="auth__input-inner">
                    <input class="auth__input" type="password" id="user-password" placeholder="Введите пароль">
                    <span class="auth__error auth__error--password"></span>
                </div>
                <div class="auth__input-inner auth__input-inner--confirm">
                    <input class="auth__input" type="password" id="confirm-password" placeholder="Повторите пароль">
                    <span class="auth__error auth__error--confirm"></span>
                </div>
                <div class="auth__bottom">
                    <button class="auth__btn btn" type="submit">Войти</button>
                    <button class="auth__switch-btn" data-target="login" type="button">Регистрация</button>
                    <span class="auth__description">Если у Вас еще нет аккаунта</span>
                </div>
            </form>
        </div>
    </div>
    `;
};

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 */
function getModalElements(container: HTMLElement): ModalElements | null {
    const modalWindow = container.querySelector<HTMLElement>('.auth');
    const modalWrapper = container.querySelector<HTMLElement>('.auth__wrapper');
    const btnClose = container.querySelector<HTMLButtonElement>('.auth__close');
    const btnSwitch = container.querySelector<HTMLButtonElement>('.auth__switch-btn');
    const modalTitle = container.querySelector<HTMLElement>('.auth__title');
    const modalBtn = container.querySelector<HTMLButtonElement>('.auth__btn');
    const authForm = container.querySelector<HTMLFormElement>('.auth__form');
    const inputEmail = container.querySelector<HTMLInputElement>('#user-email');
    const inputPassword = container.querySelector<HTMLInputElement>('#user-password');
    const inputConfirm = container.querySelector<HTMLInputElement>('#confirm-password');
    const modalNote = container.querySelector<HTMLElement>('.auth__description');
    const emailError = container.querySelector<HTMLElement>('.auth__error--email');
    const passwordError = container.querySelector<HTMLElement>('.auth__error--password');
    const confirmError = container.querySelector<HTMLElement>('.auth__error--confirm');

    if (!modalWindow || !modalWrapper || !btnClose || !btnSwitch || !modalTitle ||
        !modalBtn || !authForm || !inputEmail || !inputPassword || !inputConfirm ||
        !modalNote || !emailError || !passwordError || !confirmError) {
        console.warn('[AuthModal] Не все элементы модалки найдены');
        return null;
    }

    return {
        modalWindow,
        modalWrapper,
        btnClose,
        btnSwitch,
        modalTitle,
        modalBtn,
        authForm,
        inputEmail,
        inputPassword,
        inputConfirm,
        modalNote,
        emailError,
        passwordError,
        confirmError
    };
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику модального окна авторизации
 * @param {HTMLElement} container - контейнер модального окна
 * @returns {Function} Функция открытия модального окна
 */
function initModal(container: HTMLElement): (() => void) | null {
    const elements = getModalElements(container);
    if (!elements) {
        return null;
    }

    const {
        modalWindow,
        modalWrapper,
        btnClose,
        btnSwitch,
        modalTitle,
        modalBtn,
        authForm,
        inputEmail,
        inputPassword,
        inputConfirm,
        modalNote,
        emailError,
        passwordError,
        confirmError
    } = elements;

    // Состояние модалки
    const state: ModalState = {
        currentMode: 'login',
        isOpening: false,
        isDragging: false,
        startX: 0,
        startY: 0
    };

    // ============ УПРАВЛЕНИЕ ОТОБРАЖЕНИЕМ ============

    /** Открывает модалку */
    function openModal(): void {
        state.isOpening = true;
        modalWindow.classList.add('auth--active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        document.addEventListener('keydown', handleEscapePress); // Закрытие по Escape
        setAuthMode('login');
        clearAllErrors();

        setTimeout(() => {
            state.isOpening = false;
        }, 100);
    }

    /** Закрывает модалку */

    function closeModal(): void {
        modalWindow.classList.remove('auth--active');
        document.body.style.overflow = ''; // Возвращаем прокрутку
        document.removeEventListener('keydown', handleEscapePress); // Убираем обработчик
        authForm.reset();
        clearAllErrors();
    };

    /** Обработчик нажатия Escape */
    function handleEscapePress(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    // ============ УПРАВЛЕНИЕ РЕЖИМОМ ============

    /**
    * Устанавливает режим работы модального окна (логин/регистрация)
    * @param {string} mode - режим работы ('login' или 'register')
    */
    function setAuthMode(mode: AuthMode): void {
        state.currentMode = mode;
        const isLogin = mode === 'login';

        btnSwitch.setAttribute('data-target', isLogin ? 'register' : 'login');
        btnSwitch.textContent = isLogin ? 'Регистрация' : 'Войти';
        modalTitle.textContent = isLogin ? 'Вход' : 'Регистрация';
        modalBtn.textContent = isLogin ? 'Войти' : 'Зарегистрироваться';
        modalNote.textContent = isLogin ? 'Если у Вас еще нет аккаунта' : 'Если у Вас уже есть аккаунт';
        inputPassword.placeholder = isLogin ? 'Введите пароль' : 'Придумайте пароль';

        if (isLogin) {
            modalWindow.classList.remove('auth--register')
        } else {
            modalWindow.classList.add('auth--register');
        };

        clearAllErrors();
    };

    // ============ РАБОТА С ОШИБКАМИ ============

    /** Показывает ошибку */
    function showError(errorElement: HTMLElement, message: string): void {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';

        const input = errorElement.previousElementSibling as HTMLElement;
        if (input) {
            input.style.borderColor = '#a32b2b';
        }
    };

    /** Скрывает ошибку */
    function hideError(errorElement: HTMLElement): void {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';

        const input = errorElement.previousElementSibling as HTMLElement;
        if (input) {
            input.style.borderColor = '';
        }
    };

    /** Очищает все ошибки */
    function clearAllErrors(): void {
        hideError(emailError);
        hideError(passwordError);
        hideError(confirmError);
    }

    // ============ ВАЛИДАЦИЯ ============

    /** Валидация email */
    function validateEmail(): boolean {
        const emailValue = inputEmail.value.trim();

        if (!emailValue) {
            showError(emailError, 'Email обязателен для заполнения');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            showError(emailError, 'Введите корректный email');
            return false;
        }

        hideError(emailError);
        return true;
    }

    /** Валидация пароля */
    function validatePassword(): boolean {
        const passwordValue = inputPassword.value.trim();

        if (!passwordValue) {
            showError(passwordError, 'Пароль обязателен для заполнения');
            return false;
        }

        if (state.currentMode === 'register' && passwordValue.length < 6) {
            showError(passwordError, 'Пароль должен содержать минимум 6 символов');
            return false;
        }

        hideError(passwordError);
        return true;
    }

    /** Валидация подтверждения пароля */
    function validateConfirmPassword(): boolean {
        if (state.currentMode === 'login') {
            return true;
        }

        const confirmValue = inputConfirm.value.trim();
        const passwordValue = inputPassword.value.trim();

        if (!confirmValue) {
            showError(confirmError, 'Подтверждение пароля обязательно');
            return false;
        }

        if (confirmValue !== passwordValue) {
            showError(confirmError, 'Пароли не совпадают');
            return false;
        }

        hideError(confirmError);
        return true;
    }

    /** Основная валидация формы */
    function validateForm(): boolean {

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();

        return isEmailValid && isPasswordValid && isConfirmValid;
    };

    // ============ ОБРАБОТЧИКИ ФОРМЫ ============

    /** Обработчик входа */
    function handleLogin(formData: AuthFormData): void {
        try {
            console.log('[AuthModal] Запрос на вход:', formData.email);

            const user = loginUser(formData.email, formData.password);
            console.log('[AuthModal] Успешный вход:', user.email);

            closeModal();

            // Отправляем событие о входе
            window.dispatchEvent(new CustomEvent('auth:change', {
                detail: { user, type: 'login' }
            }));

        } catch (error) {
            console.error('[AuthModal] Ошибка входа:', error);

            const message = error instanceof Error ? error.message : 'Ошибка входа';

            if (message.toLowerCase().includes('email')) {
                showError(emailError, message);
            } else if (message.toLowerCase().includes('пароль') || message.toLowerCase().includes('password')) {
                showError(passwordError, message);
            } else {
                alert(message);
            }
        };
    };

    /** Обработчик регистрации */
    function handleRegistration(formData: AuthFormData): void {
        try {
            console.log('[AuthModal] Запрос на регистрацию:', formData.email);

            const userData: UserData = {
                email: formData.email,
                password: formData.password,
                login: formData.email.split('@')[0],
                firstName: '',
                lastName: '',
                middleName: '',
                phone: '',
            };

            const user = registerUser(userData);

            console.log('[AuthModal] Успешная регистрация:', user.email);

            closeModal();

            // Отправляем событие о входе
            window.dispatchEvent(new CustomEvent('auth:change', {
                detail: { user, type: 'login' }
            }));

            alert('Регистрация прошла успешно!');
        } catch (error) {
            console.error('[AuthModal] Ошибка регистрации:', error);

            const message = error instanceof Error ? error.message : 'Ошибка регистрации';

            if (message.toLowerCase().includes('email')) {
                showError(emailError, message);
            } else if (message.toLowerCase().includes('пароль') || message.toLowerCase().includes('password')) {
                showError(passwordError, message);
            } else {
                alert(message);
            }
        };
    };

    /** Обработчик отправки формы */
    function handleSubmit(event: SubmitEvent): void {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData: AuthFormData = {
            email: inputEmail.value.trim(),
            password: inputPassword.value.trim(),
        };

        try {
            if (state.currentMode === 'login') {
                handleLogin(formData);
            } else {
                handleRegistration(formData);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }

    };

    // ============ НАСТРОЙКА ОБРАБОТЧИКОВ ============

    // Закрытие по клику на крестик 
    btnClose.addEventListener('click', closeModal);

    // Переключение режима модалки по кнопке 
    btnSwitch.addEventListener('click', () => {
        const target = btnSwitch.getAttribute('data-target') as AuthMode;
        setAuthMode(target)
    });

    // Отправка формы
    authForm.addEventListener('submit', handleSubmit);

    //Валидация в реальном времени
    inputEmail.addEventListener('blur', validateEmail);
    inputEmail.addEventListener('input', () => hideError(emailError));

    inputPassword.addEventListener('blur', validatePassword);
    inputPassword.addEventListener('input', () => {
        hideError(passwordError);
        if (state.currentMode === 'register') {
            validateConfirmPassword();
        }
    });

    inputConfirm.addEventListener('blur', validateConfirmPassword);
    inputConfirm.addEventListener('input', () => hideError(confirmError));

    //Закрытие по клику вне модалки (предотвращаем закрытие при выделении текста)
    modalWrapper.addEventListener('mousedown', (e: MouseEvent): void => {
        state.isDragging = false;
        state.startX = e.clientX;
        state.startY = e.clientY;
    });

    modalWrapper.addEventListener('mousemove', (e: MouseEvent): void => {
        if (Math.abs(e.clientX - state.startX) > 5 || Math.abs(e.clientY - state.startY) > 5) {
            state.isDragging = true; // пользователь выделяет текст
        }
    });


    modalWindow.addEventListener('click', (e: MouseEvent): void => {
        //Игнор кликов в момент открытия модалки (конфликт с кнопкой войти в хедере)
        if (state.isOpening) {
            return;
        }

        if (e.target === modalWindow && !state.isDragging) {
            closeModal(); // закрываем только если не было выделения
        }
        state.isDragging = false;
    });

    return openModal; //для использования в хедере
};


// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит модальное окно авторизации/регистрации*/
export function renderModal(): ModalReturn {
    const modalContainer = document.createElement('div');

    //Вставляем разметку
    modalContainer.innerHTML = createModal();

    //Подключаем логику, когда загружен DOM
    const openModal  = initModal(modalContainer);

    // Если не удалось инициализировать, возвращаем заглушку
    const openModalFunction  = openModal || (() => {
        console.error('[AuthModal] Не удалось инициализировать модалку');
    });

    return {
        container: modalContainer,
        open: openModalFunction
    };
}