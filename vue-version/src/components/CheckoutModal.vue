<template>
  <Teleport to="body">
    <div v-if="isMounted" class="checkout-modal" :class="{ 'checkout-modal--active': isOpen }">
      <div class="checkout-modal__wrapper">
        <!-- Кнопка закрытия -->
        <button class="checkout-modal__close" @click="close" type="button">
          <svg width="20" height="20" aria-hidden="true">
            <use :xlink:href="`${spriteUrl}#icon-close`"></use>
          </svg>
        </button>

        <!-- ============ ЭКРАН ФОРМЫ ============ -->
        <div 
        class="checkout-modal__content checkout-modal__content--form"
        :class="{ 'checkout-modal__content--hidden': currentScreen === 'success' }"
        >
          <h2 class="checkout-modal__title">Оформление заказа</h2>

          <div class="checkout-modal__inner">
            <div class="checkout-modal__main-content">
              <!-- Левая колонка: форма -->
              <form class="checkout-form" @submit.prevent="handleSubmit">
                <!-- Секция 1: Контактные данные -->
                <div class="checkout-form__group">
                  <h3 class="checkout-form__group-title">Контактные данные</h3>
                  <div class="checkout-form__group-inner">
                    <!-- Фамилия -->
                    <div class="checkout-form__field">
                      <input type="text" class="checkout-form__input"
                        :class="{ 'checkout-form__input--error': errors.lastName }" v-model="formData.lastName"
                        placeholder="Фамилия" @blur="validateLastName"
                        @input="() => { if (errors.lastName) errors.lastName = '' }">
                      <span class="checkout-form__error" v-if="errors.lastName">
                        {{ errors.lastName }}
                      </span>
                    </div>

                    <!-- Имя -->
                    <div class="checkout-form__field">
                      <input type="text" class="checkout-form__input"
                        :class="{ 'checkout-form__input--error': errors.firstName }" v-model="formData.firstName"
                        placeholder="Имя" @blur="validateFirstName"
                        @input="() => { if (errors.firstName) errors.firstName = '' }">
                      <span class="checkout-form__error" v-if="errors.firstName">
                        {{ errors.firstName }}
                      </span>
                    </div>

                    <!-- Отчество -->
                    <div class="checkout-form__field">
                      <input type="text" class="checkout-form__input"
                        :class="{ 'checkout-form__input--error': errors.middleName }" v-model="formData.middleName"
                        placeholder="Отчество (необязательно)" @blur="validateMiddleName"
                        @input="() => { if (errors.middleName) errors.middleName = '' }">
                      <span class="checkout-form__error" v-if="errors.middleName">
                        {{ errors.middleName }}
                      </span>
                    </div>

                    <!-- Телефон -->
                    <div class="checkout-form__field">
                      <input type="tel" class="checkout-form__input"
                        :class="{ 'checkout-form__input--error': errors.phone }" v-model="formData.phone"
                        placeholder="+7 (999) 999 99 99" @blur="validatePhone"
                        @input="() => { if (errors.phone) errors.phone = '' }">
                      <span class="checkout-form__error" v-if="errors.phone">
                        {{ errors.phone }}
                      </span>
                    </div>

                    <!-- Email -->
                    <div class="checkout-form__field">
                      <input type="email" class="checkout-form__input"
                        :class="{ 'checkout-form__input--error': errors.email }" v-model="formData.email"
                        placeholder="Email" @blur="validateEmail"
                        @input="() => { if (errors.email) errors.email = '' }">
                      <span class="checkout-form__error" v-if="errors.email">
                        {{ errors.email }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Секция 2: Адрес доставки -->
                <div class="checkout-form__group">
                  <h3 class="checkout-form__group-title">Адрес доставки</h3>
                  <div class="checkout-form__group-inner">
                    <!-- Адрес -->
                    <div class="checkout-form__field">
                      <input type="text" class="checkout-form__input"
                        :class="{ 'checkout-form__input--error': errors.address }" v-model="formData.address"
                        placeholder="Город, улица, дом, квартира" @blur="validateAddress"
                        @input="() => { if (errors.address) errors.address = '' }">
                      <span class="checkout-form__error" v-if="errors.address">
                        {{ errors.address }}
                      </span>
                    </div>

                    <!-- Комментарий -->
                    <div class="checkout-form__field">
                      <textarea class="checkout-form__textarea checkout-form__input" v-model="formData.comment"
                        placeholder="Комментарий для курьера (необязательно)"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Секция 3: Способ оплаты -->
                <div class="checkout-form__group">
                  <h3 class="checkout-form__group-title">Способ оплаты</h3>
                  <div class="checkout-form__radio-group">
                    <label class="checkout-form__radio-label">
                      <input type="radio" value="card" v-model="formData.payment">
                      <span class="checkout-form__radio-text">Картой онлайн</span>
                    </label>

                    <label class="checkout-form__radio-label">
                      <input type="radio" value="cash" v-model="formData.payment">
                      <span class="checkout-form__radio-text">Наличными при получении</span>
                    </label>

                    <label class="checkout-form__radio-label">
                      <input type="radio" value="card_courier" v-model="formData.payment">
                      <span class="checkout-form__radio-text">Картой курьеру</span>
                    </label>
                  </div>
                </div>
              </form>

              <!-- Правая колонка: итоги -->
              <div class="checkout-summary">
                <div v-if="cartItems.length === 0" class="checkout-summary__empty">
                  Корзина пуста
                </div>
                <template v-else>
                  <h3 class="checkout-summary__title">
                    Ваш заказ
                    <span class="checkout-summary__items-count">({{ cartItems.length }} {{
                      getItemsWord(cartItems.length) }})</span>
                  </h3>

                  <ul class="checkout-summary__items-list">
                    <li v-for="item in cartItems" :key="item.id" class="checkout-summary__item">
                      <div class="checkout-summary__item-info">
                        <span class="checkout-summary__item-name">{{ item.product.name }}</span>
                        <span class="checkout-summary__item-quantity">× {{ item.quantity }}</span>
                      </div>
                      <span class="checkout-summary__item-price">
                        {{ (item.product.price * item.quantity).toLocaleString() }} ₽
                      </span>
                    </li>
                  </ul>

                  <div class="checkout-summary__total">
                    <div class="checkout-summary__total-row">
                      <span>Товары ({{ cartItems.length }} {{ getItemsWord(cartItems.length) }}):</span>
                      <span>{{ subtotal.toLocaleString() }} ₽</span>
                    </div>
                    <div class="checkout-summary__total-row">
                      <span>Доставка:</span>
                      <span>{{ computedDeliveryCost === 0 ? 'Бесплатно' : computedDeliveryCost.toLocaleString() + ' ₽'
                      }}</span>
                    </div>
                    <div class="checkout-summary__total-row checkout-summary__total-row--final">
                      <span>Итого:</span>
                      <span>{{ total.toLocaleString() }} ₽</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Футер с кнопкой -->
            <div class="checkout-modal__footer">
              <button type="button" class="checkout-modal__confirm-btn btn" @click="handleSubmit"
                :disabled="isSubmitting">
                {{ isSubmitting ? 'Оформляем...' : 'Подтвердить заказ' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ============ ЭКРАН УСПЕХА ============ -->
        <div 
        class="checkout-modal__content checkout-modal__content--success"
        :class="{ 'checkout-modal__content--active': currentScreen === 'success' }"
        >
          <div class="checkout-modal__success-wrap">
            <h2 class="checkout-modal__title checkout-modal__success-title">Спасибо за заказ!</h2>
            <p class="checkout-modal__message">
              Ваш заказ успешно оформлен.<br>
              Скоро мы свяжемся с Вами для подтверждения.
            </p>
            <button type="button" class="checkout-modal__success-btn btn" @click="continueShopping">
              Продолжить покупки
            </button>
            <p class="checkout-modal__order-info">
              Номер вашего заказа: <strong>{{ newOrderNumber }}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed } from 'vue'
import {
  getCartItemsWithProducts,
  addOrder,
  saveCurrentCart,
  getCurrentUser,
  updateCurrentUser
} from '@/data'
import type { CartItemWithProduct, OrderData, User } from '@/types'

// ============ ТИПЫ ============
type PaymentMethod = 'card' | 'cash' | 'card_courier'

interface CheckoutFormData {
  lastName: string
  firstName: string
  middleName: string
  phone: string
  email: string
  address: string
  comment: string
  payment: PaymentMethod
}

interface FormErrors {
  lastName: string
  firstName: string
  middleName: string
  phone: string
  email: string
  address: string
}

// ============ КОНСТАНТЫ ============
const spriteUrl = '/src/assets/images/sprite.svg'

/** Порог бесплатной доставки */
const FREE_DELIVERY_THRESHOLD = 5000
const DELIVERY_COST = 500

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
/** Управляет наличием модалки в DOM */
const isMounted = ref(false)

/** Управляет видимостью модалки (класс --active) */
const isOpen = ref(false)

/** Текущий экран: 'form' или 'success' */
const currentScreen = ref<'form' | 'success'>('form')

/** Номер последнего созданного заказа (для отображения на экране успеха) */
const newOrderNumber = ref('')

const formData = ref<CheckoutFormData>({
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  address: '',
  comment: '',
  payment: 'card'
})

const errors = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  address: ''
})

