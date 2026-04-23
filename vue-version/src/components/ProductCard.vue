<template>
    <div class="product-card" :data-product-id="product.id">
        <!--Изображение товара-->
        <img class="product-card__image" :src="product.image || ''" :alt="product.name" loading="lazy">

        <!-- ============ КНОПКА ИЗБРАННОГО — для каталога ============ -->
        <button 
            v-if="!isFavoriteRemovable"
            class="product-card__favorite" 
            :class="{ 'product-card__favorite--active': isFavorite }"
            @click="toggleFavorite" 
            type="button"
            :aria-label="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
        >
            <!-- Обычная иконка (пустое сердечко) -->
            <svg class="product-card__favorite-icon" width="30" height="30" aria-hidden="true">
                <use :xlink:href="`${spriteUrl}#icon-favorite-card`"></use>
            </svg>
            <!-- Активная иконка (закрашенное сердечко) -->
            <svg class="product-card__favorite-icon product-card__favorite-icon--active" aria-hidden="true">
                <use :xlink:href="`${spriteUrl}#icon-favorite-card-active`"></use>
            </svg>
        </button>

        <!-- ============ КНОПКА УДАЛЕНИЯ — для страницы избранного ============ -->
        <button 
            v-else
            class="product-card__favorite product-card__favorite--remove"
            @click="emit('remove')" 
            type="button"
            aria-label="Удалить из избранного"
        >
            <svg class="product-card__favorite-icon product-card__favorite-icon--remove" width="20" height="20" aria-hidden="true">
                <use :xlink:href="`${spriteUrl}#icon-close`"></use>
            </svg>
        </button>

        <!--Название и цена-->
        <h3 class="product-card__title">{{ product.name }}</h3>
        <span class="product-card__price">{{ formattedPrice }} ₽</span>

        <!--Кнопка "В корзину" (показывается когда товара нет в корзине) -->
        <div v-if="quantity === 0" class="product-card__cart-controls">
            <button class="product-card__cart-btn btn" @click="addToCart">
                В корзину
            </button>
        </div>

        <!--Счётчик количества (показывается когда товар есть в корзине) -->
        <div v-else class="product-card__cart-controls product-card__cart-controls--active">
            <button class="product-card__quantity-btn product-card__quantity-btn--minus" @click="decreaseQuantity">
                -
            </button>
            <span class="product-card__quantity">{{ quantity }}</span>
            <button class="product-card__quantity-btn product-card__quantity-btn--plus" @click="increaseQuantity">
                +
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Product } from '../types'
import {
    getCurrentCart,
    getCurrentFavorites,
    addToCart as addToCartData,
    updateCartQuantity,
    toggleFavorite as toggleFavoriteData
} from '../data'

// ============ ПРОПСЫ ============
const props = defineProps<{
    product: Product
    isFavoriteRemovable?: boolean  // true = показываем крестик вместо сердечка
}>()

// ============ ЭМИТЫ ============
const emit = defineEmits<{
    (e: 'remove'): void   // говорим родителю, что нужно удалить
}>()


// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ (СОСТОЯНИЕ) ============

/** Количество товара в корзине (0 = товара нет в корзине) */
const quantity = ref(0)

/** Находится ли товар в избранном */
const isFavorite = ref(false)

/** Путь к спрайту с иконками (обычная переменная, не реактивная — не меняется) */
const spriteUrl = '/src/assets/images/sprite.svg'

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Отформатированная цена с пробелами */
const formattedPrice = computed(() => props.product.price.toLocaleString())

// ============ ФУНКЦИИ ОБНОВЛЕНИЯ СОСТОЯНИЯ ============
/** Обновляет количество товара в корзине */
function updateCartState() {
    const cart = getCurrentCart() // получаем корзину из data.ts
    const item = cart.find(item => item.productId === props.product.id) // ищем наш товар
    quantity.value = item?.quantity || 0 // обновляем реактивную переменную
}

/** Обновляет статус избранного */
function updateFavoriteState() {
    const favorites = getCurrentFavorites() // получаем избранное из data.ts
    isFavorite.value = favorites.some(fav => fav.productId === props.product.id) // обновляем
}

// ============ ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ (ОБРАБОТЧИКИ) ============
/** Добавление товара в корзину (кнопка "В корзину")*/
function addToCart() {
    addToCartData(props.product.id) // 1. Вызываем функцию из data.ts
    updateCartState()
    window.dispatchEvent(new CustomEvent('cart:update')) // 3. Уведомляем другие компоненты (хедер)
}

/** Увеличение количества товара (кнопка "+" в счётчике) */
function increaseQuantity() {
    addToCartData(props.product.id, 1)
    updateCartState()
    window.dispatchEvent(new CustomEvent('cart:update')) // 3. Уведомляем другие компоненты (хедер)
}

/** Уменьшение количества товара (кнопка "-" в счётчике) */
function decreaseQuantity() {
    const cart = getCurrentCart() // 1. Получаем корзину
    const item = cart.find(item => item.productId === props.product.id) // 2. Ищем наш товар

    if (item) {
        updateCartQuantity(item.id, item.quantity - 1) // 3. Уменьшаем количество в хранилище

        updateCartState() // 4. Обновляем локальное состояние

        window.dispatchEvent(new CustomEvent('cart:update')) // 5. Уведомляем другие компоненты
    }
}

/** Переключение избранного (добавить/удалить) */
function toggleFavorite() {
    toggleFavoriteData(props.product.id) // 1. Переключаем в хранилище
    updateFavoriteState() // 2. Обновляем локальное состояние
    window.dispatchEvent(new CustomEvent('favorites:update')) // 3. Уведомляем другие компоненты
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ КОМПОНЕНТА ============
// onMounted — выполняется когда компонент появляется на странице (смонтирован в DOM)
// onUnmounted — выполняется когда компонент удаляется со страницы
/** Обработчик обновления корзины (вызывается по событию cart:update) */
function handleCartUpdate() {
    updateCartState()
}

/** Обработчик обновления избранного (вызывается по событию favorites:update) */
function handleFavoritesUpdate() {
    updateFavoriteState()
}

/** Обработчик смены пользователя (вызывается по событию auth:change) */
function handleAuthChange() {
    updateCartState()
    updateFavoriteState()
}

// Монтирование — когда компонент появился на странице
onMounted(() => {
    // 1. Загружаем начальные данные
    updateCartState()
    updateFavoriteState()

    // 2. Подписываемся на глобальные события
    window.addEventListener('cart:update', handleCartUpdate)
    window.addEventListener('favorites:update', handleFavoritesUpdate)
    window.addEventListener('auth:change', handleAuthChange)
})

// Размонтирование — когда компонент удаляется со страницы
onUnmounted(() => {
    // Отписываемся от событий (важно для предотвращения утечек памяти)
    window.removeEventListener('cart:update', handleCartUpdate)
    window.removeEventListener('favorites:update', handleFavoritesUpdate)
    window.removeEventListener('auth:change', handleAuthChange)
})
</script>