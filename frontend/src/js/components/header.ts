// ============ ИМПОРТЫ ============
import { getCurrentCart, getCurrentFavorites, getCurrentUser, logoutUser } from '../data.js';
import { escapeHtml } from '../utils/security.js';
import { NavLink, User } from "../types/index";

// ============ ТИПЫ ============

// Тип для функции открытия модалки
type OpenModalFunction = () => void;

/**
 * Интерфейс для DOM-элементов хедера
 */
interface HeaderElements {
    btnLogin: HTMLButtonElement;
    btnLogout: HTMLButtonElement;
    btnBurger: HTMLButtonElement;
    nav: HTMLElement;
    logoLink: HTMLAnchorElement;
    favoritesCounter: HTMLElement;
    cartCounter: HTMLElement;
}

// ============ КОНСТАНТЫ ============

/** Навигационные ссылки */
const NAV_LINKS: NavLink[] = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/delivery', label: 'Доставка и оплата' },
    { href: '/sales', label: 'Акции' },
    { href: '/reviews', label: 'Отзывы' },
    { href: '/contacts', label: 'Контакты' }
];

/** Максимальное значение счетчика (99+) */
const MAX_COUNTER = 99;

/** Максимальная длина имени пользователя */
const MAX_NAME_LENGTH = 15;

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку хедера
 */
