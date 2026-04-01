<template>
    <Teleport to="body">
        <div v-if="isMounted" class="profile-modal" :class="{ 'profile-modal--active': isOpen }">
            <div class="profile-modal__wrapper">
                <!-- Шапка -->
                <div class="profile-modal__header">
                    <h2 class="profile-modal__title">{{ modalTitle }}</h2>
                    <button class="profile-modal__close" @click="close" type="button" aria-label="Закрыть">
                        <svg width="20" height="20" aria-hidden="true">
                            <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                        </svg>
                    </button>
                </div>

                <!-- Форма -->
                <form class="profile-modal__form" @submit.prevent="handleSubmit">
                    <div class="profile-modal__form-inner">
                        <!-- Фамилия -->
                        <div class="profile-modal__field">
                            <label class="profile-modal__label" for="profile-last-name">Фамилия</label>
                            <input type="text" id="profile-last-name" class="profile-modal__input"
                                :class="{ 'profile-modal__input--error': errors.lastName }" v-model="formData.lastName"
                                placeholder="Введите фамилию" @blur="validateLastName"
                                @input="() => { if (errors.lastName) errors.lastName = '' }">
                            <span class="profile-modal__error" :style="{ opacity: errors.lastName ? 1 : 0 }">
                                {{ errors.lastName }}
                            </span>
                        </div>

                        <!-- Имя -->
                        <div class="profile-modal__field">
                            <label class="profile-modal__label" for="profile-first-name">Имя</label>
                            <input type="text" id="profile-first-name" class="profile-modal__input"
                                :class="{ 'profile-modal__input--error': errors.firstName }"
                                v-model="formData.firstName" placeholder="Введите имя" @blur="validateFirstName"
                                @input="() => { if (errors.firstName) errors.firstName = '' }">
                            <span class="profile-modal__error" :style="{ opacity: errors.firstName ? 1 : 0 }">
                                {{ errors.firstName }}
                            </span>
                        </div>

                        <!-- Отчество -->
                        <div class="profile-modal__field">
                            <label class="profile-modal__label" for="profile-middle-name">Отчество</label>
                            <input type="text" id="profile-middle-name" class="profile-modal__input"
                                :class="{ 'profile-modal__input--error': errors.middleName }"
                                v-model="formData.middleName" placeholder="Введите отчество (необязательно)"
                                @blur="validateMiddleName"
                                @input="() => { if (errors.middleName) errors.middleName = '' }">
                            <span class="profile-modal__error" :style="{ opacity: errors.middleName ? 1 : 0 }">
                                {{ errors.middleName }}
                            </span>
                        </div>

                        <!-- Телефон -->
                        <div class="profile-modal__field">
                            <label class="profile-modal__label" for="profile-phone">Телефон</label>
                            <input type="tel" id="profile-phone" class="profile-modal__input"
                                :class="{ 'profile-modal__input--error': errors.phone }" v-model="formData.phone"
                                placeholder="+7 (999) 999 99 99" @blur="validatePhone"
                                @input="() => { if (errors.phone) errors.phone = '' }">
                            <span class="profile-modal__error" :style="{ opacity: errors.phone ? 1 : 0 }">
                                {{ errors.phone }}
                            </span>
                        </div>

                        <!-- Email (только для чтения) -->
                        <div class="profile-modal__field">
                            <label class="profile-modal__label" for="profile-email">Email (нельзя изменить)</label>
                            <input type="email" id="profile-email"
                                class="profile-modal__input profile-modal__input--readonly" :value="userEmail" readonly
                                disabled>
                        </div>
                    </div>

                    <!-- Кнопки -->
                    <div class="profile-modal__buttons">
                        <button type="submit" class="profile-modal__save-btn btn" :disabled="isSubmitting">
                            {{ saveButtonText }}
                        </button>
                        <button type="button" class="profile-modal__cancel-btn btn" @click="close">
                            Отменить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { getCurrentUser, updateCurrentUser } from '@/data'

// ============ ТИПЫ ============

/** Данные формы профиля */
interface ProfileFormData {
    lastName: string
    firstName: string
    middleName: string
    phone: string
}

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============

/** Управляет наличием модалки в DOM (для анимации) */
const isMounted = ref(false)

/** Управляет видимостью модалки (класс --active) */
const isOpen = ref(false)

/** Блокировка повторной отправки формы */
const isSubmitting = ref(false)

// ============ ДАННЫЕ ФОРМЫ ============

