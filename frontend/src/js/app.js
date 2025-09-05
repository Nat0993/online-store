import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderModal } from './components/modal.js';
import { renderIntro } from './components/intro.js';
import { renderPortfolio } from './components/portfolio.js';

class App {
    constructor() {
        this.components = {};
    }

    async init() {
        console.log('Запуск приложения...');

        try {
            this.renderComponents();
            console.log('Приложение запущено!');
        } catch(error) {
            console.error('Ошибка при запуске:', error);
        }
    }

    renderComponents() {
        //рендер компонентов
        this.components.modal = renderModal();
        this.components.header = renderHeader(this.components.modal.functions) //функция открытия модалки идет аргументом для кнопки войти при рендере хедера
        this.components.footer = renderFooter();

        document.querySelector('#header-component').appendChild(this.components.header);
        document.querySelector('#footer-component').appendChild(this.components.footer);
        document.querySelector('#modal-component').appendChild(this.components.modal.container);

        //контент главной страницы
        const mainComponent = document.querySelector('#main-component');
        mainComponent.appendChild(renderIntro());
        mainComponent.appendChild(renderPortfolio());
    }

    
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});