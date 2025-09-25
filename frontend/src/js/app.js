import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderModal } from './components/modal.js';
import { renderHomePage } from './pages/homePage.js';
import { router } from './router.js';

class App {
    constructor() {
        this.components = {};
        this.currentPage = null;
    }

    async init() {
        console.log('Запуск приложения...');

        try {
            this.setupRouter();
            this.renderComponents();
            console.log('Приложение запущено!');
        } catch(error) {
            console.error('Ошибка при запуске:', error);
        }
    }

    setupRouter () {
        router.addRoute('/', () => this.renderPage('home'));
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

    renderPage (pageName, param = null) {
        const mainComponent = document.querySelector('#main-component');
        mainComponent.innerHTML = '';

        let page;

        switch(pageName) {
            case ('home') :
                page = renderHomePage();
                break;

            //здесь будет рендеринг других страниц
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