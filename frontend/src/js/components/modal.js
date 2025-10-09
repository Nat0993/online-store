import {
    registerUser,
    loginUser,
    setCurrentUser,
    getCurrentUser,
    logoutUser
} from '../data.js';

// Функция, которая возвращает HTML-разметку модального окна
function createModal() {
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


// Функция для инициализации логики модального окна
function initModal(modalContainer) {
    const modalWindow = modalContainer.querySelector('.auth');
    const btnCloseModal = modalContainer.querySelector('.auth__close');
    const btnSwitchModal = modalContainer.querySelector('.auth__switch-btn');
    const modalTitle = modalContainer.querySelector('.auth__title');
    const modalBtn = modalContainer.querySelector('.auth__btn');
    const authForm = modalContainer.querySelector('.auth__form');
    const inputEmail = modalContainer.querySelector('#user-email');
    const inputPassword = modalContainer.querySelector('#user-password');
    const inputConfirm = modalContainer.querySelector('#confirm-password');
    const modalNote = modalContainer.querySelector('.auth__description');
    const emailError = modalContainer.querySelector('.auth__error--email');
    const passwordError = modalContainer.querySelector('.auth__error--password');
    const confirmError = modalContainer.querySelector('.auth__error--confirm');

    let currentMode = 'login';
    let isOpening = false;

    //1. Функция открытия модалки
    function openModal() {
        isOpening = true;
        modalWindow.classList.add('auth--active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        document.addEventListener('keydown', handleEscapePress); // Закрытие по Escape
        setAuthMode('login');
        clearAllErrors();

        setTimeout(() => {
            isOpening = false;
        }, 100);
    }

    // 2. Функция для закрытия модалки

    function closeModal() {
        modalWindow.classList.remove('auth--active');
        document.body.style.overflow = ''; // Возвращаем прокрутку
        document.removeEventListener('keydown', handleEscapePress); // Убираем обработчик
        authForm.reset();
        clearAllErrors();
    };

    // 3. Закрытие по клавише Escape
    function handleEscapePress(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    // 4. Обработчики событий 

    // Закрытие по клику на крестик 
    btnCloseModal.addEventListener('click', closeModal);

    //Закрытие по клику вне контента модалки
    document.addEventListener('click', (event) => {
        const target = event.target;

        //Игнор кликов в момент открытия модалки (конфликт с кнопкой войти в хедере)
        if (isOpening) {
            return;
        }

        if (!modalWindow.contains(target)) {
            closeModal();
        }
    });

    // 5. Функция переключение режимов (Логин/Регистрация)
    function setAuthMode(mode) {
        currentMode = mode;
        const isLogin = mode === 'login';

        btnSwitchModal.setAttribute('data-target', isLogin ? 'register' : 'login');
        btnSwitchModal.textContent = isLogin ? 'Регистрация' : 'Войти';
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

    // 6. переключение модалки по кнопке 
    btnSwitchModal.addEventListener('click', () => {
        const target = btnSwitchModal.getAttribute('data-target');
        setAuthMode(target)
    });

    //7. Функции для работы с ошибками
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
        errorElement.previousElementSibling.style.borderColor = '#a32b2b';
    };

    function hideError(errorElement) {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
        errorElement.previousElementSibling.style.borderColor = '';
    };

    function clearAllErrors() {
        hideError(emailError);
        hideError(passwordError);
        hideError(confirmError);
    }

    // 8. Валидация отдельных полей 
    function validateEmail() {
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

    function validatePassword() {
        const passwordValue = inputPassword.value.trim();

        if (!passwordValue) {
            showError(passwordError, 'Пароль обязателен для заполнения');
            return false;
        }

        if (currentMode === 'register' && passwordValue.length < 6) {
            showError(passwordError, 'Пароль должен содержать минимум 6 символов');
            return false;
        }

        hideError(passwordError);
        return true;
    }

    function validateConfirmPassword() {
        if (currentMode === 'login') {
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

    // 9. Основная валидация формы
    function validateForm() {

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();

        return isEmailValid && isPasswordValid && isConfirmValid;
    };

    //10. Валидация в реальном времени
    inputEmail.addEventListener('blur', validateEmail);
    inputEmail.addEventListener('input', () => hideError(emailError));

    inputPassword.addEventListener('blur', validatePassword);
    inputPassword.addEventListener('input', () => {
        hideError(passwordError);
        if (currentMode === 'register') {
            validateConfirmPassword();
        }
    });

    inputConfirm.addEventListener('blur', validateConfirmPassword);
    inputConfirm.addEventListener('input', () => hideError(confirmError));

    //11. Обработчик отправки формы 
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();

    if (!validateForm()) {
        return;
    }

        const formData = {
            email: inputEmail.value.trim(),
            password: inputPassword.value.trim(),
        };

        try {
            if (currentMode === 'login') {
                await handleLogin(formData);
            } else {
                await handleRegistration(formData);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }

    });

    //Функции входа и регистрации
    async function handleLogin(formData) {
        try {
            console.log('Запрос на вход:', formData);
    
            const user = await loginUser(formData.email, formData.password);
            console.log('Успешный вход:', user);
    
            setCurrentUser(user);
            closeModal();

            // Отправляем событие о входе
            window.dispatchEvent(new CustomEvent('auth:change', { 
            detail: { user, type: 'login' }
        }));
    
        } catch (error) {
            console.error('Ошибка входа:', error);
    
            if (error.message.includes('email') || error.message.includes('Email')) {
                showError(emailError, error.message);
            } else if (error.message.includes('password') || error.message.includes('пароль')) {
                showError(passwordError, error.message);
            } else {
                alert(error.message || 'Ошибка входа');
            }
        };
    };
    
    async function handleRegistration(formData) {
        try {
            console.log('Запрос на регистрацию:', formData);
    
            const user = await registerUser({
                email: formData.email,
                password: formData.password,
                name: formData.email.split('@')[0]
            });
    
            console.log('Успешная регистрация:', user);
    
            setCurrentUser(user);
            closeModal();

            // Отправляем событие о входе
            window.dispatchEvent(new CustomEvent('auth:change', { 
            detail: { user, type: 'login' }
        }));
    
            alert('Регистрация прошла успешно!');
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            if (error.message.includes('email') || error.message.includes('Email')) {
                showError(emailError, error.message);
            } else if (error.message.includes('password') || error.message.includes('парол')) {
                showError(passwordError, error.message);
            } else {
                alert(error.message || 'Ошибка регистрации');
            }
        };
    };

    return openModal; //для использования в хедере
};

export function renderModal() {
    const modalContainer = document.createElement('div');;

    //Вставляем разметку
    modalContainer.innerHTML = createModal();

    //Подключаем логику, когда загружен DOM
    const openModalFunction = initModal(modalContainer);

    return {
        container: modalContainer,
        functions: openModalFunction
    };
}