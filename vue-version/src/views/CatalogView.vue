<template>
    <section class="catalog">
        <div class="container">
            <!-- ============ ХЛЕБНЫЕ КРОШКИ ============ -->
            <Breadcrumbs :links="breadcrumbLinks" />

            <!-- ============ ПАНЕЛЬ УПРАВЛЕНИЯ (ФИЛЬТР + СОРТИРОВКА) ============ -->
            <!-- Показываем только если есть хотя бы один товар в категории -->
            <div v-if="allProducts.length > 0" class="catalog__controls">
                <!-- Левая часть: фильтры -->
                <div class="catalog__filters">
                    <button class="catalog__filter-btn" @click="openFiltersModal">
                        <svg width="20" height="20" aria-hidden="true">
                            <use xlink:href="/src/assets/images/sprite.svg#icon-filter"></use>
                        </svg>
                        Фильтры
                    </button>
                </div>

                <!-- Правая часть: сортировка -->
                <div class="catalog__sort">
                    <select v-model="sortType" class="catalog__sort-select">
                        <option value="popular">По популярности</option>
                        <option value="price-asc">По цене (возрастание)</option>
                        <option value="price-desc">По цене (убывание)</option>
                        <option value="new">По новизне</option>
                    </select>
                </div>
            </div>

            <!-- ============ КОНТЕНТ В ЗАВИСИМОСТИ ОТ НАЛИЧИЯ ТОВАРОВ ============ -->

            <!-- СЛУЧАЙ 1: В КАТЕГОРИИ НЕТ ТОВАРОВ ВООБЩЕ -->
            <template v-if="allProducts.length === 0">
                <EmptyMessage title="В данной категории пока нет товаров"
                    description="Скоро мы добавим новые товары в эту категорию"
                    :link="{ href: '/catalog', label: 'Вернуться в каталог' }" />
            </template>

            <!-- СЛУЧАЙ 2: ТОВАРЫ ЕСТЬ, НО ПОСЛЕ ФИЛЬТРАЦИИ НИЧЕГО НЕ НАЙДЕНО -->
            <template v-else-if="allProducts.length > 0 && filteredAndSortedProducts.length === 0">
                <EmptyMessage title="Товары не найдены" description="Попробуйте изменить параметры фильтрации"
                    :link="{ href: `/catalog/${categoryId}`, label: 'Сбросить фильтры' }" @click="resetFilters" />
            </template>

            <!-- СЛУЧАЙ 3: ТОВАРЫ ЕСТЬ И ОТОБРАЖАЮТСЯ -->
            <ul v-else class="product-list">
                <li v-for="product in filteredAndSortedProducts" :key="product.id" class="product-list__item">
                    <ProductCard :product="product" />
                </li>
            </ul>
        </div>

        <!-- ============ МОДАЛЬНОЕ ОКНО ФИЛЬТРОВ ============ -->
        <!-- Показываем только если есть товары в категории -->
        <Teleport to="body">
            <div v-if="allProducts.length > 0 && isFiltersModalMounted" ref="modalRef" class="filters-modal"
                :class="{ 'filters-modal--active': isFiltersModalOpen }">
                <div ref="wrapperRef" class="filters-modal__content">
                    <!-- Шапка модалки -->
                    <div class="filters-modal__header">
                        <h3 class="filters-modal__title">Фильтры</h3>
                        <button class="filters-modal__close" @click="closeFiltersModal" type="button">
                            <svg class="filters-modal__icon-close" aria-hidden="true">
                                <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                            </svg>
                        </button>
                    </div>

                    <!-- Тело модалки -->
                    <div class="filters-modal__body">
                        <div class="filters-modal__wrapper">
                            <!-- Фильтр по цене -->
                            <div class="filters-modal__group">
                                <h4 class="filters-modal__group-title">Цена, ₽</h4>
                                <div class="filters-modal__group-inner">
                                    <input type="number" v-model.number="filters.minPrice" class="filters-modal__input"
                                        id="min-price" placeholder="0" min="0">
                                    <span class="filters-modal__separator">-</span>
                                    <input type="number" v-model.number="filters.maxPrice" class="filters-modal__input"
                                        id="max-price" placeholder="100000" min="0">
                                </div>
                            </div>

                            <!-- Фильтр по наличию -->
                            <div class="filters-modal__group">
                                <h4 class="filters-modal__group-title">Наличие</h4>
                                <input type="checkbox" v-model="filters.inStock" id="in-stock"
                                    class="filters-modal__checkbox-input">
                                <label class="filters-modal__label" for="in-stock">
                                    <svg class="filters-modal__icon-check" aria-hidden="true">
                                        <use xlink:href="/src/assets/images/sprite.svg#icon-check"></use>
                                    </svg>
                                    <span class="filters-modal__checkbox-text">В наличии</span>
                                </label>
                            </div>
                        </div>

                        <!-- Кнопка сброса фильтров -->
                        <button class="filters-modal__reset" @click="resetFilters">Сбросить фильтры</button>
                    </div>

                    <!-- Футер модалки с кнопкой применения -->
                    <div class="filters-modal__footer">
                        <button class="filters-modal__apply btn" @click="applyFilters">Применить</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyMessage from '@/components/EmptyMessage.vue'
import { getProductsByCategory, getCategoryById } from '@/data'
import { useModalDrag } from '@/composables/useModalDrag'
import type { Product, BreadcrumbLink } from '@/types'

// ============ ТИПЫ ============

/** Тип сортировки товаров */
type SortType = 'popular' | 'price-asc' | 'price-desc' | 'new'

