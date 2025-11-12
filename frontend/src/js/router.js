class Router {
    constructor() {
        this.routes = {}; //объект для хранения маршрутов ('путь': функция)
        console.log('Роутер создан');
    }

    /**
     * Добавляет маршрут в роутер
     * @param {string} path - путь маршрута
     * @param {Function} renderFunction - функция рендера страницы
     */
    addRoute(path, renderFunction) {
        if (typeof path !== 'string' || typeof renderFunction !== 'function') {
            console.error('Неверные параметры для addRoute:', { path, renderFunction });
            return;
        }

        this.routes[path] = renderFunction;
        console.log(`Добавлен маршрут ${path}`);
    }

    /**
     * Выполняет переход на указанный путь
     * @param {string} path - путь для перехода
     */
    navigateTo(path) {
        if (typeof path !== 'string') {
            console.error('Неверный путь для navigateTo:', path);
            return;
        }

        console.log(`Переходим на ${path}`);
        window.history.pushState({}, '', path);
        this.loadPage(path);
    }

    /**
     * Загружает страницу по указанному пути
     * @param {string} path - путь страницы
     */
    loadPage(path) {
        const normalizedPath = this.normalizePath(path);
        console.log('Загружаем страницу:', normalizedPath);
        
        const renderFunction = this.routes[normalizedPath] || this.routes['/404'];

        if (renderFunction) {
            renderFunction();
        } else {
            console.error('Маршрут не найден:', normalizedPath);
            this.show404();
        }
    }

    /**
     * Нормализует путь (убирает index.html и т.д.)
     * @param {string} path - исходный путь
     * @returns {string} нормализованный путь
     */
    normalizePath(path) {
        if (!path || typeof path !== 'string') {
            return '/';
        }

        if (path.includes('index.html')) {
            return '/';
        }
        
        return path;
    }

    /**
    * Показывает страницу 404 (не найдено)
    */
    show404() {
        const mainComponent = document.querySelector('#main-component');
        if (!mainComponent) {
            console.error('Элемент #main-component не найден');
            return;
        }
        
        mainComponent.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h1>404</h1>
                <p>Страница не найдена</p>
                <a href="/" class="btn" style="width: 240px; margin: 0 auto;">
                    На главную
                </a>
            </div>
        `;
    }

    /**
    * Инициализирует роутер (обработка истории браузера, загрузка текущей страницы)
    */
    init() {
        console.log('Роутер запущен');

        // Обработка кнопок "назад/вперед"
        window.addEventListener('popstate', () => {
            console.log('Нажата кнопка назад/вперед');
            this.loadPage(window.location.pathname);
        })

        // Загрузка текущей страницы
        this.loadPage(window.location.pathname);
    }
}

export const router = new Router();