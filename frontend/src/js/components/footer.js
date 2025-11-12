/**
 * Создает HTML-разметку футера
 * @returns {string} HTML-разметка футера
 */
function createFooter () {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer__wrapper">
                <div class="footer__info">
                    <div class="footer__left-col">
                        <ul class="footer__nav-list">
                            <li class="footer__nav-item">
                                <a class="footer__nav-link footer__text" href="/catalog">Каталог</a>
                            </li>
                            <li class="footer__nav-item">
                                <a class="footer__nav-link footer__text" href="/delivery">Доставка и оплата</a>
                            </li>
                            <li class="footer__nav-item">
                                <a class="footer__nav-link footer__text" href="/sales">Акции</a>
                            </li>
                            <li class="footer__nav-item">
                                <a class="footer__nav-link footer__text" href="/reviews">Отзывы</a>
                            </li>
                            <li class="footer__nav-item">
                                <a class="footer__nav-link footer__text" href="/contacts">Контакты</a>
                            </li>
                        </ul>
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
                            <a class="footer__phone-link" href="tel:880088008000" aria-label="Звонок в компанию">
                                <svg width="20" height="20" aria-hidden="true">
                                    <use xlink:href="/src/assets/images/sprite.svg#icon-phone"></use>
                                </svg>
                                8 (800) 88 00 80 00
                            </a>
                        </div>
                        <div class="footer__inner">
                            <span class="footer__text">Мы в социальных сетях:</span>
                            <ul class="social">
                                <li class="social__item">
                                    <a class="social__link" href="#" aria-label="Перейти в VK">
                                        <svg width="30" height="30" aria-hidden="true">
                                            <use xlink:href="/src/assets/images/sprite.svg#icon-vk"></use>
                                        </svg>
                                    </a>
                                </li>
                                <li class="social__item">
                                    <a class="social__link" href="#" aria-label="Перейти в Telegram">
                                        <svg width="30" height="30" aria-hidden="true">
                                            <use xlink:href="/src/assets/images/sprite.svg#icon-tg"></use>
                                        </svg>
                                    </a>
                                </li>
                                <li class="social__item">
                                    <a class="social__link" href="#" aria-label="Перейти в WhatsApp">
                                        <svg width="30" height="30" aria-hidden="true">
                                            <use xlink:href="/src/assets/images/sprite.svg#icon-whatsapp"></use>
                                        </svg>
                                    </a>
                                </li>
                                <li class="social__item">
                                    <a class="social__link" href="#" aria-label="Перейти в Почту">
                                        <svg width="30" height="30" aria-hidden="true">
                                            <use xlink:href="/src/assets/images/sprite.svg#icon-email"></use>
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <span class="footer__copyright">&copy; 2025 Ваша компания. Все права защищены</span>
            </div>
        </div>
    </footer>
    `
};

/**
 * Рендерит компонент футера
 * @returns {HTMLElement} DOM-элемент футера
 */
export function renderFooter () {
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = createFooter();
    return footerContainer;
};