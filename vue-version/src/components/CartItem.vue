<template>
  <li class="cart-item" :data-cart-item-id="item.id">
    <!-- Левая часть: изображение и информация о товаре -->
    <div class="cart-item__info">
      <img class="cart-item__img" :src="item.product.image || ''" :alt="item.product.name" loading="lazy">
      <div class="cart-item__inner">
        <h3 class="cart-item__title">{{ item.product.name }}</h3>
        <span class="cart-item__price">{{ formattedPrice }} ₽</span>
      </div>
    </div>

    <!-- Правая часть: управление количеством и удаление -->
    <div class="cart-item__wrapper">
      <div class="cart-item__total">
        <!-- Контролы количества -->
        <div class="cart-item__controls">
          <button class="cart-item__quantity-btn cart-item__quantity-btn--minus" @click="decreaseQuantity" type="button"
            aria-label="Уменьшить количество">
            -
          </button>
          <span class="cart-item__quantity">{{ quantity }}</span>
          <button class="cart-item__quantity-btn cart-item__quantity-btn--plus" @click="increaseQuantity" type="button"
            aria-label="Увеличить количество">
            +
          </button>
        </div>
        <!-- Итоговая сумма за этот товар -->
        <span class="cart-item__total-price">{{ totalPrice }} ₽</span>
      </div>

      <!-- Кнопка удаления -->
      <button class="cart-item__remove" @click="removeItem" type="button" aria-label="Удалить товар">
        <svg aria-hidden="true">
          <use :xlink:href="`${spriteUrl}#icon-close`"></use>
        </svg>
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed } from 'vue'
import type { CartItemWithProduct } from '../types'
import {
  getCurrentCart,
  updateCartQuantity,
  removeFromCart
} from '../data'

// ============ ПРОПСЫ ============
const props = defineProps<{
  item: CartItemWithProduct
}>()

// ============ КОНСТАНТЫ ============
const spriteUrl = '/src/assets/images/sprite.svg'

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const quantity = ref(props.item.quantity)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============
/** Форматированная цена товара */
const formattedPrice = computed(() => props.item.product.price.toLocaleString())

/** Итоговая сумма (цена × количество) */
const totalPrice = computed(() => props.item.product.price * quantity.value)

// ============ ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ ============
/** Увеличить количество товара */
function increaseQuantity() {
  const newQuantity = quantity.value + 1
  updateCartQuantity(props.item.id, newQuantity)
  quantity.value = newQuantity
  window.dispatchEvent(new CustomEvent('cart:update'))
}

/** Уменьшить количество товара */
function decreaseQuantity() {
  if (quantity.value === 1) {
    // Если остался 1 товар — удаляем
    removeItem()
  } else {
    const newQuantity = quantity.value - 1
    updateCartQuantity(props.item.id, newQuantity)
    quantity.value = newQuantity
    window.dispatchEvent(new CustomEvent('cart:update'))
  }
}

/** Удалить товар из корзины с анимацией */
function removeItem() {
  if (!confirm('Удалить товар из корзины?')) return
  
  // 1. Удаляем из хранилища
  removeFromCart(props.item.id)
  
  // 2. Шлем глобальное событие (для Header, ProductCard, родителю для анимации)
  window.dispatchEvent(new CustomEvent('cart:update'))
}
</script>