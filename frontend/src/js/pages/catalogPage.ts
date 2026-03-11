// ============ ИМПОРТЫ ============
import { renderBreadcrumbs } from '../components/breadcrumbs.js';
import { getCategoryById, getProductsByCategory } from "../data.js";
import { renderProductCard } from "../components/product-card.js";
import { renderEmptyMessage } from '../components/emptyMessage.js';
import type { Category, Product } from '../types/index.js';

// ============ ТИПЫ ============

/** Тип сортировки товаров */
type SortType = 'popular' | 'price-asc' | 'price-desc' | 'new';

/** Фильтры товаров */
interface ProductFilters {
    minPrice: number | null;
    maxPrice: number | null;
    inStock: boolean;
}

/** Состояние модального окна фильтров */
interface FiltersModalState {
    isDragging: boolean;
    startX: number;
    startY: number;
}

/** Элементы DOM страницы каталога */
interface CatalogPageElements {
    // Основные элементы
    productList: HTMLElement;
    sortSelect: HTMLSelectElement;
    
    // Элементы фильтрации
    filterBtn: HTMLButtonElement;
    filtersModal: HTMLElement;
    closeFilterBtn: HTMLButtonElement;
    applyFilterBtn: HTMLButtonElement;
    resetFilterBtn: HTMLButtonElement;
    minPriceInput: HTMLInputElement;
    maxPriceInput: HTMLInputElement;
    inStockCheckbox: HTMLInputElement;
    
    // Вспомогательные
    breadcrumbs?: HTMLElement;
    pageHeader?: HTMLElement;
    catalogControls?: HTMLElement;
}

// ============ ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ============

/**
 * Получает все необходимые элементы из DOM
 * @param {HTMLElement} container - контейнер страницы
 * @returns {CatalogPageElements | null} объект с элементами или null
 */
function getCatalogPageElements(container: HTMLElement): CatalogPageElements | null {
    const productList = container.querySelector<HTMLElement>('.product-list');
    const sortSelect = container.querySelector<HTMLSelectElement>('.catalog__sort-select');
    const filterBtn = container.querySelector<HTMLButtonElement>('.catalog__filter-btn');
    const filtersModal = container.querySelector<HTMLElement>('.filters-modal');
    const closeFilterBtn = container.querySelector<HTMLButtonElement>('.filters-modal__close');
    const applyFilterBtn = container.querySelector<HTMLButtonElement>('.filters-modal__apply');
    const resetFilterBtn = container.querySelector<HTMLButtonElement>('.filters-modal__reset');
    const minPriceInput = container.querySelector<HTMLInputElement>('#min-price');
    const maxPriceInput = container.querySelector<HTMLInputElement>('#max-price');
    const inStockCheckbox = container.querySelector<HTMLInputElement>('#in-stock');

    
    const breadcrumbs = container.querySelector<HTMLElement>('.breadcrumbs');
    const pageHeader = container.querySelector<HTMLElement>('.page-header');
    const catalogControls = container.querySelector<HTMLElement>('.catalog__controls');

    
    if (!productList || !sortSelect || !filterBtn || !filtersModal || !closeFilterBtn || 
        !applyFilterBtn || !resetFilterBtn || !minPriceInput || !maxPriceInput || !inStockCheckbox) {
        console.warn('[CatalogPage] Не все обязательные элементы найдены');
        return null;
    }

    return {
        productList,
        sortSelect,
        filterBtn,
        filtersModal,
        closeFilterBtn,
        applyFilterBtn,
        resetFilterBtn,
        minPriceInput,
        maxPriceInput,
        inStockCheckbox,
        breadcrumbs,
        pageHeader,
        catalogControls
    };
}


// ============ РАЗМЕТКА ============

/**
 * Создает HTML-разметку страницы каталога
 * @param {string} categoryId - ID категории товаров
 * @returns {string} HTML-разметка страницы
 */
