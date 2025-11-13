import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderModal } from './components/modal.js';
import { renderHomePage } from './pages/homePage.js';
import { renderCategoriesPage } from './pages/categoriesPage.js';
import { initSPANavigation } from './utils/navigation.js';
import { renderCatalogPage } from './pages/catalogPage.js';
import { renderProfilePage } from './pages/profilePage.js';
import { renderFavoritesPage } from './pages/favoritesPage.js';
import { router } from './router.js';

/**
 * Главный класс приложения, управляющий инициализацией и маршрутизацией
 */
class App {
    constructor() {
        this.components = {};
        this.currentPage = null;
    }

    /**
     * Инициализирует приложение (роутер, компоненты)
     * @returns {Promise<void>}
     */
    async init() {
        console.log('Запуск приложения...');

        try {
            this.setupRouter();
            this.renderComponents();
            console.log('Приложение запущено!');
        } catch (error) {
            console.error('Ошибка при запуске:', error);
        }
    }

    /**
     * Настраивает маршрутизацию приложения
     */
    setupRouter() {
        initSPANavigation()
        router.addRoute('/', () => this.renderPage('home'));
        router.addRoute('/profile', () => this.renderPage('profile'));
        router.addRoute('/catalog', () => this.renderPage('categories'));
        router.addRoute('/catalog/chairs', () => this.renderPage('catalog', 'chairs'));
        router.addRoute('/catalog/tables', () => this.renderPage('catalog', 'tables'));
        router.addRoute('/catalog/sofas', () => this.renderPage('catalog', 'sofas'));
        router.addRoute('/catalog/wardrobes', () => this.renderPage('catalog', 'wardrobes'));
        router.addRoute('/catalog/beds', () => this.renderPage('catalog', 'beds'));
        router.addRoute('/favorites', () => this.renderPage('favorites'));
        //здесь будут маршруты страниц приложения

        router.init();
    }

    renderComponents() {
        //рендер компонентов
        this.components.modal = renderModal();
        this.components.header = renderHeader(this.components.modal.functions) //функция открытия модалки идет аргументом для кнопки войти при рендере хедера
        this.components.footer = renderFooter();

        document.querySelector('#header-component').appendChild(this.components.header);
        document.querySelector('#footer-component').appendChild(this.components.footer);
        document.querySelector('#modal-component').appendChild(this.components.modal.container);
    }

    /**
     * Рендерит страницу по её имени
     * @param {string} pageName - имя страницы
     * @param {string} [param] - дополнительный параметр (например, ID категории)
     */
    renderPage(pageName, param = null) {
        const mainComponent = document.querySelector('#main-component');

        if (!mainComponent) {
            console.error('Элемент #main-component не найден');
            return;
        }

        mainComponent.innerHTML = '';

        let page;

        switch (pageName) {
            case ('home'):
                page = renderHomePage();
                break;
            case ('profile'):
                page = renderProfilePage();
                break;
            case ('categories'):
                page = renderCategoriesPage();
                break;
            case ('catalog'):
                page = renderCatalogPage(param);
                break;
            case ('favorites'):
                page = renderFavoritesPage();
                break;
            //здесь будет рендеринг других страниц
            default:
                console.warn('Неизвестная страница:', pageName);
                return;
        }

        if (page) {
            mainComponent.appendChild(page);
            this.currentPage = pageName;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});