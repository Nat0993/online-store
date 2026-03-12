// ============ ИМПОРТЫ ============
import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderPageHeader } from '../components/pageHeader.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { renderOrderItem } from '../components/orderItem.js';
import { renderProfileModal } from '../components/profileModal.js';
import { getCurrentUser, getCurrentOrders } from '../data.js';
import { escapeHtml } from '../utils/security.js';
import type { User, Order } from '../types/index.js';

// ============ ТИПЫ ============

/** Элементы DOM страницы профиля */
interface ProfilePageElements {
    // Основные контейнеры
    container: HTMLElement;
    profileContent: HTMLElement;
    breadcrumbs: HTMLElement;
    pageHeader: HTMLElement;

    // Элементы пользователя
    firstNameEl: HTMLElement;
    lastNameEl: HTMLElement;
    middleNameEl: HTMLElement;
    phoneEl: HTMLElement;
    emailEl: HTMLElement;
    editProfileBtn: HTMLButtonElement;

    // Элементы заказов
    ordersList: HTMLElement;
}

// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку страницы профиля
 * @returns {string} HTML-разметка страницы
 */
function createProfilePage(): string {
    return `
    <section class="profile">
        <div class="container">
            <!-- Breadcrumbs добавим через JS -->
            <!-- Заголовок добавим через JS -->

            <div class="profile__content">
                <!-- Левая колонка: данные пользователя -->
                <div class="profile__sidebar">
                    <div class="profile__card">
                        <div class="profile__card-header">
                            <h2 class="profile__card-title">Ваши данные</h2>
                            <button class="profile__edit-btn" type="button" aria-label="Редактировать профиль">
                                <svg width="20" height="20" aria-hidden="true">
                                    <use xlink:href="/src/assets/images/sprite.svg#icon-edit"></use>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="profile__info">
                            <div class="profile__info-group">
                                <span class="profile__info-label">Фамилия:</span>
                                <span class="profile__info-value" id="profile-last-name">Загрузка...</span>
                            </div>
                            <div class="profile__info-group">
                                <span class="profile__info-label">Имя:</span>
                                <span class="profile__info-value" id="profile-first-name">Загрузка...</span>
                            </div>
                            <div class="profile__info-group">
                                <span class="profile__info-label">Отчество:</span>
                                <span class="profile__info-value" id="profile-middle-name">—</span>
                            </div>
                            <div class="profile__info-group">
                                <span class="profile__info-label">Телефон:</span>
                                <span class="profile__info-value" id="profile-phone">—</span>
                            </div>
                            <div class="profile__info-group">
                                <span class="profile__info-label">Email:</span>
                                <span class="profile__info-value" id="profile-email">Загрузка...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Правая колонка: история заказов -->
                <div class="profile__main">
                    <div class="profile__orders">
                    <h2 class="profile__orders-title">История заказов</h2>
                        
                        <div class="profile__orders-content">
                            <ul class="profile__orders-list" id="orders-list">
                                <li class="profile__orders-loading">Загрузка заказов...</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
}

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param {HTMLElement} container - контейнер страницы
 * @returns {ProfilePageElements | null} объект с элементами или null
 */
function getProfilePageElements(container: HTMLElement): ProfilePageElements | null {
    const containerEl = container.querySelector<HTMLElement>('.profile');
    const profileContent = container.querySelector<HTMLElement>('.profile__content');
    const breadcrumbs = container.querySelector<HTMLElement>('.breadcrumbs');
    const pageHeader = container.querySelector<HTMLElement>('.page-header');

    // Элементы пользователя
    const firstNameEl = container.querySelector<HTMLElement>('#profile-first-name');
    const lastNameEl = container.querySelector<HTMLElement>('#profile-last-name');
    const middleNameEl = container.querySelector<HTMLElement>('#profile-middle-name');
    const phoneEl = container.querySelector<HTMLElement>('#profile-phone');
    const emailEl = container.querySelector<HTMLElement>('#profile-email');
    const editProfileBtn = container.querySelector<HTMLButtonElement>('.profile__edit-btn');

    // Элементы заказов
    const ordersList = container.querySelector<HTMLElement>('#orders-list');

    if (!containerEl || !profileContent || !breadcrumbs || !pageHeader ||
        !firstNameEl || !lastNameEl || !middleNameEl || !phoneEl || !emailEl ||
        !editProfileBtn || !ordersList) {
        console.warn('[ProfilePage] Не все элементы найдены');
        return null;
    }

    return {
        container: containerEl,
        profileContent,
        breadcrumbs,
        pageHeader,
        firstNameEl,
        lastNameEl,
        middleNameEl,
        phoneEl,
        emailEl,
        editProfileBtn,
        ordersList
    };
}

// ============ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ============

/**
 * Обновляет информацию о пользователе в интерфейсе
 * @param {ProfilePageElements} elements - элементы страницы
 */
function updateUserInfo(elements: ProfilePageElements): void {
    const user = getCurrentUser();
    if (!user) return;

    const { firstNameEl, lastNameEl, middleNameEl, phoneEl, emailEl } = elements;

    firstNameEl.textContent = escapeHtml(user.firstName || '—');
    lastNameEl.textContent = escapeHtml(user.lastName || '—');
    middleNameEl.textContent = escapeHtml(user.middleName || '—');
    phoneEl.textContent = escapeHtml(user.phone || '—');
    emailEl.textContent = escapeHtml(user.email || '—');
}

/**
 * Обновляет заголовок страницы профиля
 * @param {ProfilePageElements} elements - элементы страницы
 */
function updateProfileHeader(elements: ProfilePageElements): void {
    const user = getCurrentUser();
    const { pageHeader } = elements;

    const titleElement = pageHeader.querySelector('.page-header__title');
    const descriptionElement = pageHeader.querySelector('.page-header__description');
    if (!user) {
        // Если пользователь вышел
        if (titleElement) titleElement.textContent = 'Личный кабинет';
        if (descriptionElement) descriptionElement.textContent = 'Для просмотра требуется авторизация';

        return;
    }

    const userName = user.firstName || user.login || 'Пользователь';
    const description = `Добро пожаловать, ${escapeHtml(userName)}!`;

    if (titleElement) titleElement.textContent = 'Личный кабинет';
    if (descriptionElement) descriptionElement.textContent = description;
}

/**
 * Обновляет список заказов
 * @param {ProfilePageElements} elements - элементы страницы
 */
function updateOrdersList(elements: ProfilePageElements): void {
    const { ordersList } = elements;
    const orders = getCurrentOrders();

    ordersList.innerHTML = '';

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <li class="profile__orders-empty">
                <div class="profile__orders-empty-content">
                    <p class="profile__orders-empty-text">У вас еще нет заказов</p>
                    <a href="/catalog" class="profile__orders-empty-link btn">Перейти в каталог</a>
                </div>
            </li>
        `;
        return;
    }

    // Сортируем заказы по дате (новые сверху)
    const sortedOrders = [...orders].sort((a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Добавляем каждый заказ
    sortedOrders.forEach(order => {
        const orderElement = renderOrderItem(order);
        orderElement.classList.add('profile__orders-item');
        ordersList.appendChild(orderElement);
    });
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику страницы личного кабинета
 * @param {HTMLElement} pageContainer - DOM-элемент страницы
 */
function initProfilePage(pageContainer: HTMLElement): void {
    const elements = getProfilePageElements(pageContainer);
    
    if (!elements) {
        console.error('[ProfilePage] Не удалось получить элементы страницы');
        return;
    }

    const { breadcrumbs, pageHeader, profileContent, editProfileBtn } = elements;

    const user = getCurrentUser();


    // Если пользователь не авторизован - показываем сообщение
    if (!user) {
        pageHeader.remove();
        profileContent.remove();

        const emptyMessage = renderEmptyMessage(
            'Необходима авторизация',
            'Войдите в свой аккаунт, чтобы просматривать личный кабинет',
            { href: '/', label: 'На главную' }
        );

        breadcrumbs.after(emptyMessage);
        return;
    }

    // ===== ПЕРВОНАЧАЛЬНОЕ ОБНОВЛЕНИЕ UI =====
    updateUserInfo(elements);        
    updateProfileHeader(elements);   
    updateOrdersList(elements);      

    // Инициализируем модалку редактирования профиля
    const profileModal = renderProfileModal();

    // Добавляем в DOM только если ещё не добавлена
    if (!document.body.contains(profileModal.container)) {
        document.body.appendChild(profileModal.container);
    }

    // ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
    // Кнопка редактирования профиля
    editProfileBtn.addEventListener('click', () => {
        profileModal.open();
    });

    // ===== СЛУШАТЕЛИ СОБЫТИЙ =====
    // Обновляем данные при изменении пользователя
    window.addEventListener('auth:change', () => {
        // Если пользователь вышел - перезагружаем страницу
        if (!getCurrentUser() && window.location.pathname === '/profile') {
            window.history.pushState({}, '', '/profile');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            // Иначе просто обновляем UI
            updateUserInfo(elements);
            updateProfileHeader(elements);
            updateOrdersList(elements);
        }
    });

    // Обновляем заказы при их изменении 
    window.addEventListener('orders:update', () => updateOrdersList(elements));
}

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит страницу личного кабинета
 * @returns {HTMLElement} DOM-элемент страницы
 */
export function renderProfilePage(): HTMLElement {
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createProfilePage();

    // Добавляем breadcrumbs
    const container = pageContainer.querySelector<HTMLElement>('.container');

    if (!container) {
        console.error('[ProfilePage] Контейнер не найден');
        return pageContainer;
    }

    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { text: 'Личный кабинет' }
    ]);
    container.prepend(breadcrumbs);

    // Добавляем заголовок страницы
    const user = getCurrentUser();
    const userName = user ? (user.firstName || user.login || 'Пользователь') : 'Личный кабинет';
    const description = user ? `Добро пожаловать, ${escapeHtml(userName)}!` : 'Для просмотра требуется авторизация';
    const pageHeader = renderPageHeader('Личный кабинет', description);
    breadcrumbs.after(pageHeader);

    // Инициализируем логику
    initProfilePage(pageContainer);

    return pageContainer;
}