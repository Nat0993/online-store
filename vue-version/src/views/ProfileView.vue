<template>
  <section class="profile">
    <div class="container">
      <!-- Хлебные крошки -->
      <Breadcrumbs :links="breadcrumbLinks" />

      <!-- Заголовок -->
      <PageHeader 
        title="Личный кабинет" 
        :description="headerDescription"
      />

      <!-- Если пользователь не авторизован -->
      <div v-if="!user" class="profile__guest">
        <EmptyMessage
          title="Необходима авторизация"
          description="Войдите в свой аккаунт, чтобы просматривать личный кабинет"
          :link="{ href: '/', label: 'На главную' }"
        />
      </div>

      <!-- Контент для авторизованного пользователя -->
      <div v-else class="profile__content">
        <!-- Левая колонка: данные пользователя -->
        <div class="profile__sidebar">
          <div class="profile__card">
            <div class="profile__card-header">
              <h2 class="profile__card-title">Ваши данные</h2>
              <button 
                class="profile__edit-btn" 
                @click="openProfileModal" 
                type="button"
                aria-label="Редактировать профиль"
              >
                <svg width="20" height="20" aria-hidden="true">
                  <use href="/src/assets/images/sprite.svg#icon-edit"></use>
                </svg>
              </button>
            </div>

            <div class="profile__info">
              <div class="profile__info-group">
                <span class="profile__info-label">Фамилия:</span>
                <span class="profile__info-value">{{ user.lastName || '—' }}</span>
              </div>
              <div class="profile__info-group">
                <span class="profile__info-label">Имя:</span>
                <span class="profile__info-value">{{ user.firstName || '—' }}</span>
              </div>
              <div class="profile__info-group">
                <span class="profile__info-label">Отчество:</span>
                <span class="profile__info-value">{{ user.middleName || '—' }}</span>
              </div>
              <div class="profile__info-group">
                <span class="profile__info-label">Телефон:</span>
                <span class="profile__info-value">{{ user.phone || '—' }}</span>
              </div>
              <div class="profile__info-group">
                <span class="profile__info-label">Email:</span>
                <span class="profile__info-value">{{ user.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая колонка: история заказов -->
        <div class="profile__main">
          <div class="profile__orders">
            <h2 class="profile__orders-title">История заказов</h2>

            <div class="profile__orders-content">
              <div v-if="sortedOrders.length === 0" class="profile__orders-empty">
                <p class="profile__orders-empty-text">У вас еще нет заказов</p>
                <router-link to="/catalog" class="profile__orders-empty-link btn">
                  Перейти в каталог
                </router-link>
              </div>

              <ul v-else class="profile__orders-list">
                <OrderItem 
                  v-for="order in sortedOrders" 
                  :key="order.id" 
                  :order="order"
                  class="profile__orders-item"
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка редактирования профиля -->
    <ProfileModal ref="profileModalRef" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyMessage from '@/components/EmptyMessage.vue'
import OrderItem from '@/components/OrderItem.vue'
import ProfileModal from '@/components/ProfileModal.vue'
import { getCurrentUser, getCurrentOrders } from '@/data'
import type { User, Order } from '@/types'

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const user = ref<User | null>(null)
const orders = ref<Order[]>([])
const profileModalRef = ref<InstanceType<typeof ProfileModal> | null>(null)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Хлебные крошки */
const breadcrumbLinks = computed(() => [
  { url: '/', text: 'Главная' },
  { text: 'Личный кабинет' }
])

/** Динамическое описание в заголовке */
const headerDescription = computed(() => {
  if (!user.value) return 'Для просмотра требуется авторизация'
  const userName = user.value.firstName || user.value.login || 'Пользователь'
  return `Добро пожаловать, ${userName}!`
})

/** Заказы, отсортированные по дате (новые сверху) */
const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

// ============ МЕТОДЫ ============

/** Загружает данные пользователя и заказы */
function loadProfileData() {
  user.value = getCurrentUser()
  if (user.value) {
    orders.value = getCurrentOrders()
  }
}

/** Открывает модалку редактирования профиля */
function openProfileModal() {
  profileModalRef.value?.open()
}

/** Обработчик обновления авторизации */
function handleAuthChange() {
  loadProfileData()
}

/** Обработчик обновления заказов */
function handleOrdersUpdate() {
  if (user.value) {
    orders.value = getCurrentOrders()
  }
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============

onMounted(() => {
  loadProfileData()
  window.addEventListener('auth:change', handleAuthChange)
  window.addEventListener('orders:update', handleOrdersUpdate)
})

onUnmounted(() => {
  window.removeEventListener('auth:change', handleAuthChange)
  window.removeEventListener('orders:update', handleOrdersUpdate)
})
</script>