function createCatalogPage(categoryId: string): string {
    const category = getCategoryById(categoryId);

    if (!category) {
        return `
            <section class="catalog">
                <div class="container">
                    <div class="catalog__error">
                        <h1>Категория не найдена</h1>
                        <p>Запрошенная категория товаров не существует</p>
                        <a href="/catalog" class="btn">Вернуться в каталог</a>
                    </div>
                </div>
            </section>
        `;
    }

    return `
    <section class="catalog">
            <div class="container">
                <!-- здесь встанет Breadcrumbs -->

                <div class="catalog__controls">
                    <div class="catalog__filters">
                        <button class="catalog__filter-btn">
                            <svg width="20" height="20" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-filter"></use>
                            </svg>
                            Фильтры
                        </button>
                        <div class="catalog__active-filters">
                        <!-- Здесь будут отображаться активные фильтры -->
                    </div>
                    </div>
                    
                    <div class="catalog__sort">
                        <select class="catalog__sort-select">
                            <option value="popular">По популярности</option>
                            <option value="price-asc">По цене (возрастание)</option>
                            <option value="price-desc">По цене (убывание)</option>
                            <option value="new">По новизне</option>
                        </select>
                    </div>
                </div>

                <!-- Модальное окно фильтров -->
            <div class="filters-modal">
                <div class="filters-modal__content">
                    <div class="filters-modal__header">
                        <h3 class="filters-modal__title">Фильтры</h3>
                        <button class="filters-modal__close" type="button" aria-label="Закрыть окно фильтрации">
                            <svg class="filters-modal__icon-close" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="filters-modal__body">
                        <div class="filters-modal__wrapper">
                            <!-- Фильтр по цене -->
                            <div class="filters-modal__group">
                                <h4 class="filters-modal__group-title">Цена, ₽</h4>
                                <div class="filters-modal__group-inner">
                                    <input type="number" class="filters-modal__input" id="min-price" placeholder="0" min="0">
                                    <span class="filters-modal__separator">-</span>
                                    <input type="number" class="filters-modal__input" id="max-price" placeholder="100000" min="0">
                                </div>
                            </div>
                            
                            <!-- Фильтр по наличию -->
                            <div class="filters-modal__group">
                                <h4 class="filters-modal__group-title">Наличие</h4>
                                <input class="filters-modal__checkbox-input" type="checkbox" id="in-stock" value="in-stock">
                                <label class="filters-modal__label" for="in-stock">
                                    <svg class="filters-modal__icon-check" aria-hidden="true">
                                    <use xlink:href="/src/assets/images/sprite.svg#icon-check"></use>
                                </svg>
                                    <span class="filters-modal__checkbox-text">В наличии</span>
                                </label>
                            </div>
                        </div>
                        <button class="filters-modal__reset">Сбросить фильтры</button>
                    </div>
                    
                    <div class="filters-modal__footer">
                        
                        <button class="filters-modal__apply btn">Применить</button>
                    </div>
                </div>
            </div>

                <ul class="product-list">
                <!-- здесь будут подгружаться карточки -->
                <li class="catalog__empty">Загрузка товаров...</li>
            </ul>
            </div>
        </section>
    `
}

// ============ ИНИЦИАЛИЗАЦИЯ ============

/**
 * Инициализирует логику страницы каталога
 * @param {HTMLElement} pageContainer - контейнер страницы
 * @param {string} categoryId - id категории товаров
 */
