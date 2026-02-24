// ============ ИМПОРТЫ ============
import { NavLink } from "../types/index";

// ============ ТИПЫ ============

interface SocialLink {
    href: string;
    icon: string;
    label: string;
}

// ============ КОНСТАНТЫ ============

/** Навигационные ссылки */
const NAV_LINKS: NavLink[] = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/delivery', label: 'Доставка и оплата' },
    { href: '/sales', label: 'Акции' },
    { href: '/reviews', label: 'Отзывы' },
    { href: '/contacts', label: 'Контакты' }
] as const;

/** Ссылки на социальные сети */
const SOCIAL_LINKS: SocialLink[] = [
    { href: '#', icon: 'vk', label: 'VK' },
    { href: '#', icon: 'tg', label: 'Telegram' },
    { href: '#', icon: 'whatsapp', label: 'WhatsApp' },
    { href: '#', icon: 'email', label: 'Почта' }
] as const;

/** Номер телефона компании (для отображения) */
const COMPANY_PHONE = '8 (800) 88 00 80 00';

/** Номер телефона компании (для ссылки tel:) */
const COMPANY_PHONE_CLEAN = '880088008000'; 

/** Название компании */
const COMPANY_NAME = '"FURNITURE"';

/** Текущий год */
const CURRENT_YEAR = new Date().getFullYear();


// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку футера
 * @returns {string} HTML-разметка футера
 */
function createFooter(): string {
    //Собираем навигацию из данных
    const navItemsHtml = NAV_LINKS.map(link => `
        <li class="footer__nav-item">
            <a class="footer__nav-link footer__text" href="${link.href}">${link.label}</a>
        </li>
        `).join('');
    
    // Собираем социальные иконки
    const socialItemsHtml = SOCIAL_LINKS.map(link => `
        <li class="social__item">
            <a class="social__link" href="${link.href}" aria-label="${link.label}">
                <svg width="30" height="30" aria-hidden="true">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-${link.icon}"></use>
                </svg>
            </a>
        </li>
        `).join('');
    
    
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer__wrapper">
                <div class="footer__info">
                    <div class="footer__left-col">
                        <ul class="footer__nav-list">${navItemsHtml}</ul>
                    </div>
                    <a class="footer__logo-link" href="/"
                        aria-label="Логотип компании, переход на главную страницу">
                        <svg width="70" height="70" aria-hidden="true">
                            <use xlink:href="/src/assets/images/sprite.svg#icon-logo"></use>
                        </svg>
                    </a>
                    <div class="footer__right-col">
                        <div class="footer__inner">
                            <span class="footer__text">Мы всегда на связи:</span>
                            <a class="footer__phone-link" href="tel:${COMPANY_PHONE_CLEAN}" aria-label="Звонок в компанию">
                                <svg width="20" height="20" aria-hidden="true">
                                    <use xlink:href="/src/assets/images/sprite.svg#icon-phone"></use>
                                </svg>
                                ${COMPANY_PHONE}
                            </a>
                        </div>
                        <div class="footer__inner">
                            <span class="footer__text">Мы в социальных сетях:</span>
                            <ul class="social">
                                ${socialItemsHtml}
                            </ul>
                        </div>
                    </div>
                </div>
                <span class="footer__copyright">&copy; ${CURRENT_YEAR} ${COMPANY_NAME}. Все права защищены</span>
            </div>
        </div>
    </footer>
    `
};

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит компонент футера
 * @returns {HTMLElement} DOM-элемент футера
 */
export function renderFooter(): HTMLElement {
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = createFooter();
    return footerContainer;
};