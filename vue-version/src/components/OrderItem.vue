<template>
    <li class="order-item" :data-order-id="order.id">
        <!-- ============ ИНФОРМАЦИЯ О ЗАКАЗЕ ============ -->
        <div class="order-item__info">
            <!-- Шапка: номер и дата -->
            <div class="order-item__header">
                <span class="order-item__text order-item__text--bold">
                    Заказ #{{ order.orderNumber }}
                </span>
                <span class="order-item__text">
                    {{ formattedDate }}
                </span>
            </div>

            <!-- Краткая инф-ция: количество товаров и сумма -->
            <div class="order-item__summary">
                <div class="order-item__goods">
                    <span class="order-item__text order-item__text--bold">Товары:</span>
                    <span class="order-item__text">{{ itemsCount }} шт.</span>
                </div>
                <div class="order-item__summ">
                    <span class="order-item__text order-item__text--bold">Сумма:</span>
                    <span class="order-item__text">{{ formattedTotal }} ₽</span>
                </div>
            </div>
        </div>

        <!-- ============ КНОПКИ ДЕЙСТВИЙ ============ -->
        <div class="order-item__btn-inner">
            <!-- Кнопка "Подробнее" — открывает модалку с деталями заказа -->
            <button class="order-item__btn btn" type="button" @click="openDetails">
                Подробнее
            </button>

            <!-- 
        Кнопка "Повторить заказ" — добавляет все товары из заказа в корзину
        :disabled — блокирует кнопку во время добавления
        Текст меняется динамически: "Добавление..." или "Повторить заказ"
      -->
            <button class="order-item__btn btn" type="button" @click="repeatOrder" :disabled="isRepeating">
                {{ isRepeating ? 'Добавление...' : 'Повторить заказ' }}
            </button>
        </div>

        <!-- ============ МОДАЛКА ДЕТАЛЕЙ ЗАКАЗА ============ -->
        <OrderDetailsModal ref="detailsModalRef" />
    </li>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed } from 'vue'
import type { Order } from '../types'
import { addToCart } from '../data'
import OrderDetailsModal from './OrderDetailsModal.vue'
import { useRouter } from 'vue-router'

// ============ РОУТЕР ============
const router = useRouter() 

// ============ ПРОПСЫ ============
/** Данные заказа для отображения */
const props = defineProps<{
    order: Order
}>()

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
/** Модальное окно деталей заказа */
const detailsModalRef = ref<InstanceType<typeof OrderDetailsModal> | null>(null)

/** Флаг блокировки кнопки повтора заказа (защита от двойного нажатия) */
const isRepeating = ref(false)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Форматирует дату заказа для отображения */
const formattedDate = computed(() => {
    return new Date(props.order.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
})

/** Форматирует итоговую сумму заказа (с пробелами между разрядами) */
const formattedTotal = computed(() => props.order.total.toLocaleString())

/** Возвращает количество товаров в заказе */
const itemsCount = computed(() => props.order.items.length)

// ============ МЕТОДЫ ============

/**
 * Открывает модальное окно с деталями заказа
 * Использует ref, полученный из шаблона
 */
function openDetails() {
    detailsModalRef.value?.open(props.order)
}

/**
 * Повторяет заказ — добавляет все товары в корзину
 * (ассинхронность на будущее)
 */
async function repeatOrder() {
    // 1. Подтверждение
    if (!confirm('Добавить все товары из этого заказа в корзину?')) return

    // 2. Блокируем кнопку
    isRepeating.value = true

    try {
        // 3. Добавляем товары
        props.order.items.forEach(item => {
            addToCart(item.productId, item.quantity)
        })

        // 4. Сообщение об успехе
        alert(`Товары из заказа #${props.order.orderNumber} добавлены в корзину!`)

        // 5. Уведомляем другие компоненты (Header, CartPage, ProductCard)
        window.dispatchEvent(new CustomEvent('cart:update'))

        // 6. Предлагаем перейти в корзину
        if (confirm('Перейти в корзину?')) {
            router.push('/cart')
        }
    } catch (error) {
        // 7. Обработка ошибок
        console.error('Ошибка при повторении заказа:', error)
        alert('Не удалось добавить товары в корзину')
    } finally {
        // 8. Разблокируем кнопку (выполнится в любом случае)
        isRepeating.value = false
    }
}
</script>