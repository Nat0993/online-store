<template>
    <section class="favorites">
        <div class="container">
            <!-- Хлебные крошки -->
            <Breadcrumbs :links="breadcrumbLinks" />

            <!-- Заголовок страницы -->
            <PageHeader v-if="favorites.length !== 0"
                title="Избранные товары" 
                :description="headerDescription"
                :is-updating="isUpdating"
            />

            <!-- Сообщение о пустом избранном -->
            <template v-if="favorites.length === 0">
                <EmptyMessage
                    title="В Избранном пока нет товаров"
                    description="Выберите понравившиеся Вам товары"
                    :link="{ href: '/catalog', label: 'Перейти в каталог' }"
                />
            </template>

            <!-- Список товаров -->
            <ul v-else class="product-list">
                <li 
                    v-for="item in favorites" 
                    :key="item.id" 
                    class="product-list__item"
                    :class="{ 
                        'product-list__item--removing': removingItemId === item.product.id,
                        'product-list__item--sliding': slidingItems.includes(item.product.id)
                    }"
                >
                    <ProductCard 
                        :product="item.product" 
                        :is-favorite-removable="true"
                        @remove="() => removeFromFavorites(item.product.id)"
                    />
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyMessage from '@/components/EmptyMessage.vue'
import ProductCard from '@/components/ProductCard.vue'
import { getFavoritesWithProducts, toggleFavorite } from '@/data'
import type { FavoriteItem, Product } from '@/types'

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const favorites = ref<(FavoriteItem & { product: Product })[]>([])
const removingItemId = ref<string | null>(null)
const slidingItems = ref<string[]>([])
const isUpdating = ref(false)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Хлебные крошки */
const breadcrumbLinks = computed(() => [
    { url: '/', text: 'Главная' },
    { text: 'Избранное' }
])

/** Текст описания с правильным склонением */
const headerDescription = computed(() => {
    const count = favorites.value.length
    const word = getProductsWord(count)
    return `${count} ${word}, которые Вам понравились`
})

// ============ УТИЛИТЫ ============

/**
 * Склонение слова "товар" в зависимости от количества
 */
function getProductsWord(count: number): string {
    if (count % 10 === 1 && count % 100 !== 11) return 'товар'
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'товара'
    return 'товаров'
}

// ============ МЕТОДЫ ============

/** Загружает избранные товары */
function loadFavorites() {
    favorites.value = getFavoritesWithProducts() as (FavoriteItem & { product: Product })[]
}

/**
 * Обновляет заголовок с CSS-анимацией
 */
async function updateHeaderWithAnimation() {
    isUpdating.value = true
    await new Promise(resolve => setTimeout(resolve, 250))  // половина времени анимации
    isUpdating.value = false
}

/** Удаляет товар из избранного с анимацией */
function removeFromFavorites(productId: string) {
    // Находим индекс удаляемого товара
    const index = favorites.value.findIndex(fav => fav.product.id === productId)
    if (index === -1) return

    // Получаем товары после удаляемого
    const itemsAfter = favorites.value.slice(index + 1).map(fav => fav.product.id)
    
    // Устанавливаем анимацию
    removingItemId.value = productId
    slidingItems.value = itemsAfter

    // Ждём анимацию
    setTimeout(() => {
        // Удаляем из данных
        toggleFavorite(productId)
        
        // Уведомляем другие компоненты
        window.dispatchEvent(new CustomEvent('favorites:update'))

        // Сбрасываем анимацию
        removingItemId.value = null
        slidingItems.value = []
    }, 300)

    // Обновляем заголовок с анимацией
        updateHeaderWithAnimation()
}

/** Обработчик обновления избранного */
function handleFavoritesUpdate() {
    loadFavorites()
}

/** Обработчик смены пользователя */
function handleAuthChange() {
    setTimeout(() => {
        loadFavorites()
    }, 150)
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============

onMounted(() => {
    loadFavorites()
    window.addEventListener('favorites:update', handleFavoritesUpdate)
    window.addEventListener('auth:change', handleAuthChange)
})

onUnmounted(() => {
    window.removeEventListener('favorites:update', handleFavoritesUpdate)
    window.removeEventListener('auth:change', handleAuthChange)
})
</script>