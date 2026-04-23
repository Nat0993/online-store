<template>
    <section class="cart">
        <div class="container">
            <!-- Хлебные крошки -->
            <Breadcrumbs :links="breadcrumbLinks" />

            <!-- Заголовок страницы -->
            <PageHeader v-if="cartItems.length !== 0"
                title="Корзина" 
                description="Товары, которые Вы выбрали"
            />

            <div class="cart__content">
                <!-- Сообщение о пустой корзине -->
                <template v-if="cartItems.length === 0">
                    <EmptyMessage
                        title="Корзина пуста"
                        description="Добавьте товары из каталога"
                        :link="{ href: '/catalog', label: 'Перейти в каталог' }"
                    />
                </template>

                <!-- Контент корзины -->
                <div v-else class="cart__main">
                    <!-- Список товаров -->
                    <ul class="cart__list">
                        <li 
                            v-for="item in cartItems" 
                            :key="item.id" 
                            class="cart__item"
                        >
                            <CartItem :item="item" />
                        </li>
                    </ul>

                    <!-- Боковая панель с итогами -->
                    <div class="cart__sidebar">
                        <div class="cart__total">
                            <h3 class="cart__total-title">Ваш заказ</h3>
                            <div class="cart__total-row">
                                <span class="cart__total-text">Товары:</span>
                                <span class="cart__total-price">{{ itemsTotal }} ₽</span>
                            </div>
                            <div class="cart__total-row">
                                <span class="cart__total-text">Доставка:</span>
                                <span class="cart__total-price">{{ deliveryText }}</span>
                            </div>
                            <div class="cart__total-row cart__total-row--final">
                                <span class="cart__total-text">Итого:</span>
                                <span class="cart__total-price cart__total-price--final">{{ totalPrice }} ₽</span>
                            </div>
                        </div>

                        <button 
                            class="cart__checkout-btn btn" 
                            type="button" 
                            :disabled="cartItems.length === 0"
                            @click="openCheckoutModal"
                        >
                            Оформить заказ
                        </button>

                        <button 
                            class="cart__clear-btn" 
                            type="button"
                            @click="handleClearCart"
                        >
                            Очистить корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модалка оформления заказа -->
        <CheckoutModal ref="checkoutModalRef" />
    </section>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyMessage from '@/components/EmptyMessage.vue'
import CartItem from '@/components/CartItem.vue'
import CheckoutModal from '@/components/CheckoutModal.vue'
import { getCartItemsWithProducts, saveCurrentCart } from '@/data'
import type { CartItemWithProduct } from '@/types'

// ============ КОНСТАНТЫ ============
const FREE_DELIVERY_THRESHOLD = 5000
const DELIVERY_COST = 500

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const cartItems = ref<CartItemWithProduct[]>([])
const checkoutModalRef = ref<InstanceType<typeof CheckoutModal> | null>(null)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Хлебные крошки */
const breadcrumbLinks = computed(() => [
    { url: '/', text: 'Главная' },
    { text: 'Корзина' }
])

/** Общая стоимость товаров */
const itemsTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
    }, 0)
})

/** Стоимость доставки (0 если сумма >= порога) */
const deliveryPrice = computed(() => {
    return itemsTotal.value > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST
})

/** Текст доставки для отображения */
const deliveryText = computed(() => {
    return deliveryPrice.value === 0 ? 'Бесплатно' : `${deliveryPrice.value.toLocaleString()} ₽`
})

/** Итоговая сумма */
const totalPrice = computed(() => {
    return itemsTotal.value + deliveryPrice.value
})

// ============ МЕТОДЫ ============

/** Загружает данные корзины */
function loadCart() {
    cartItems.value = getCartItemsWithProducts() as CartItemWithProduct[]
}

/** Очищает всю корзину */
function handleClearCart() {
    if (cartItems.value.length === 0) return
    
    if (confirm('Очистить всю корзину?')) {
        saveCurrentCart([])
        window.dispatchEvent(new CustomEvent('cart:update'))
    }
}

/** Открывает модалку оформления заказа */
function openCheckoutModal() {
    if (cartItems.value.length === 0) return
    checkoutModalRef.value?.open()
}

/** Обработчик обновления корзины */
function handleCartUpdate() {
    loadCart()
}

/** Обработчик смены пользователя */
function handleAuthChange() {
    // Перезагружаем корзину при смене пользователя
    setTimeout(() => {
        loadCart()
    }, 150)
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============

onMounted(() => {
    loadCart()
    window.addEventListener('cart:update', handleCartUpdate)
    window.addEventListener('auth:change', handleAuthChange)
})

onUnmounted(() => {
    window.removeEventListener('cart:update', handleCartUpdate)
    window.removeEventListener('auth:change', handleAuthChange)
})
</script>