/**
 * Инициализирует SPA-навигацию для всех внутренних ссылок
 * @returns {void}
 */
export function initSPANavigation () {
    //вешаем обработчик на весь документ
    document.addEventListener('click', (e) => {
        //находим ближайшую ссылку по которой кликнули
        const link = e.target.closest('a');

        //если это не ссылка - игнор
        if(!link) return;

        //если это внешняя ссылка - игнор
        if(isExternalLink(link)) return;

        e.preventDefault();

        const path = link.getAttribute('href');

        goToPath(path);
    })

    console.log('SPA навигация включена');
}

/**
 * Проверяет является ли ссылка внешней
 * @param {HTMLAnchorElement} link - элемент ссылки
 * @returns {boolean} true если ссылка внешняя
 */
function isExternalLink(link) {
    const href = link.href;

    //если ведет на др сайт
    if(href.includes('http') && !href.includes(window.location.origin)) {
        return true;
    }

    //если это почта или телефон
    if(href.includes('mailto:') || href.includes('tel:')) {
        return true;
    }

    //если открывается в новой вкладке
    if(link.target === '_blank') {
        return true;
    }

    //если для скачивания
    if(link.hasAttribute('download')) {
        return true;
    }

    return false;
}

/**
 * Выполняет переход по указанному пути в SPA-режиме
 * @param {string} path - путь для перехода
 * @returns {void}
 */
function goToPath(path) {
    console.log('Переход на:', path);

    //смена url в адресной строке
    window.history.pushState({}, '', path);

    //сообщаем роутеру что URL изменился
    window.dispatchEvent(new PopStateEvent('popstate'));
}