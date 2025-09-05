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
                <input class="auth__input" type="email" id="user-email" placeholder="Адрес электронной почты" required>
                <input class="auth__input" type="password" id="user-password" placeholder="Введите пароль" required>
                <input class="auth__input" type="password" id="confirm-password" placeholder="Повторите пароль" required>
                <div class="auth__bottom">
                    <button class="auth__btn btn" type="button">Войти</button>
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

    let currentMode = 'login';
    let isOpening = false;

    //1. Функция открытия модалки
    function openModal() {
        isOpening = true;
        modalWindow.classList.add('auth--active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        document.addEventListener('keydown', handleEscapePress); // Закрытие по Escape
        setAuthMode('login');

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
    };

    // 6. переключение модалки по кнопке 
    btnSwitchModal.addEventListener('click', () => {
        const target = btnSwitchModal.getAttribute('data-target');
        setAuthMode(target)
    });

    // 7. Валидация формы
    function validateForm() {
        let isValidate = true;

        //Валидация email
        if (!inputEmail.value.includes('@')) {
            inputEmail.setCustomValidity('Введите корректный email');
            isValidate = false;
        } else {
            inputEmail.setCustomValidity('');
        };

        // Валидация паролей для регистрации
        if (currentMode === 'register') {
            if (inputPassword.value.length < 6) {
                inputPassword.setCustomValidity('Пароль не должен быть меньше 6 символов');
                isValidate = false;
            } else if (inputPassword.value !== inputConfirm.value) {
                inputConfirm.setCustomValidity('Пароли не совпадают');
                isValidate = false;
            } else {
                inputPassword.setCustomValidity('');
                inputConfirm.setCustomValidity('');
            }
        }

        inputEmail.reportValidity();
        if (currentMode === 'register') {
            inputPassword.reportValidity();
            inputConfirm.reportValidity();
        }

        return isValidate;
    };

    // 8. Валидация в реальном времени
    inputEmail.addEventListener('input', validateForm)
    inputPassword.addEventListener('input', validateForm);
    inputConfirm.addEventListener('input', validateForm);

    //9. Обработчик отправки формы 
    authForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return
        }

        const formData = {
            email: inputEmail.value.trim(),
            password: inputPassword.value.trim(),
            mode: currentMode,
        };

        if (currentMode === 'register') {
            formData.confirmPassword = inputConfirm.value.trim();
        }

        if (currentMode === 'login') {
            handleLogin(formData);
        } else {
            handleRegistration(formData);
        }
    });

    return openModal; //для использования в хедере
};

//Заглушки для входа и регистрации (пока только логируют данные)
function handleLogin(formData) {
    console.log('Запрос на вход:', formData);
    //позже будут fetch-запросы
};

function handleRegistration(formData) {
    console.log('Запрос на регистрацию:', formData);
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