function createHeader(): string {
    const navItemsHtml = NAV_LINKS.map(link => `
        <li class="main-nav__item">
            <a class="main-nav__link" href="${link.href}">${link.label}</a>
        </li>
        `).join('');

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
                            ${navItemsHtml}
                        </ul>
                    </div>
                    <span class="header__weather">Погода</span>
                </div>
                <a class="header__logo-link" href="/"
                    aria-label="Логотип компании, переход на главную страницу">
                    <svg width="70" height="70" aria-hidden="true">
                        <use xlink:href="/src/assets/images/sprite.svg#icon-logo"></use>
                    </svg>
                </a>
                <div class="header__user-inner">
                    <div class="header__btn-wrap">
                        <button class="header__btn header__login-btn" type="button">
                            <svg width="20" height="20" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-persone"></use>
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
                                <use xlink:href="/src/assets/images/sprite.svg#icon-favorite"></use>
                            </svg>
                            <span class="header__counter header__favorites-counter">0</span>
                        </a>
                        <a class="header__user-link" href="/cart" aria-label="Корзина">
                            <svg width="30" height="30" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-basket"></use>
                            </svg>
                            <span class="header__counter header__cart-counter">0</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    `
};

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param container - контейнер хедера
 * @returns объект с элементами или null
 */
function getHeaderElements(container: HTMLElement): HeaderElements | null {
    const btnLogin = container.querySelector<HTMLButtonElement>('.header__login-btn');
    const btnLogout = container.querySelector<HTMLButtonElement>('.header__logout-btn');
    const btnBurger = container.querySelector<HTMLButtonElement>('.burger');
    const nav = container.querySelector<HTMLElement>('.main-nav');
    const logoLink = container.querySelector<HTMLAnchorElement>('.header__logo-link');
    const favoritesCounter = container.querySelector<HTMLElement>('.header__favorites-counter');
    const cartCounter = container.querySelector<HTMLElement>('.header__cart-counter');

    if (!btnLogin || !btnLogout || !btnBurger || !nav || !logoLink || !favoritesCounter || !cartCounter) {
        console.warn('Не все элементы хедера найдены');
        return null;
    }

    return {
        btnLogin,
        btnLogout,
        btnBurger,
        nav,
        logoLink,
        favoritesCounter,
        cartCounter
    };
}

// ============ УТИЛИТЫ ============

/**
 * Форматирует имя пользователя для отображения
 * @param user - объект пользователя
 * @returns отформатированное имя
 */
function formatUserName(user: User): string {
    // Определяем, что показывать: firstName или login
    let displayName: string;

    if (user.firstName?.trim()) {
        displayName = user.firstName;
    } else if (user.login) {
        displayName = user.login;
    } else {
        displayName = 'Пользователь';
    }

    // Обрезаем слишком длинные имена
    if (displayName.length > MAX_NAME_LENGTH) {
        displayName = displayName.substring(0, MAX_NAME_LENGTH) + '...';
    }

    return escapeHtml(displayName);
}

/**
 * Обновляет счетчики корзины и избранного
 * @param elements - объект с элементами счетчиков
 */
function updateCounters(elements: Pick<HeaderElements, 'favoritesCounter' | 'cartCounter'>): void {
    const cartItems = getCurrentCart();
    const favorites = getCurrentFavorites();

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Обновляем счетчик корзины
    if (totalCartItems > 0) {
        elements.cartCounter.textContent = totalCartItems > MAX_COUNTER ? '99+' : totalCartItems.toString();
        elements.cartCounter.style.display = 'flex';
    } else {
        elements.cartCounter.style.display = 'none';
    }

    // Обновляем счетчик избранного
    if (favorites.length > 0) {
        elements.favoritesCounter.textContent = favorites.length > MAX_COUNTER ? '99+' : favorites.length.toString();
        elements.favoritesCounter.style.display = 'flex';
    } else {
        elements.favoritesCounter.style.display = 'none';
    }

    console.log('Счетчики обновлены:', { cart: totalCartItems, favorites: favorites.length });
}

/**
 * Обновляет интерфейс хедера в зависимости от состояния пользователя
 * @param elements - объект со всеми элементами хедера
 */
function updateHeaderUI(elements: HeaderElements): void {
    const currentUser = getCurrentUser();
    console.log('Обновление хедера, пользователь:', currentUser);

    if (currentUser) {
        const displayName = formatUserName(currentUser);

        elements.btnLogin.innerHTML = `
            <svg width="20" height="20" aria-hidden="true">
                <use xlink:href="/src/assets/images/sprite.svg#icon-persone"></use>
            </svg>
            <span class="user-name">${displayName}</span>
        `;
        elements.btnLogout.style.display = 'block';
    } else {
        elements.btnLogin.innerHTML = `
            <svg width="20" height="20" aria-hidden="true">
                <use xlink:href="/src/assets/images/sprite.svg#icon-persone"></use>
            </svg>
            <span>Войти</span>
        `;
        elements.btnLogout.style.display = 'none';
    }

    updateCounters(elements);
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику хедера
 * @param headerContainer - контейнер хедера
 * @param openModal - функция открытия модального окна
 */
function initHeader(headerContainer: HTMLElement, openModal: OpenModalFunction): void {
    const elements = getHeaderElements(headerContainer);
    if (!elements) return;

    const { btnLogin, btnLogout, btnBurger, nav, logoLink } = elements;

    // ===== ОБРАБОТЧИКИ НАВИГАЦИИ =====

    /** Обработчик клика на логотип */
    function handleLogoClick(event: MouseEvent): void {
        event.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    /** Обработчик клика на кнопку входа/профиля */
    function handleLoginClick(): void {
        const currentUser = getCurrentUser();

        if (currentUser) {
            window.history.pushState({}, '', '/profile');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            openModal();
        }
    }

    // ===== ОБРАБОТЧИКИ БУРГЕРА =====

    /** Обработчик клика на бургер */
    function handleBurgerClick(): void {
        btnBurger.classList.toggle('burger--active');
        nav.classList.toggle('main-nav--active');
    }

    /** Обработчик клика вне меню */
    function handleDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;

        if (!nav.contains(target) && !btnBurger.contains(target)) {
            nav.classList.remove('main-nav--active');
            btnBurger.classList.remove('burger--active');
        }
    }

    // ===== ОБРАБОТЧИК ВЫХОДА =====

    /** Обработчик выхода из аккаунта */
    function handleLogout(): void {
        logoutUser();
        if (elements) {
            updateHeaderUI(elements);
        }
        console.log('[Header] Пользователь вышел');

        window.dispatchEvent(new CustomEvent('auth:change', {
            detail: { user: null, type: 'logout' }
        }));
    }

    // ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
    logoLink.addEventListener('click', handleLogoClick);
    btnLogin.addEventListener('click', handleLoginClick);
    btnBurger.addEventListener('click', handleBurgerClick);
    btnLogout.addEventListener('click', handleLogout);

    document.addEventListener('click', handleDocumentClick);

    // ===== СЛУШАТЕЛИ СОБЫТИЙ =====
    window.addEventListener('auth:change', () => {
        console.log('[Header] Получено событие auth:change');
        updateHeaderUI(elements);
    });

    window.addEventListener('cart:update', () => {
        updateCounters(elements);
    });

    window.addEventListener('favorites:update', () => {
        updateCounters(elements);
    });

    // ===== ПЕРВОНАЧАЛЬНОЕ ОБНОВЛЕНИЕ =====
    updateHeaderUI(elements);
};

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит компонент хедера
 * @param openModal - функция открытия модального окна авторизации
 * @returns DOM-элемент хедера
 */
export function renderHeader(openModal: OpenModalFunction): HTMLElement {
    const headerContainer = document.createElement('div');

    headerContainer.innerHTML = createHeader();
    initHeader(headerContainer, openModal);

    return headerContainer;
}