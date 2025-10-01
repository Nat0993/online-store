import { renderModal } from './modal.js';
import { getCurrentUser, logoutUser } from '../data.js';

//Функция, которая рисует хедер
function createHeader() {
    return `
    <header class="header">
        <div class="container">
            <div class="header__wrapper">
                <div class="header__inner">
                    <button class="header__burger burger" type="button" aria-label="Открыть навигационное меню">
                        <span class="burger__line burger__line--top"></span>
                        <span class="burger__line burger__line--central"></span>
                        <span class="burger__line burger__line--bottom"></span>
                    </button>
                    <div class="main-nav">
                        <ul class="main-nav__list">
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="/catalog">Каталог</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="/delivery">Доставка и оплата</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="/sales">Акции</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="/reviews">Отзывы</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="/contacts">Контакты</a>
                            </li>
                        </ul>
                    </div>
                    <span class="header__weather">Погода</span>
                </div>
                <a class="header__logo-link" href="/"
                    aria-label="Логотип компании, переход на главную страницу">
                    <svg width="70" height="70" aria-hidden="true">
                        <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-logo"></use>
                    </svg>
                </a>
                <div class="header__user-inner">
                    <div class="header__btn-wrap">
                        <button class="header__btn header__login-btn" type="button">
                            <svg width="20" height="20" aria-hidden="true">
                                <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-persone"></use>
                            </svg>
                            Войти
                        </button>
                        <button class="header__btn header__logout-btn" type="button">
                            Выйти
                        </button>
                    </div>
                    <div class="header__links">
                        <a class="header__user-link" href="/favorites" aria-label="Избранные товары">
                            <svg width="30" height="30" aria-hidden="true">
                                <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-favorite"></use>
                            </svg>
                        </a>
                        <a class="header__user-link" href="/cart" aria-label="Корзина">
                            <svg width="30" height="30" aria-hidden="true">
                                <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-basket"></use>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    `
};

//Функция логики хедера
function initHeader(headerContainer, openModalFunction) {
    const btnLogin = headerContainer.querySelector('.header__login-btn');
    const btnLogout = headerContainer.querySelector('.header__logout-btn');
    const btnBurger = headerContainer.querySelector('.burger');
    const nav = headerContainer.querySelector('.main-nav');
    const logoLink = headerContainer.querySelector('.header__logo-link');
    const navLinks = headerContainer.querySelectorAll('.main-nav__link');
    const userLinks = headerContainer.querySelectorAll('.header__user-link');

    //Обработчк клика на логотип
    logoLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    })

    //Обработчик всех ссылок хедера
    const allLinks = headerContainer.querySelectorAll('a');
    allLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            if (link === logoLink || link.href.includes('http')) {
                return;
            }

            event.preventDefault();
            const path = link.getAttribute('href');

            console.log('Навигация по:', path);

            nav.classList.remove('main-nav--active');
            btnBurger.classList.remove('burger--active');

            window.history.pushState({}, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
        })
    });

    //Функция для обработки клика на кнопку войти/личного кабинета (смена функционала)
    function handleLoginClick() {
        const currentUser = getCurrentUser();

        if (currentUser) {
            window.history.pushState({}, '', '/profile');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            openModalFunction();
        }
    }

    //Обработчик клика на кнопку "Войти"
    btnLogin.addEventListener('click', handleLoginClick);

    //Обработчик бургера
    btnBurger.addEventListener('click', () => {
        btnBurger.classList.toggle('burger--active');
        nav.classList.toggle('main-nav--active');
    });

    document.addEventListener('click', (event) => {
        const target = event.target;

        if (!nav.contains(target) && !btnBurger.contains(target)) {
            nav.classList.remove('main-nav--active');
            btnBurger.classList.remove('burger--active');
        }
    });

    //Обновление интерфейса хедера при авторизации
    function updateHeader() {
        const currentUser = getCurrentUser();

        if (currentUser) {
            btnLogin.innerHTML = `<svg width="20" height="20" aria-hidden="true">
                                <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-persone"></use>
                            </svg>
                            ${currentUser.name}`;
            btnLogout.style.display = 'block';
        } else {
            btnLogin.innerHTML = `<svg width="20" height="20" aria-hidden="true">
                                <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-persone"></use>
                            </svg>
                            Войти`;
            btnLogout.style.display = 'none';
        }
    }

    btnLogout.addEventListener('click', () => {
        logoutUser();
        updateHeader();
        console.log('Пользователь вышел');
    });

    updateHeader();
};

export function renderHeader(openModalFunction) {
    const headerContainer = document.createElement('div');

    headerContainer.innerHTML = createHeader();
    initHeader(headerContainer, openModalFunction);

    return headerContainer;
}