/** Блокировка повторной отправки */
const isSubmitting = ref(false)

/** Товары в корзине */
const cartItems = ref<CartItemWithProduct[]>([])

/** Стоимость доставки */
const deliveryCost = ref(0)

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Общая стоимость товаров */
const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
})

/** Стоимость доставки */
const computedDeliveryCost = computed(() => {
  return subtotal.value > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST
})

/** Итоговая сумма */
const total = computed(() => subtotal.value + computedDeliveryCost.value)

// ============ ФУНКЦИИ ВАЛИДАЦИИ ============

function validateLastName(): boolean {
  const value = formData.value.lastName.trim()
  if (!value) {
    errors.value.lastName = 'Введите фамилию'
    return false
  }
  if (value.length < 2) {
    errors.value.lastName = 'Фамилия слишком короткая'
    return false
  }
  errors.value.lastName = ''
  return true
}

function validateFirstName(): boolean {
  const value = formData.value.firstName.trim()
  if (!value) {
    errors.value.firstName = 'Введите имя'
    return false
  }
  if (value.length < 2) {
    errors.value.firstName = 'Имя слишком короткое'
    return false
  }
  errors.value.firstName = ''
  return true
}

function validateMiddleName(): boolean {
  const value = formData.value.middleName.trim()
  if (value && value.length < 2) {
    errors.value.middleName = 'Отчество слишком короткое'
    return false
  }
  errors.value.middleName = ''
  return true
}

