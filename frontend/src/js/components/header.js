import { renderModal } from './modal.js';

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
                                <a class="main-nav__link" href="#">Каталог</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="#">Доставка и оплата</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="#">Акции</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="#">Отзывы</a>
                            </li>
                            <li class="main-nav__item">
                                <a class="main-nav__link" href="#">Контакты</a>
                            </li>
                        </ul>
                    </div>
                    <span class="header__weather">Погода</span>
                </div>
                <a class="header__logo-link" href="index.html"
                    aria-label="Логотип компании, переход на главную страницу">
                    <svg width="70" height="70" aria-hidden="true">
                        <use xlink:href="../src/assets/images/sprite.svg#icon-logo"></use>
                    </svg>
                </a>
                <div class="header__user-inner">
                    <button class="header__login-btn" type="button">
                        <svg width="20" height="20" aria-hidden="true">
                            <use xlink:href="../src/assets/images/sprite.svg#icon-persone"></use>
                        </svg>
                        Войти
                    </button>
                    <div class="header__links">
                        <a class="header__user-link" href="#" aria-label="Избранные товары">
                            <svg width="30" height="30" aria-hidden="true">
                                <use xlink:href="../src/assets/images/sprite.svg#icon-favorite"></use>
                            </svg>
                        </a>
                        <a class="header__user-link" href="#" aria-label="Корзина">
                            <svg width="30" height="30" aria-hidden="true">
                                <use xlink:href="../src/assets/images/sprite.svg#icon-basket"></use>
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
    const btnBurger = headerContainer.querySelector('.burger');
    const nav = headerContainer.querySelector('.main-nav');

    //Обработчик клика на кнопку "Войти"
    btnLogin.addEventListener('click', () => {
        console.log('Клик по кнопке Войти!');
        openModalFunction();
    });

    //Обработчик бургера
    btnBurger.addEventListener('click', () => {
        btnBurger.classList.toggle('burger--active')
        nav.classList.toggle('main-nav--active');
    });

    document.addEventListener('click', (event) => {
        const target = event.target;

        if (!nav.contains(target) && !btnBurger.contains(target)) {
            nav.classList.remove('main-nav--active');
            btnBurger.classList.remove('burger--active');
        }
    });
};

export function renderHeader(openModalFunction) {
    const headerContainer = document.createElement('div');

    headerContainer.innerHTML = createHeader();
    initHeader(headerContainer, openModalFunction);

    return headerContainer;
}