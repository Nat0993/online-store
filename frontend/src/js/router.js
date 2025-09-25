class Router {
    constructor() {
        this.routes = {}; //объект для хранения маршрутов ('путь': функция)
        this.currentPage = null;// хранит текущую страницу
        console.log('Роутер создан');
    }

    //метод добавления маршрута
    addRouter(path, renderFunction) {
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
        const renderFunction = this.routes[path] || this.routes['/404'];

        if (renderFunction) {
            renderFunction();
        } else {
            console.error('Маршрут не найден:', path);
            this.show404();
        }
    }

    show404() {
        const app = document.querySelector('#app');
        if(!app) {
            console.error('Элемент #app не найден');
            return;
        }
        app.innerHTML = `
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