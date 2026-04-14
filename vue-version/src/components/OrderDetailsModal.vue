<template>
    <Teleport to="body">
        <div v-if="isMounted" class="order-details-modal" :class="{ 'order-details-modal--active': isOpen }"
            @click.self="close">
            <div class="order-details-modal__wrapper">
                <!-- Кнопка закрытия -->
                <button class="order-details-modal__close" @click="close" type="button">
                    <svg width="20" height="20" aria-hidden="true">
                        <use :xlink:href="`${spriteUrl}#icon-close`"></use>
                    </svg>
                </button>

                <!-- ============ ШАПКА: НОМЕР И ДАТА ============ -->
                <div class="order-details-modal__header">
                    <h2 class="order-details-modal__title">
                        Заказ #{{ order?.orderNumber || '------' }}
                    </h2>
                    <span class="order-details-modal__date">
                        {{ formattedDate }}
                    </span>
                </div>

                <!-- ============ ОСНОВНОЙ КОНТЕНТ ============ -->
                <div class="order-details-modal__content">
                    <!-- Секция: Детали заказа -->
                    <div class="order-details-modal__info-section">
                        <h3 class="order-details-modal__section-title">Детали заказа:</h3>

                        <div class="order-details-modal__info-grid">
                            <!-- Блок: Клиент -->
                            <div class="order-details-modal__info-group">
                                <h4 class="order-details-modal__info-title">Клиент</h4>
                                <p class="order-details-modal__info-text">{{ customerFullName }}</p>
                                <p class="order-details-modal__info-text">{{ order?.customer?.phone || '—' }}</p>
                                <p class="order-details-modal__info-text">{{ order?.customer?.email || '—' }}</p>
                            </div>

                            <!-- Блок: Доставка -->
                            <div class="order-details-modal__info-group">
                                <h4 class="order-details-modal__info-title">Доставка</h4>
                                <p class="order-details-modal__info-text">{{ order?.customer?.address || '—' }}</p>
                                <p v-if="order?.customer?.comment" class="order-details-modal__comment">
                                    <strong>Комментарий:</strong>
                                    <span>{{ order.customer.comment }}</span>
                                </p>
                            </div>

                            <!-- Блок: Оплата -->
                            <div class="order-details-modal__info-group">
                                <h4 class="order-details-modal__info-title">Оплата</h4>
                                <p class="order-details-modal__info-text">{{ paymentMethodText }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- ============ СЕКЦИЯ: ТОВАРЫ В ЗАКАЗЕ ============ -->
                    <div class="order-details-modal__items-section">
                        <h3 class="order-details-modal__section-title">
                            Товары в заказе
                            <span class="order-details-modal__items-count">
                                ({{ order?.items?.length || 0 }}):
                            </span>
                        </h3>

                        <ul class="order-details-modal__items-list">
                            <li v-for="item in order?.items" :key="item.productId" class="order-details-modal__item">
                                <img class="order-details-modal__item-image" :src="item.image || ''"
                                    :alt="item.productName" loading="lazy">
                                <div class="order-details-modal__item-info">
                                    <h4 class="order-details-modal__item-title">{{ item.productName }}</h4>
                                    <div class="order-details-modal__item-details">
                                        <span class="order-details-modal__item-price">
                                            {{ item.price.toLocaleString() }} ₽
                                        </span>
                                        <span class="order-details-modal__item-quantity">
                                            × {{ item.quantity }}
                                        </span>
                                        <span class="order-details-modal__item-total">
                                            {{ (item.price * item.quantity).toLocaleString() }} ₽
                                        </span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <!-- ============ СЕКЦИЯ: ИТОГОВАЯ СУММА ============ -->
                    <div class="order-details-modal__total-section">
                        <div class="order-details-modal__total-row">
                            <span>Товары:</span>
                            <span>{{ order?.subtotal?.toLocaleString() || 0 }} ₽</span>
                        </div>
                        <div class="order-details-modal__total-row">
                            <span>Доставка:</span>
                            <span>
                                {{ order?.delivery === 0 ? 'Бесплатно' : `${order?.delivery?.toLocaleString() || 0} ₽`
                                }}
                            </span>
                        </div>
                        <div class="order-details-modal__total-row order-details-modal__total-row--final">
                            <span>Итого к оплате:</span>
                            <span class="order-details-modal__total-amount">
                                {{ order?.total?.toLocaleString() || 0 }} ₽
                            </span>
                        </div>
                    </div>

                    <!-- ============ КНОПКА ПОВТОРА ЗАКАЗА ============ -->
                    <button type="button" class="order-details-modal__repeat-btn btn" @click="repeatOrder">
                        Повторить заказ
                        <svg width="20" height="20" aria-hidden="true">
                            <use :xlink:href="`${spriteUrl}#icon-basket`"></use>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed } from 'vue'
