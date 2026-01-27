import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { renderPageHeader } from '../components/pageHeader.js';
import { renderEmptyMessage } from '../components/emptyMessage.js';
import { renderOrderItem } from '../components/orderItem.js';
import { renderProfileModal } from '../components/profileModal.js';
import { getCurrentUser, getCurrentOrders } from '../data.js';
import { escapeHtml } from '../utils/security.js';

/**
 * Создает HTML-разметку страницы профиля
 * @returns {string} HTML-разметка страницы
 */
function createProfilePage() {
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

/**
 * Обновляет информацию о пользователе в интерфейсе
 *  @param {HTMLElement} container - DOM-элемент
 */
function updateUserInfo(container) {
    const user = getCurrentUser();
    if (!user) return;

    const firstNameEl = container.querySelector('#profile-first-name');
    const lastNameEl = container.querySelector('#profile-last-name');
    const middleNameEl = container.querySelector('#profile-middle-name');
    const phoneEl = container.querySelector('#profile-phone');
    const emailEl = container.querySelector('#profile-email');

    if (firstNameEl) firstNameEl.textContent = escapeHtml(user.firstName || '—');
    if (lastNameEl) lastNameEl.textContent = escapeHtml(user.lastName || '—');
    if (middleNameEl) middleNameEl.textContent = escapeHtml(user.middleName || '—');
    if (phoneEl) phoneEl.textContent = escapeHtml(user.phone || '—');
    if (emailEl) emailEl.textContent = escapeHtml(user.email || '—');
}

/**
 * Обновляет заголовок страницы профиля
 * @param {HTMLElement} container - DOM-элемент страницы
 */
function updateProfileHeader(container) {
    const user = getCurrentUser();
    
    if (!user) {
        // Если пользователь вышел
        const pageHeader = container.querySelector('.page-header');
        if (pageHeader) {
            const titleElement = pageHeader.querySelector('.page-header__title');
            const descriptionElement = pageHeader.querySelector('.page-header__description');
            
            if (titleElement) titleElement.textContent = 'Личный кабинет';
            if (descriptionElement) descriptionElement.textContent = 'Для просмотра требуется авторизация';
        }
        return;
    }
    
    const userName = user.firstName || user.login || 'Пользователь';
    const description = `Добро пожаловать, ${escapeHtml(userName)}!`;
    
    const pageHeader = container.querySelector('.page-header');
    if (pageHeader) {
        const titleElement = pageHeader.querySelector('.page-header__title');
        const descriptionElement = pageHeader.querySelector('.page-header__description');
        
        if (titleElement) titleElement.textContent = 'Личный кабинет';
        if (descriptionElement) descriptionElement.textContent = description;
    }
}

/**
 * Обновляет список заказов
 *  @param {HTMLElement} container - DOM-элемент
 */
function updateOrdersList(container) {
    const ordersList = container.querySelector('#orders-list');
    const orders = getCurrentOrders();

    if (!ordersList) return;

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
    const sortedOrders = [...orders].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Добавляем каждый заказ
    sortedOrders.forEach(order => {
        const orderElement = renderOrderItem(order);
        orderElement.classList.add('profile__orders-item');
        ordersList.appendChild(orderElement);
    });
}

/**
 * Инициализирует логику страницы личного кабинета
 * @param {HTMLElement} pageContainer - DOM-элемент страницы
 */
function initProfilePage(pageContainer) {
    const user = getCurrentUser();


    // Если пользователь не авторизован - показываем сообщение
    if (!user) {
        const emptyMessage = renderEmptyMessage(
            'Необходима авторизация',
            'Войдите в свой аккаунт, чтобы просматривать личный кабинет',
            { url: '/', text: 'На главную' }
        );

        const pageHeader = pageContainer.querySelector('.page-header');
        if (pageHeader) pageHeader.remove();

        const profileContent = pageContainer.querySelector('.profile__content');
        if (profileContent) profileContent.remove();

        const breadcrumbs = pageContainer.querySelector('.breadcrumbs');
        breadcrumbs.after(emptyMessage);

        return;
    }

    // Инициализируем модалку редактирования профиля
    const profileModal = renderProfileModal();

    // Добавляем в DOM только если ещё не добавлена
    if (!document.body.contains(profileModal.container)) {
        document.body.appendChild(profileModal.container);
    }

    // Кнопка редактирования профиля
    const editProfileBtn = pageContainer.querySelector('.profile__edit-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            profileModal.open();
        });
    }

    // Обновляем данные при изменении пользователя
    window.addEventListener('auth:change', () => {
        // Если пользователь вышел - перезагружаем страницу
        if (!getCurrentUser() && window.location.pathname === '/profile') {
            window.history.pushState({}, '', '/profile');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            // Иначе просто обновляем UI
            updateUserInfo(pageContainer);
            updateProfileHeader(pageContainer);
            updateOrdersList(pageContainer);
        }
    });

    // Обновляем заказы при их изменении 
    window.addEventListener('orders:update', () => updateOrdersList(pageContainer));
}

/**
 * Рендерит страницу личного кабинета
 * @returns {HTMLElement} DOM-элемент страницы
 */
export function renderProfilePage() {
    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createProfilePage();

    // Добавляем breadcrumbs
    const container = pageContainer.querySelector('.container');
    const breadcrumbs = renderBreadcrumbs([
        { url: '/', text: 'Главная' },
        { text: 'Личный кабинет' }
    ]);
    container.prepend(breadcrumbs);

    // Добавляем заголовок страницы
    const user = getCurrentUser();
    const userName = user ? (user.firstName || user.login || 'Пользователь') : 'Личный кабинет';
    const pageHeader = renderPageHeader('Личный кабинет', `Добро пожаловать, ${escapeHtml(userName)}!`);
    breadcrumbs.after(pageHeader);

    // Обновляем данные пользователя
    updateUserInfo(pageContainer);

    // Обновляем список заказов
    updateOrdersList(pageContainer);

    // Инициализируем логику
    initProfilePage(pageContainer);

    return pageContainer;
}