<!-- 
  !! ВРЕМЕННЫЙ ТЕСТОВЫЙ ФАЙЛ !!
  Используется только для тестирования компонентов.
  При создании реального App.vue этот файл будет заменён.
-->

<template>
  <div id="app">
    <!-- Header -->
    <Header />

    <!-- Основной контент -->
    <main id="main-component">
      <div class="container">
        <!-- ============ ТЕСТ PRODUCTCARD ============ -->
        <h1>0. Тест ProductCard (товары для добавления в корзину)</h1>

        <div class="product-list">
          <ProductCard v-for="product in testProducts" :key="product.id" :product="product" />
        </div>

        <!-- ============ ТЕСТ CARTITEM ============ -->
        <h1>1. Тест CartItem (товары в корзине)</h1>

        <div v-if="cartItems.length === 0" class="empty-cart">
          Корзина пуста. Добавьте товары через ProductCard выше.
        </div>

        <transition-group v-else class="cart-list" name="cart-list" tag="ul">
          <CartItem v-for="item in cartItems" :key="item.id" :item="item" />
        </transition-group>

        <!-- ============ ТЕСТ ORDERITEM ============ -->
        <h1>2. Тест OrderItem (история заказов)</h1>

        <div v-if="orders.length === 0" class="empty-orders">
          Нет заказов для отображения
        </div>

        <ul v-else class="orders-list">
          <OrderItem v-for="order in orders" :key="order.id" :order="order" />
        </ul>

        <!-- ============ ТЕСТ ORDERDETAILSMODAL ============ -->
        <h1>2. Тест OrderDetailsModal</h1>

        <button @click="openOrderModal" class="btn">
          Посмотреть детали первого заказа
        </button>

        <!-- ============ ТЕСТ PROFILEMODAL ============ -->
        <h1>3. Тест ProfileModal (редактирование профиля)</h1>

        <button @click="openProfileModal" class="btn">
          Открыть профиль для редактирования
        </button>

        <!-- ... -->
        <h1>5. Тест CheckoutModal</h1>
        <button @click="openCheckoutModal" class="btn">
          Открыть оформление заказа
        </button>

        <!-- Модалки -->
        <OrderDetailsModal ref="orderModalRef" />
        <ProfileModal ref="profileModalRef" />
        <CheckoutModal ref="checkoutModalRef" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import ProductCard from './components/ProductCard.vue'
import CartItem from './components/CartItem.vue'
import OrderDetailsModal from './components/OrderDetailsModal.vue'
import ProfileModal from './components/ProfileModal.vue'
import OrderItem from './components/OrderItem.vue'
import CheckoutModal from './components/CheckoutModal.vue'
import {
  getCurrentUser,
  products,
  getCartItemsWithProducts,
  getCurrentOrders,
  addOrder,
  removeFromCart
} from './data.js'
import type { User, CartItemWithProduct, Order } from './types/index'

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const user = ref<User | null>(null)
const cartItems = ref<CartItemWithProduct[]>(getCartItemsWithProducts())
const orders = ref<Order[]>(getCurrentOrders())

// Берём первые 3 товара для ProductCard
const testProducts = products.slice(0, 3)

// Рефы для модалок
const orderModalRef = ref<InstanceType<typeof OrderDetailsModal> | null>(null)
const profileModalRef = ref<InstanceType<typeof ProfileModal> | null>(null)
const checkoutModalRef = ref(null)

// ============ МЕТОДЫ ============
function checkUser() {
  user.value = getCurrentUser()
  console.log('Текущий пользователь:', user.value)
}

function openOrderModal() {
  const firstOrder = orders.value[0]
  if (firstOrder) {
    orderModalRef.value?.open(firstOrder)
  } else {
    alert('Нет заказов для демонстрации')
  }
}

function openProfileModal() {
  profileModalRef.value?.open()
}

function openCheckoutModal() {
  checkoutModalRef.value?.open()
}

// ============ СОЗДАНИЕ ТЕСТОВОГО ЗАКАЗА ============
function createTestOrder() {
  // Проверяем, есть ли уже заказы
  if (orders.value.length > 0) {
    console.log('Заказы уже есть, тестовый не создаём')
    return
  }

  // Создаём тестовый заказ
  const testOrder = {
    items: [
      {
        productId: 'prod_chair_1',
        productName: 'Стул "Marco"',
        quantity: 2,
        price: 9500,
        image: '/src/assets/images/catalog/products/chairs/chair1.jpg'
      },
      {
        productId: 'prod_chair_2',
        productName: 'Стул "Moose"',
        quantity: 1,
        price: 10300,
        image: '/src/assets/images/catalog/products/chairs/chair2.jpg'
      }
    ],
    customer: {
      lastName: 'Иванов',
      firstName: 'Иван',
      middleName: 'Иванович',
      fullName: 'Иванов Иван Иванович',
      phone: '+79001234567',
      email: 'ivan@example.com',
      address: 'г. Москва, ул. Тестовая, д. 1, кв. 10',
      comment: 'Позвонить за час до доставки'
    },
    payment: 'card' as const,
    subtotal: 9500 * 2 + 10300,
    delivery: 0,
    total: 9500 * 2 + 10300
  }

  const newOrder = addOrder(testOrder)
  orders.value = getCurrentOrders()
  console.log('Тестовый заказ создан:', newOrder)
}

// Обновление данных при событиях
function handleCartUpdate() {
  cartItems.value = getCartItemsWithProducts()
}

function handleAuthChange() {
  user.value = getCurrentUser()
  cartItems.value = getCartItemsWithProducts()
  orders.value = getCurrentOrders()
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============
onMounted(() => {
  // Загружаем заказы
  orders.value = getCurrentOrders()

  // Если нет заказов — создаём тестовый
  if (orders.value.length === 0) {
    createTestOrder()
    orders.value = getCurrentOrders()
  }

  window.addEventListener('cart:update', handleCartUpdate)
})

onUnmounted(() => {
  window.removeEventListener('cart:update', handleCartUpdate)
})
</script>

<style scoped>
.empty-cart,
.empty-orders {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
  color: #666;
}

.btn {
  margin: 20px 0;
  padding: 10px 20px;
  background: #4a6fa5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 20px;
}

.btn:hover {
  background: #3a5a8a;
}

/* ============ АНИМАЦИЯ ДЛЯ CART-LIST ============ */
.cart-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

/* Анимация для удаляемого элемента */
.cart-list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: calc(100% - 2px);
}

.cart-list-leave-to {
  opacity: 0;
  transform: scale(0.8) translateX(-50px);
}

/* Анимация для сдвигающихся элементов */
.cart-list-move {
  transition: transform 0.3s ease;
}

/* ============ СПИСОК ЗАКАЗОВ ============ */
.orders-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.empty-orders {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
  color: #666;
}
</style>
