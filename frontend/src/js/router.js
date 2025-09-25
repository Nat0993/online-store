class Router {
    constructor() {
        this.routes = {}; //объект для хранения маршрутов ('путь': функция)
        console.log('Роутер создан');
    }

    //метод добавления маршрута
    addRoute(path, renderFunction) {
        this.routes[path] = renderFunction;
        console.log(`Добавлен маршрут ${path}`);
    }

    //переход на страницу
    navigateTo(path) {
        console.log(`Переходим на ${path}`);
        window.history.pushState({}, '', path);
        this.loadPage(path);
    }

    // Загрузка страницы
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

    normalizePath(path) {
        if (path.includes('index.html')) {
            return '/';
        }
        
        
        return path;
    }

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
                <button onclick="router.navigateTo('/')">
                    На главную
                </button>
            </div>
        `;
    }

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