function normalizePhone(phone: string): string {
  if (!phone) return ''
  const normalized = phone.replace(/[^\d+]/g, '')

  if (normalized.startsWith('+7')) return normalized
  if (normalized.startsWith('7')) return '+' + normalized
  if (normalized.startsWith('8')) return '+7' + normalized.substring(1)
  if (normalized.startsWith('9')) return '+7' + normalized
  return '+7' + normalized
}

function validatePhone(): boolean {
  const value = formData.value.phone.trim()

  if (!value) {
    errors.value.phone = 'Введите номер телефона'
    return false
  }

  const normalized = normalizePhone(value)

  if (!normalized.startsWith('+7')) {
    errors.value.phone = 'Номер должен начинаться с +7'
    return false
  }

  if (normalized.length !== 12) {
    errors.value.phone = 'В номере должно быть 10 цифр после +7'
    return false
  }

  const digitsOnly = normalized.substring(2)
  if (!/^\d{10}$/.test(digitsOnly)) {
    errors.value.phone = 'Номер содержит недопустимые символы'
    return false
  }

  // Нормализуем значение в formData
  formData.value.phone = normalized
  errors.value.phone = ''
  return true
}

function validateEmail(): boolean {
  const value = formData.value.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!value) {
    errors.value.email = 'Введите email'
    return false
  }

  if (!emailRegex.test(value)) {
    errors.value.email = 'Неверный формат email'
    return false
  }

  errors.value.email = ''
  return true
}