function initCatalogPage(pageContainer: HTMLElement, categoryId: string): void {
    console.log('Инициализация каталога для категории:', categoryId);

    const elements = getCatalogPageElements(pageContainer);
    if (!elements) {
        console.error('[CatalogPage] Не удалось получить элементы страницы');
        return;
    }

    const {
        productList,
        sortSelect,
        filterBtn,
        filtersModal,
        closeFilterBtn,
        applyFilterBtn,
        resetFilterBtn,
        minPriceInput,
        maxPriceInput,
        inStockCheckbox,
        breadcrumbs,
        pageHeader,
        catalogControls
    } = elements;

    // Состояние модалки фильтров
    const state: FiltersModalState = {
        isDragging: false,
        startX: 0,
        startY: 0
    };

    const products: Product[] = getProductsByCategory(categoryId);

    // Фильтры по умолчанию
    let currentFilters: ProductFilters = {
        minPrice: null,
        maxPrice: null,
        inStock: false
    };

    // Очищаем список
    productList.innerHTML = '';

    // Проверяем есть ли товары
    if (products.length === 0) {

        //Удаляем список
        productList.remove();

        //Удаляем заголовок, если есть
        if (pageHeader) {
            pageHeader.remove();
        };

        //Удаляем фильтры и сортировку
        if (catalogControls) {
            catalogControls.remove();
        };

        // Используем emptyMessage для пустой категории
        const emptyMessage = renderEmptyMessage('В данной категории пока нет товаров', 'Скоро мы добавим новые товары в эту категорию', { href: '/catalog', label: 'Вернуться в каталог' });
        
        if (breadcrumbs) {
            breadcrumbs.after(emptyMessage);
        }

        return;
    }

    // ============ ФУНКЦИИ ============

    /**
     * Открывает модальное окно фильтров
     */
    function openFiltersModal() {
        filtersModal.classList.add('filters-modal--active');

        document.body.classList.add('modal-open');
    }

    /**
     * Закрывает модальное окно фильтров
     */
    function closeFiltersModal() {
        filtersModal.classList.remove('filters-modal--active');

        document.body.classList.remove('modal-open');
        state.isDragging = false;
    }

    /**
     * Сортирует товары
     * @param {SortType} sortType - тип сортировки
     * @param {Product[]} productsToSort - массив товаров для сортировки
     * @returns {Product[]} отсортированный массив
     */
    function sortProducts(sortType: SortType, productsToSort: Product[] = products): Product[] {

        //Дублируем массив
        const sortedProducts = [...productsToSort];

        //Возвращаем новый массив после сортировки
        switch (sortType) {
            case 'price-asc':
                return sortedProducts.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sortedProducts.sort((a, b) => b.price - a.price);
            case 'new':
                // Пока сортируем по Id как по новизне
                return sortedProducts.sort((a, b) => b.id.localeCompare(a.id));
            case 'popular':
            default:
                // По умолчанию - как в исходном порядке
                return sortedProducts;
        }
    }

    /**
     * Фильтрует товары
     * @param {ProductFilters} filters - объект с фильтрами
     * @param {Product[]} productsToFilter - массив товаров для фильтрации
     * @returns {Product[]} отфильтрованный массив
     */
    function filterProducts(filters: ProductFilters, productsToFilter: Product[] = products): Product[] {
        return productsToFilter.filter(product => {
            //по цене
            if (filters.minPrice !== null && product.price < filters.minPrice) {
                return false;
            }

            if (filters.maxPrice !== null && product.price > filters.maxPrice) {
                return false;
            }

            //по наличию 
            if (filters.inStock && !product.inStock) {
                return false;
            }

            return true;
        })
    }

    /**
     * Применяет фильтрацию и сортировку
     */
    function applyFiltersAndSort(): void {
        let filteredProducts = filterProducts(currentFilters);
        const sortType = sortSelect.value as SortType;
        filteredProducts = sortProducts(sortType, filteredProducts)
        renderProducts(filteredProducts);

        closeFiltersModal();
    }

    /**
     * Сбрасывает фильтры
     */
    function resetFilters() {
        currentFilters = {
            minPrice: null,
            maxPrice: null,
            inStock: false
        }

        minPriceInput.value = '';
        maxPriceInput.value = '';
        inStockCheckbox.checked = false;

        let filteredProducts = filterProducts(currentFilters);
        const sortType = sortSelect.value as SortType;
        filteredProducts = sortProducts(sortType, filteredProducts);
        renderProducts(filteredProducts);
    }

    /**
     * Рендерит товары в список
     * @param {Product[]} productsToRender - массив товаров для отображения
     */
    function renderProducts(productsToRender: Product[]) {

        productList.innerHTML = '';

        productsToRender.forEach(product => {
            const listItem = document.createElement('li');
            listItem.className = 'product-list__item';

            const productCard = renderProductCard(product);
            listItem.appendChild(productCard);

            productList.appendChild(listItem);
        });
    }

    // ============ НАСТРОЙКА ОБРАБОТЧИКОВ ============

    //Открытие окна фильтрации по кнопке
    filterBtn.addEventListener('click', openFiltersModal);

    //Закрытие окна фильтрации по кнопке
    closeFilterBtn.addEventListener('click', closeFiltersModal);

    //Применение фильтров по кнопке
    applyFilterBtn.addEventListener('click', () => {
        //собираем данные с инпутов
        currentFilters.minPrice = minPriceInput.value.trim() ? parseInt(minPriceInput.value) : null;
        currentFilters.maxPrice = maxPriceInput.value.trim() ? parseInt(maxPriceInput.value) : null;
        currentFilters.inStock = inStockCheckbox.checked;

        applyFiltersAndSort();
    })

    //Сброс фильтров по кнопке
    resetFilterBtn.addEventListener('click', resetFilters);

    //Закрытие по клику вне модалки с защитой от выделения текста
    filtersModal.addEventListener('mousedown', (e: MouseEvent) => {
        state.isDragging = false;
        state.startX = e.clientX;
        state.startY = e.clientY;
    });

    filtersModal.addEventListener('mousemove', (e: MouseEvent): void => {
        if (Math.abs(e.clientX - state.startX) > 5 || Math.abs(e.clientY - state.startY) > 5) {
            state.isDragging = true; // пользователь выделяет текст
        }
    });

    filtersModal.addEventListener('click', (e: MouseEvent): void => {

        if (e.target === filtersModal && !state.isDragging) {
            closeFiltersModal(); // закрываем только если не было выделения
        }
    });


    //Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filtersModal.classList.contains('filters-modal--active')) {
            closeFiltersModal();
        }
    })

    // Обработчик изменения сортировки
    sortSelect.addEventListener('change', applyFiltersAndSort);

    // Первоначальный рендер
    renderProducts(products);
}

// ============ ПУБЛИЧНЫЙ API ============

/**
 * Рендерит страницу каталога товаров
 * @param {string} categoryId - ID категории для отображения
 * @returns {HTMLElement} DOM-элемент страницы каталога
 */
export function renderCatalogPage(categoryId: string): HTMLElement {
    if (!categoryId || typeof categoryId !== 'string') {
        console.error('Invalid categoryId provided to renderCatalogPage');
        categoryId = '';
    }

    const pageContainer = document.createElement('div');
    pageContainer.innerHTML = createCatalogPage(categoryId);

    const category = getCategoryById(categoryId);
    const container = pageContainer.querySelector<HTMLElement>('.container');

    if (category && container) {
        const breadcrumbs = renderBreadcrumbs([
            { url: '/', text: 'Главная' },
            { url: '/catalog', text: 'Категории' },
            { text: category.name }
        ]);
        container.prepend(breadcrumbs);
    }

    initCatalogPage(pageContainer, categoryId);

    return pageContainer;
}