import type { Order, PaymentMethod } from '../types'
import { addToCart } from '@/data'
import { useRouter } from 'vue-router'

// ============ РОУТЕР ============
const router = useRouter() 

// ============ КОНСТАНТЫ ============
const spriteUrl = '/src/assets/images/sprite.svg'

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const isOpen = ref(false)      // управляет классом --active
const isMounted = ref(false)   // управляет наличием в DOM
const order = ref<Order | null>(null)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Отформатированная дата заказа */
const formattedDate = computed(() => {
    if (!order.value) return ''
    return new Date(order.value.createdAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
})

/** Полное имя клиента */
const customerFullName = computed(() => {
    if (!order.value) return '—'
    const customer = order.value.customer
    if (customer?.fullName) return customer.fullName
    return [customer?.lastName, customer?.firstName, customer?.middleName]
        .filter(Boolean)
        .join(' ') || '—'
})

/** Текст способа оплаты */
const paymentMethodText = computed(() => {
    if (!order.value) return '—'
    const method = order.value.payment as PaymentMethod

    const paymentMap: Record<PaymentMethod, string> = {
        card: 'Картой онлайн',
        cash: 'Наличными при получении',
        card_courier: 'Картой курьеру'
    }

    return paymentMap[method] || '—'
})

// ============ МЕТОДЫ УПРАВЛЕНИЯ ============
function open(selectedOrder: Order) {
    order.value = selectedOrder
    isMounted.value = true // 1. Добавляем в DOM

    setTimeout(() => {
        
        isOpen.value = true // 2. Добавляем класс --active, запускается анимация
        
        document.body.classList.add('modal-open')
        
        window.addEventListener('keydown', handleEscapePress)
    }, 50) 
}

function close() {
    isOpen.value = false // 1. Убираем класс --active, запускается анимация закрытия

    setTimeout(() => {
        isMounted.value = false // 2. Удаляем из DOM после анимации
        document.body.classList.remove('modal-open')
        window.removeEventListener('keydown', handleEscapePress)
    }, 300) // Длительность transition в CSS
}

function handleEscapePress(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
        close()
    }
}

// ============ ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ ============
/** Повторить заказ — добавить все товары в корзину */
function repeatOrder() {
  if (!order.value) return
  
  if (!confirm('Добавить все товары из этого заказа в корзину?')) return
  
  try {
    // Добавляем каждый товар в корзину
    order.value.items.forEach(item => {
      addToCart(item.productId, item.quantity)
    })
    
    alert(`Товары из заказа #${order.value.orderNumber} добавлены в корзину!`)
    
    // Уведомляем другие компоненты
    window.dispatchEvent(new CustomEvent('cart:update'))
    
    // Предлагаем перейти в корзину
    if (confirm('Перейти в корзину?')) {
      close()
      router.push('/cart')
    } else {
      close()
    }
  } catch (error) {
    console.error('[OrderDetailsModal] Ошибка при повторении заказа:', error)
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
    alert(`Не удалось добавить товары в корзину: ${message}`)
  }
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============
// Слушатель Escape добавляется/удаляется в open/close, не в onMounted

// ============ ЭКСПОРТ МЕТОДОВ ============
defineExpose({
    open,
    close
})
</script>