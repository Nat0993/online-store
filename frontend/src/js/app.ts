// ============ ИМПОРТЫ ============
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderModal } from './components/modal.js';
import { renderHomePage } from './pages/homePage.js';
import { renderCategoriesPage } from './pages/categoriesPage.js';
import { initSPANavigation } from './utils/navigation.js';
import { renderCatalogPage } from './pages/catalogPage.js';
import { renderProfilePage } from './pages/profilePage.js';
import { renderFavoritesPage } from './pages/favoritesPage.js';
import { renderCartPage } from './pages/cartPage.js';
import { router } from './router.js';
import type { ModalReturn } from './components/modal.js';

// ============ ТИПЫ ============

/** Коллекция компонентов приложения */
interface AppComponents {
    header: HTMLElement;
    footer: HTMLElement;
    modal: ModalReturn;
}

/** Допустимые имена страниц */
type PageName = 'home' | 'profile' | 'categories' | 'catalog' | 'favorites' | 'cart';

// ============ КЛАСС APP ============

/**
 * Главный класс приложения, управляющий инициализацией и маршрутизацией
 */
class App {
    private components: AppComponents;
    private currentPage: PageName | null;

    constructor() {
        this.components = {} as AppComponents;
        this.currentPage = null;
    }

    /**
     * Инициализирует приложение (роутер, компоненты)
     * @returns {Promise<void>}
     */
    public init(): void {
        console.log('[App] Запуск приложения...');

        try {
            this.setupRouter();
            this.renderComponents();
            console.log('[App] Приложение запущено!');
        } catch (error) {
            console.error('[App] Ошибка при запуске:', error);
        }
    }

    /**
     * Настраивает маршрутизацию приложения
     */
    private setupRouter(): void {
        initSPANavigation()

        // Маршруты без параметров
        router.addRoute('/', () => this.renderPage('home'));
        router.addRoute('/profile', () => this.renderPage('profile'));
        router.addRoute('/catalog', () => this.renderPage('categories'));
        router.addRoute('/favorites', () => this.renderPage('favorites'));
        router.addRoute('/cart', () => this.renderPage('cart'));

        // Маршруты с параметрами (категории)
        const categories = ['chairs', 'tables', 'sofas', 'wardrobes', 'beds'] as const;
        categories.forEach(category => {
            router.addRoute(`/catalog/${category}`, () => this.renderPage('catalog', category));
        });

        router.init();
    }

    /**
     * Рендерит общие компоненты приложения (хедер, футер, модалка)
     */
    private renderComponents(): void {
        // Создаем модалку (нужна первой, так как хедер принимает её метод open)
        this.components.modal = renderModal();

        // Создаем хедер с функцией открытия модалки
        this.components.header = renderHeader(this.components.modal.open); //функция открытия модалки идет аргументом для кнопки войти при рендере хедера
        
        // Создаем футер
        this.components.footer = renderFooter();

        // Вставляем компоненты в DOM
        const headerComponent = document.querySelector('#header-component');
        const footerComponent = document.querySelector('#footer-component');
        const modalComponent = document.querySelector('#modal-component');

        if (!headerComponent || !footerComponent || !modalComponent) {
            console.error('[App] Не найдены контейнеры для компонентов');
            return;
        }

        headerComponent.appendChild(this.components.header);
        footerComponent.appendChild(this.components.footer);
        modalComponent.appendChild(this.components.modal.container);
    }

    /**
     * Рендерит страницу по её имени
     * @param {PageName} pageName - имя страницы
     * @param {string} [param] - дополнительный параметр (например, ID категории)
     */
    private renderPage(pageName: PageName, param?: string): void {
        const mainComponent = document.querySelector<HTMLElement>('#main-component');

        if (!mainComponent) {
            console.error('[App] Элемент #main-component не найден');
            return;
        }

        // Очищаем основную область
        mainComponent.innerHTML = '';

        // Рендерим запрошенную страницу
        const page = this.getPageComponent(pageName, param);

        if (page) {
            mainComponent.appendChild(page);
            this.currentPage = pageName;
            console.log(`[App] Рендер страницы: ${this.currentPage}${param ? ` (${param})` : ''}`);
        }
    }

    /**
     * Возвращает компонент страницы по имени
     * @param {PageName} pageName - имя страницы
     * @param {string} [param] - параметр страницы
     * @returns {HTMLElement | null} DOM-элемент страницы
     */
    private getPageComponent(pageName: PageName, param?: string): HTMLElement | null {
        switch (pageName) {
            case 'home':
                return renderHomePage();
            case 'profile':
                return renderProfilePage();
            case 'categories':
                return renderCategoriesPage();
            case 'catalog':
                if (!param) {
                    console.error('[App] Для страницы каталога требуется параметр categoryId');
                    return null;
                }
                return renderCatalogPage(param);
            case 'favorites':
                return renderFavoritesPage();
            case 'cart':
                return renderCartPage();
            default:
                console.warn('[App] Неизвестная страница:', pageName);
                return null;
        }
    }
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Запускает приложение после полной загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});