/** Реактивные данные формы */
const formData = ref<ProfileFormData>({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: ''
})

/** Email пользователя (только для чтения) */
const userEmail = ref('')

/** Оригинальные данные (для проверки изменений) */
const originalData = ref<ProfileFormData>({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: ''
})

// ============ ОШИБКИ ВАЛИДАЦИИ ============

/** Объект с ошибками полей */
const errors = ref({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: ''
})

// ============ СОСТОЯНИЕ ДЛЯ ЗАКРЫТИЯ ПО КЛИКУ ВНЕ ============
const dragState = ref({
    isDragging: false,
    startX: 0,
    startY: 0
})

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Заголовок модалки */
const modalTitle = computed<string>(() => {
    return 'Редактирование профиля'
})

/** Текст на кнопке сохранения */
const saveButtonText = computed<string>(() => {
    return isSubmitting.value ? 'Сохранение...' : 'Сохранить изменения'
})

// ============ ФУНКЦИИ ВАЛИДАЦИИ ============

/**
 * Нормализует номер телефона
 */
function normalizePhone(phone: string): string {
    if (!phone) return ''
    const normalized = phone.replace(/[^\d+]/g, '')

    if (normalized.startsWith('+7')) return normalized
    if (normalized.startsWith('7')) return '+' + normalized
    if (normalized.startsWith('8')) return '+7' + normalized.substring(1)
    if (normalized.startsWith('9')) return '+7' + normalized

    return '+7' + normalized
}

/**
 * Валидация фамилии
 */
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

/**
 * Валидация имени
 */
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

/**
 * Валидация отчества (необязательное)
 */
function validateMiddleName(): boolean {
    const value = formData.value.middleName.trim()

    if (value && value.length < 2) {
        errors.value.middleName = 'Отчество слишком короткое'
        return false
    }

    errors.value.middleName = ''
    return true
}

/**
 * Валидация телефона
 */
function validatePhone(): boolean {
    const value = formData.value.phone.trim()

    if (!value) {
        errors.value.phone = 'Введите номер телефона'
        return false
    }

    const normalizedPhone = normalizePhone(value)

    if (!normalizedPhone.startsWith('+7')) {
        errors.value.phone = 'Номер должен начинаться с +7'
        return false
    }

    if (normalizedPhone.length !== 12) {
        errors.value.phone = 'В номере должно быть 10 цифр после +7'
        return false
    }

    const digitsOnly = normalizedPhone.substring(2)
    if (!/^\d{10}$/.test(digitsOnly)) {
        errors.value.phone = 'Номер содержит недопустимые символы'
        return false
    }

    errors.value.phone = ''
    return true
}

/**
 * Основная валидация формы
 */
function validateForm(): boolean {
    const isLastNameValid = validateLastName()
    const isFirstNameValid = validateFirstName()
    const isMiddleNameValid = validateMiddleName()
    const isPhoneValid = validatePhone()

    return isLastNameValid && isFirstNameValid && isMiddleNameValid && isPhoneValid
}

/**
 * Очищает все ошибки
 */
function clearAllErrors(): void {
    errors.value = {
        lastName: '',
        firstName: '',
        middleName: '',
        phone: ''
    }
}

/**
 * Проверяет, есть ли изменения в форме
 */
function hasFormChanges(): boolean {
    return (
        formData.value.lastName !== originalData.value.lastName ||
        formData.value.firstName !== originalData.value.firstName ||
        formData.value.middleName !== originalData.value.middleName ||
        normalizePhone(formData.value.phone) !== normalizePhone(originalData.value.phone)
    )
}

/**
 * Загружает данные пользователя в форму
 */
function loadUserData(): void {
    const user = getCurrentUser()

    if (user) {
        const userData: ProfileFormData = {
            lastName: user.lastName || '',
            firstName: user.firstName || '',
            middleName: user.middleName || '',
            phone: user.phone || ''
        }

        formData.value = { ...userData }
        originalData.value = { ...userData }
        userEmail.value = user.email || ''
    }
}

// ============ ОБРАБОТЧИКИ ============

/**
 * Сохраняет изменения профиля
 */
