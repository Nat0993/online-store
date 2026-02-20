/**
 * Инициализирует SPA-навигацию для всех внутренних ссылок
 */
export function initSPANavigation (): void {
    //вешаем обработчик на весь документ
    document.addEventListener('click', (e: MouseEvent) => {
        //находим ближайшую ссылку по которой кликнули
        const link = (e.target instanceof Element) 
            ? e.target.closest<HTMLAnchorElement>('a') 
            : null;

        //если это не ссылка - игнор
        if(!link) return;

        //если это внешняя ссылка - игнор
        if(isExternalLink(link)) return;

        e.preventDefault();

        const path = link.getAttribute('href');

        if (path) {
            goToPath(path);
        }
    })

    console.log('SPA навигация включена');
}

/**
 * Проверяет является ли ссылка внешней
 * @param link - элемент ссылки
 * @returns true если ссылка внешняя
 */
function isExternalLink(link: HTMLAnchorElement): boolean {
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
 * @param path - путь для перехода
 */
function goToPath(path: string): void {
    console.log('Переход на:', path);

    //смена url в адресной строке
    window.history.pushState({}, '', path);

    //сообщаем роутеру что URL изменился
    window.dispatchEvent(new PopStateEvent('popstate'));
}