function validateAddress(): boolean {
  const value = formData.value.address.trim()

  if (!value) {
    errors.value.address = 'Введите адрес доставки'
    return false
  }

  if (value.length < 5) {
    errors.value.address = 'Адрес слишком короткий'
    return false
  }

  errors.value.address = ''
  return true
}

// Валидация всех полей формы
function validateForm(): boolean {
  const isLastNameValid = validateLastName()
  const isFirstNameValid = validateFirstName()
  const isMiddleNameValid = validateMiddleName()
  const isPhoneValid = validatePhone()
  const isEmailValid = validateEmail()
  const isAddressValid = validateAddress()

  return isLastNameValid && isFirstNameValid && isMiddleNameValid &&
    isPhoneValid && isEmailValid && isAddressValid
}

// ============ РАБОТА С ДАННЫМИ КОРЗИНЫ ==========

/** Загружает актуальные данные корзины */
function loadCart() {
  cartItems.value = getCartItemsWithProducts()
}

/** Склонение слова "товар" в зависимости от количества */
function getItemsWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'товар'
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'товара'
  return 'товаров'
}

// ============ МЕТОДЫ УПРАВЛЕНИЯ МОДАЛКОЙ ============

/**
 * Открывает модальное окно
 */
function open(): void {
  // Загружаем актуальную корзину
  loadCart()

  // Проверяем, что корзина не пуста
  if (cartItems.value.length === 0) {
    alert('Ваша корзина пуста!')
    return
  }

  // Загружаем данные пользователя в форму
  const currentUser = getCurrentUser()
  if (currentUser) {
    formData.value = {
      ...formData.value,
      lastName: currentUser.lastName || '',
      firstName: currentUser.firstName || '',
      middleName: currentUser.middleName || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
      address: '',  // адрес не сохраняем, нужно вводить каждый раз
      comment: '',
      payment: 'card'
    }
  } else {
    // Сбрасываем форму для гостя
    formData.value = {
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      email: '',
      address: '',
      comment: '',
      payment: 'card'
    }
  }

  // Очищаем ошибки
  errors.value = {
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    email: '',
    address: ''
  }

  // Сбрасываем на экран формы
  currentScreen.value = 'form'
  newOrderNumber.value = ''

  // Добавляем модалку в DOM
  isMounted.value = true

  // Небольшая задержка для анимации
  setTimeout(() => {
    isOpen.value = true
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleEscapePress)
  }, 50)
}

/**
 * Закрывает модальное окно
 */
function close(): void {
  isOpen.value = false

  setTimeout(() => {
    isMounted.value = false
    document.body.classList.remove('modal-open')
    window.removeEventListener('keydown', handleEscapePress)
  }, 300)
}

/**
 * Обработчик нажатия Escape
 */