async function handleSubmit(): Promise<void> {
    // 1. Защита от повторной отправки
    if (isSubmitting.value) return

    // 2. Валидация формы
    if (!validateForm()) return

    // 3. Проверка, есть ли изменения
    if (!hasFormChanges()) {
        alert('Нет изменений для сохранения')
        close()
        return
    }

    // 4. Блокируем кнопку
    isSubmitting.value = true

    try {
        // 5. Подготавливаем данные для сохранения
        const updatedData = {
            lastName: formData.value.lastName.trim(),
            firstName: formData.value.firstName.trim(),
            middleName: formData.value.middleName.trim(),
            phone: normalizePhone(formData.value.phone.trim())
        }

        // 6. Сохраняем через data.ts
        const updatedUser = updateCurrentUser(updatedData)

        // 7. Отправляем событие об обновлении
        window.dispatchEvent(new CustomEvent('auth:change', {
            detail: {
                user: updatedUser,
                type: 'profile-update'
            }
        }))

        // 8. Закрываем модалку
        close()

        // 9. Сообщаем об успехе
        alert('Данные успешно сохранены!')

    } catch (error) {
        console.error('[ProfileModal] Ошибка сохранения профиля:', error)
        alert('Произошла ошибка при сохранении. Попробуйте еще раз.')
    } finally {
        // 10. Разблокируем кнопку
        isSubmitting.value = false
    }
}

// ============ ОБРАБОТЧИКИ ДЛЯ ОТСЛЕЖИВАНИЯ ВЫДЕЛЕНИЯ ============

/** Сбрасывает флаг выделения и запоминает координаты клика */
function onWrapperMouseDown(e: MouseEvent): void {
    dragState.value.isDragging = false
    dragState.value.startX = e.clientX
    dragState.value.startY = e.clientY
}

/** При движении мыши проверяем, выделяет ли пользователь текст */
function onWrapperMouseMove(e: MouseEvent): void {
    if (Math.abs(e.clientX - dragState.value.startX) > 5 || 
        Math.abs(e.clientY - dragState.value.startY) > 5) {
        dragState.value.isDragging = true
    }
}

/** Закрывает модалку по клику на оверлей, если не было выделения текста */
function onModalClick(e: MouseEvent): void {
    const modal = document.querySelector('.profile-modal')
    if (e.target === modal && !dragState.value.isDragging) {
        close()
    }
    dragState.value.isDragging = false
}

// ============ УПРАВЛЕНИЕ МОДАЛКОЙ ============

/**
 * Открывает модальное окно
 */
function open(): void {
    // 1. Загружаем актуальные данные пользователя
    loadUserData()

    // 2. Очищаем ошибки
    clearAllErrors()

    // 3. Добавляем модалку в DOM
    isMounted.value = true

    // 4. Ждем рендеринга с небольшой задержкой
    setTimeout(() => {
        // 5. Добавляем класс --active, запускается анимация
        isOpen.value = true

        // 6. Блокируем скролл страницы
        document.body.classList.add('modal-open')

        // 7. Слушаем нажатие Escape
        window.addEventListener('keydown', handleEscapePress)

        // Добавляем слушатели после того, как модалка отрендерилась
        const modal = document.querySelector('.profile-modal')
        const wrapper = document.querySelector('.profile-modal__wrapper')
        
        if (wrapper) {
            wrapper.addEventListener('mousedown', onWrapperMouseDown as EventListener)
            wrapper.addEventListener('mousemove', onWrapperMouseMove as EventListener)
        }
        
        if (modal) {
            modal.addEventListener('click', onModalClick as EventListener)
        }
    }, 50)
}

/**
 * Закрывает модальное окно
 */
function close(): void {
    // 1. Убираем класс --active, запускается анимация закрытия
    isOpen.value = false

    // 2. Удаляем слушатели
    const modal = document.querySelector('.profile-modal')
    const wrapper = document.querySelector('.profile-modal__wrapper')
    
    if (wrapper) {
        wrapper.removeEventListener('mousedown', onWrapperMouseDown as EventListener)
        wrapper.removeEventListener('mousemove', onWrapperMouseMove as EventListener)
    }
    
    if (modal) {
        modal.removeEventListener('click', onModalClick as EventListener)
    }

    // 3. Ждем завершения анимации (300ms)
    setTimeout(() => {
        // 4. Удаляем модалку из DOM
        isMounted.value = false

        // 5. Возвращаем скролл странице
        document.body.classList.remove('modal-open')

        // 6. Убираем слушатель Escape
        window.removeEventListener('keydown', handleEscapePress)
    }, 300)
}

/**
 * Обработчик нажатия клавиши Escape
 */
function handleEscapePress(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isOpen.value) {
        close()
    }
}

// ============ ЭКСПОРТ МЕТОДОВ ============

defineExpose({
    open,
    close
})
</script>