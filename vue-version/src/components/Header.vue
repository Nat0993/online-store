<template>
  <header class="header">
    <div class="container">
      <div class="header__wrapper">
        <!-- Левая часть -->
        <div class="header__inner">
          <!-- Кнопка бургер -->
          <button class="header__burger burger" :class="{ 'burger--active': isMenuOpen }"
            aria-label="Открыть навигационное меню" @click="toggleMenu" type="button">
            <span class="burger__line burger__line--top"></span>
            <span class="burger__line burger__line--central"></span>
            <span class="burger__line burger__line--bottom"></span>
          </button>

          <!-- Навигация -->
          <div class="main-nav" :class="{ 'main-nav--active': isMenuOpen }">
            <ul class="main-nav__list">
              <li v-for="link in navLinks" :key="link.href" class="main-nav__item">
                <router-link :to="link.href" @click="closeMenu" class="main-nav__link">{{ link.label }}</router-link>
              </li>
            </ul>
          </div>

          <!-- Погода (заглушка) -->
          <span class="header__weather">Погода</span>
        </div>

        <!-- Логотип -->
        <router-link to="/" class="header__logo-link" aria-label="Логотип компании, переход на главную страницу">
          <svg width="70" height="70">
            <use xlink:href="/src/assets/images/sprite.svg#icon-logo"></use>
          </svg>
        </router-link>

        <!-- Правая часть -->
        <div class="header__user-inner">
          <!-- Кнопки -->
          <div class="header__btn-wrap">

            <!-- Кнопка "Войти" (показывается, если пользователь не авторизован) -->
            <button class="header__btn header__login-btn" v-if="!user" @click="openAuthModal" type="button">
              <svg width="20" height="20">
                <use xlink:href="/src/assets/images/sprite.svg#icon-persone"></use>
              </svg>
              Войти
            </button>

            <!-- Кнопка с именем пользователя (показывается, если авторизован) -->
            <button class="header__btn header__login-btn" v-else @click="goToProfile" type="button">
              <svg width="20" height="20">
                <use xlink:href="/src/assets/images/sprite.svg#icon-persone"></use>
              </svg>
              {{ displayName }}
            </button>

            <!-- Кнопка "Выйти" (показывается, если авторизован) -->
            <button class="header__btn header__logout-btn" v-if="user" @click="handleLogout"
              type="button">Выйти</button>
          </div>

          <!-- Иконки корзины и избранного -->
          <div class="header__links">
            <!-- Избранное -->
            <router-link to="/favorites" class="header__user-link" aria-label="Избранные товары" @click="closeMenu">
              <svg width="30" height="30">
                <use xlink:href="/src/assets/images/sprite.svg#icon-favorite"></use>
              </svg>
              <span v-if="favoritesCount > 0" class="header__counter header__favorites-counter">{{
                formattedFavoritesCount }}</span>
            </router-link>

            <!-- Корзина -->
            <router-link to="/cart" class="header__user-link" aria-label="Корзина" @click="closeMenu">
              <svg width="30" height="30">
                <use xlink:href="/src/assets/images/sprite.svg#icon-basket"></use>
              </svg>
              <span v-if="cartTotalItems > 0" class="header__counter header__cart-counter">{{ formattedCartCount
                }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Модалка авторизации -->
  <AuthModal ref="authModalRef" />
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  getCurrentCart,
  getCurrentFavorites,
  getCurrentUser,
  logoutUser
} from '../data'
import type { NavLink, User, CartItem, FavoriteItem } from '@/types/index';
import AuthModal from './AuthModal.vue'
import { useRouter } from 'vue-router'

// ============ РОУТЕР ============
const router = useRouter() 

// ============ КОНСТАНТЫ ============
const navLinks: NavLink[] = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/delivery', label: 'Доставка и оплата' },
  { href: '/sales', label: 'Акции' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/contacts', label: 'Контакты' }
]

const MAX_COUNTER = 99;
const MAX_NAME_LENGTH = 15;

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
// Состояние меню
const isMenuOpen = ref(false)

const user = ref<User | null>(null)
const cartItems = ref<CartItem[]>([])
const favorites = ref<FavoriteItem[]>([])

const authModalRef = ref<InstanceType<typeof AuthModal> | null>(null)
// ============ ВЫЧИСЛЕНИЯ ============

// Вычисляем имя пользователя для отображения в хедере
const displayName = computed(() => {
  if (!user.value) return ''

  let name = user.value.firstName?.trim() || user.value.login || 'Пользователь'

  if (name.length > MAX_NAME_LENGTH) {
    name = name.slice(0, MAX_NAME_LENGTH) + '...'
  }

  return name
})

// Вычисляем общее количество товаров в корзине
const cartTotalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

// Форматируем для отображения (99+)
const formattedCartCount = computed(() => {
  const count = cartTotalItems.value
  return count > 99 ? '99+' : count.toString()
})

// Количество избранных товаров
const favoritesCount = computed(() => favorites.value.length)

// Форматируем для отображения
const formattedFavoritesCount = computed(() => {
  const count = favoritesCount.value
  return count > 99 ? '99+' : count.toString()
})

// ============ ФУНКЦИИ ============

// Переключает меню: открыто → закрыто, закрыто → открыто
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Закрывает меню
function closeMenu() {
  isMenuOpen.value = false
}

// Обработчик клика вне меню
function handleClickOutside(event: MouseEvent) {
  if (!isMenuOpen.value) return  // меню закрыто — ничего не делаем

  const target = event.target as HTMLElement
  const burger = document.querySelector('.burger')
  const nav = document.querySelector('.main-nav')

  // Если кликнули НЕ по бургеру и НЕ по меню — закрываем
  if (burger && nav && !burger.contains(target) && !nav.contains(target)) {
    isMenuOpen.value = false
  }
}


//Переход в профиль
function goToProfile() {
  closeMenu()
  router.push('/profile')
}

// Открытие модалки авторизации
function openAuthModal() {
   authModalRef.value?.open()
}

//Выход из аккаунта
function handleLogout() {
  logoutUser()
  user.value = null
  window.dispatchEvent(new CustomEvent('auth:change', {
    detail: { user: null, type: 'logout' }
  }))
}

function loadCartAndFavorites() {
  cartItems.value = getCurrentCart()
  favorites.value = getCurrentFavorites()
}

function handleAuthChange() {
  user.value = getCurrentUser()
  loadCartAndFavorites()
}

function handleCartUpdate() {
  cartItems.value = getCurrentCart()
}

function handleFavoritesUpdate() {
  favorites.value = getCurrentFavorites()
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============

onMounted(() => {
  // 1. Загружаем начальные данные
  user.value = getCurrentUser()
  loadCartAndFavorites()

  // 2. Подписываемся на события
  window.addEventListener('auth:change', handleAuthChange)
  window.addEventListener('cart:update', handleCartUpdate)
  window.addEventListener('favorites:update', handleFavoritesUpdate)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 3. Отписываемся при удалении компонента
  window.removeEventListener('auth:change', handleAuthChange)
  window.removeEventListener('cart:update', handleCartUpdate)
  window.removeEventListener('favorites:update', handleFavoritesUpdate)
  document.removeEventListener('click', handleClickOutside)
})
</script>