/** Параметры фильтрации товаров */
interface Filters {
    minPrice: number | null
    maxPrice: number | null
    inStock: boolean
}

// ============ РОУТЕР ============
const route = useRoute()

/** ID категории из URL (параметр :categoryId) */
const categoryId = computed(() => route.params.categoryId as string)

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============

/** Все товары категории (без фильтрации и сортировки) */
const allProducts = ref<Product[]>([])

/** Текущий тип сортировки */
const sortType = ref<SortType>('popular')

/** Текущие фильтры */
const filters = ref<Filters>({
    minPrice: null,
    maxPrice: null,
    inStock: false
})

// ============ МОДАЛКА ФИЛЬТРОВ ============

/** Флаг монтирования модалки в DOM (для анимации) */
const isFiltersModalMounted = ref(false)

/** Флаг открытия модалки (класс --active) */
const isFiltersModalOpen = ref(false)

/** Ref на корневой элемент модалки (оверлей) */
const modalRef = ref<HTMLElement | null>(null)

/** Ref на внутренний контейнер модалки (для защиты от закрытия при выделении) */
const wrapperRef = ref<HTMLElement | null>(null)

/** Подключаем composable для защиты от закрытия при выделении текста */
useModalDrag(isFiltersModalOpen, modalRef, wrapperRef, closeFiltersModal)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Данные текущей категории */
const currentCategory = computed(() => getCategoryById(categoryId.value))

/** Хлебные крошки (как в оригинале) */
const breadcrumbLinks = computed<BreadcrumbLink[]>(() => {
    const links: BreadcrumbLink[] = [
        { url: '/', text: 'Главная' },
        { url: '/catalog', text: 'Категории' }
    ]

    if (currentCategory.value) {
        links.push({ text: currentCategory.value.name })
    }

    return links
})

/** Отфильтрованные товары (без сортировки) */
const filteredProducts = computed(() => {
    let result = [...allProducts.value]

    // Фильтр по минимальной цене
    if (filters.value.minPrice !== null) {
        result = result.filter(product => product.price >= filters.value.minPrice!)
    }

    // Фильтр по максимальной цене
    if (filters.value.maxPrice !== null) {
        result = result.filter(product => product.price <= filters.value.maxPrice!)
    }

    // Фильтр по наличию
    if (filters.value.inStock) {
        result = result.filter(product => product.inStock)
    }

    return result
})

/** Отфильтрованные + отсортированные товары */
const filteredAndSortedProducts = computed(() => {
    const filtered = [...filteredProducts.value]

    switch (sortType.value) {
        case 'price-asc':
            return filtered.sort((a, b) => a.price - b.price)
        case 'price-desc':
            return filtered.sort((a, b) => b.price - a.price)
        case 'new':
            // Сортируем по ID как по новизне (чем новее — тем больше ID)
            return filtered.sort((a, b) => b.id.localeCompare(a.id))
        case 'popular':
        default:
            // По популярности — оставляем как есть
            return filtered
    }
})

// ============ МЕТОДЫ УПРАВЛЕНИЯ МОДАЛКОЙ ============

/**
 * Открывает модальное окно фильтров
 */
function openFiltersModal(): void {
    // 1. Монтируем модалку в DOM
    isFiltersModalMounted.value = true

    // 2. Небольшая задержка для анимации
    setTimeout(() => {
        // 3. Добавляем класс --active, запускается анимация
        isFiltersModalOpen.value = true

        // 4. Блокируем скролл страницы
        document.body.classList.add('modal-open')
    }, 50)
}

/**
 * Закрывает модальное окно фильтров
 */
function closeFiltersModal(): void {
    // 1. Убираем класс --active, запускается анимация закрытия
    isFiltersModalOpen.value = false

    // 2. Ждем завершения анимации (300ms)
    setTimeout(() => {
        // 3. Удаляем модалку из DOM
        isFiltersModalMounted.value = false

        // 4. Возвращаем скролл странице
        document.body.classList.remove('modal-open')
    }, 300)
}

/**
 * Проверяет значения, Применяет фильтры и закрывает модалку
 */
function applyFilters(): void {
    //Проверяем на отрицательные значения
    if (filters.value.minPrice !== null && filters.value.minPrice < 0) {
        filters.value.minPrice = 0
    }
    if (filters.value.maxPrice !== null && filters.value.maxPrice < 0) {
        filters.value.maxPrice = 0
    }

    // Проверяем, что minPrice не больше maxPrice
    if (filters.value.minPrice !== null && filters.value.maxPrice !== null) {
        if (filters.value.minPrice > filters.value.maxPrice) {
            // Меняем местами
            const temp = filters.value.minPrice
            filters.value.minPrice = filters.value.maxPrice
            filters.value.maxPrice = temp
        }
    }
    closeFiltersModal()
}

/**
 * Сбрасывает все фильтры и закрывает модалку
 */
function resetFilters(): void {
    filters.value = {
        minPrice: null,
        maxPrice: null,
        inStock: false
    }
    closeFiltersModal()
}

// ============ ЗАГРУЗКА ДАННЫХ ============

/**
 * Загружает товары текущей категории
 */
function loadProducts(): void {
    allProducts.value = getProductsByCategory(categoryId.value)
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============

/** При монтировании компонента — загружаем товары */
onMounted(() => {
    loadProducts()
})

/** Следим за изменением категории в URL */
watch(categoryId, () => {
    // 1. Загружаем товары новой категории
    loadProducts()

    // 2. Сбрасываем фильтры
    resetFilters()

    // 3. Сбрасываем сортировку на "по популярности"
    sortType.value = 'popular'
})
</script>