function handleEscapePress(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

/**
 * Продолжить покупки (после успешного заказа)
 */
function continueShopping(): void {
  close()
  // Переход на главную или каталог
  window.history.pushState({}, '', '/catalog')
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * Обработчик отправки формы
 * Создаёт заказ, очищает корзину, показывает экран успеха
 */
async function handleSubmit(): Promise<void> {
  // 1. Защита от повторной отправки
  if (isSubmitting.value) return

  // 2. Валидируем форму
  if (!validateForm()) {
    console.log('Форма не валидна')
    return
  }

  // 3. Проверяем, что корзина не пуста
  if (cartItems.value.length === 0) {
    alert('Ваша корзина пуста!')
    return
  }

  // 4. Блокируем кнопку
  isSubmitting.value = true

  try {
    // 5. Получаем текущего пользователя
    const currentUser = getCurrentUser()

    // 6. Обновляем данные пользователя, если он авторизован
    if (currentUser) {
      const userUpdates: Partial<User> = {
        lastName: formData.value.lastName,
        firstName: formData.value.firstName,
        middleName: formData.value.middleName,
        phone: formData.value.phone
      }

      // Проверяем, есть ли изменения
      const hasNameChanged =
        currentUser.lastName !== userUpdates.lastName ||
        currentUser.firstName !== userUpdates.firstName ||
        currentUser.middleName !== userUpdates.middleName

      const hasPhoneChanged = currentUser.phone !== userUpdates.phone

      // Флаг: пользователь ещё не заполнял данные (поля пустые)
      const isNameEmpty = !currentUser.firstName && !currentUser.middleName && !currentUser.lastName
      const isPhoneEmpty = !currentUser.phone

      // Нужно ли сохранять?
      let shouldSave = false

      if (hasNameChanged || hasPhoneChanged) {
        // Если поля были пустые — сохраняем без вопроса
        if ((hasNameChanged && isNameEmpty) || (hasPhoneChanged && isPhoneEmpty)) {
          shouldSave = true
        } else {
          // Иначе спрашиваем
          let message = ''
          if (hasNameChanged && hasPhoneChanged) {
            message = 'Сохранить ваши имя и телефон для будущих заказов?'
          } else if (hasNameChanged) {
            message = 'Сохранить ваше имя для будущих заказов?'
          } else if (hasPhoneChanged) {
            message = 'Сохранить ваш телефон для будущих заказов?'
          }
          shouldSave = confirm(message)
        }
      }

      if (shouldSave) {
        updateCurrentUser(userUpdates)
        // Уведомляем другие компоненты об обновлении данных пользователя
        window.dispatchEvent(new CustomEvent('auth:change'))
      }
    }

    // 7. Формируем полное имя
    const fullName = [
      formData.value.lastName,
      formData.value.firstName,
      formData.value.middleName
    ].filter(Boolean).join(' ')

    // 8. Создаём объект заказа
    const fullOrderData: OrderData = {
      items: cartItems.value.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image
      })),
      customer: {
        lastName: formData.value.lastName,
        firstName: formData.value.firstName,
        middleName: formData.value.middleName || '',
        fullName: fullName,
        phone: formData.value.phone,
        email: formData.value.email,
        address: formData.value.address,
        comment: formData.value.comment || ''
      },
      payment: formData.value.payment,
      subtotal: subtotal.value,
      delivery: computedDeliveryCost.value,
      total: total.value,
      userId: currentUser?.id || null,
      isGuest: !currentUser
    }

    // 9. Сохраняем заказ
    const savedOrder = addOrder(fullOrderData)

    // 10. Очищаем корзину
    saveCurrentCart([])

    // 11. Уведомляем другие компоненты об обновлении корзины
    window.dispatchEvent(new CustomEvent('cart:update'))
    window.dispatchEvent(new CustomEvent('orders:update'))

    // 12. Показываем экран успеха с номером заказа
    newOrderNumber.value = savedOrder.orderNumber
    currentScreen.value = 'success'

  } catch (error) {
    console.error('[CheckoutModal] Ошибка оформления заказа:', error)
    alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.')
  } finally {
    // 13. Разблокируем кнопку
    isSubmitting.value = false
  }
}

// ============ ЭКСПОРТ МЕТОДОВ ============
defineExpose({
  open,
  close
})
</script>