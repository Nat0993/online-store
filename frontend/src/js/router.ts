// ============ ИМПОРТЫ ============
// (нет внешних зависимостей)

/** Функция рендера страницы */
type RenderFunction = () => void;

/** Коллекция маршрутов (путь -> функция рендера) */
interface Routes {
    [key: string]: RenderFunction;
}

// ============ КЛАСС ROUTER ============

/**
 * Класс роутера для SPA-навигации
 * Управляет маршрутами и загрузкой соответствующих страниц
 */
class Router {
    private routes: Routes;
    
    constructor() {
        this.routes = {}; //объект для хранения маршрутов ('путь': функция)
        console.log('[Router] Роутер создан');
    }

    /**
     * Добавляет маршрут в роутер
     * @param {string} path - путь маршрута
     * @param {RenderFunction} renderFunction - функция рендера страницы
     */
    public addRoute(path: string, renderFunction: RenderFunction): void {
        if (typeof path !== 'string' || typeof renderFunction !== 'function') {
            console.error('[Router] Неверные параметры для addRoute:', { path, renderFunction });
            return;
        }

        this.routes[path] = renderFunction;
        console.log(`[Router] Добавлен маршрут ${path}`);
    }

    /**
     * Выполняет переход на указанный путь
     * @param {string} path - путь для перехода
     */
    public navigateTo(path: string): void {
        if (typeof path !== 'string') {
            console.error('[Router] Неверный путь для navigateTo:', path);
            return;
        }

        console.log(`[Router] Переходим на ${path}`);
        window.history.pushState({}, '', path);
        this.loadPage(path);
    }

    /**
     * Загружает страницу по указанному пути
     * @param {string} path - путь страницы
     */
    private loadPage(path: string): void {
        const normalizedPath = this.normalizePath(path);
        console.log('[Router] Загружаем страницу:', normalizedPath);
        
        const renderFunction = this.routes[normalizedPath] || this.routes['/404'];

        if (renderFunction) {
            renderFunction();
        } else {
            console.error('[Router] Маршрут не найден:', normalizedPath);
            this.show404();
        }
    }

    /**
     * Нормализует путь (убирает index.html и т.д.)
     * @param {string} path - исходный путь
     * @returns {string} нормализованный путь
     */
    private normalizePath(path: string): string {
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
    private show404(): void {
        const mainComponent = document.querySelector<HTMLElement>('#main-component');
        if (!mainComponent) {
            console.error('[Router] Элемент #main-component не найден');
            return;
        }
        
        mainComponent.innerHTML = `
            <div class="not-found">
                <div class="container">
                    <div class="not-found__content">
                        <h1 class="not-found__title">404</h1>
                        <p class="not-found__text">Страница не найдена</p>
                        <a href="/" class="not-found__btn btn">На главную</a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Инициализирует роутер
     * Обрабатывает кнопки браузера и загружает текущую страницу
     */
    public init(): void {
        console.log('[Router] Роутер запущен');

        // Обработка кнопок "назад/вперед"
        window.addEventListener('popstate', () => {
            console.log('[Router] Нажата кнопка назад/вперед');
            this.loadPage(window.location.pathname);
        })

        // Загрузка текущей страницы
        this.loadPage(window.location.pathname);
    }
}

// ============ ЭКСПОРТ ============

/** Единственный экземпляр роутера (синглтон) */
export const router = new Router();