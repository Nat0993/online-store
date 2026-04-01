<template>
    <Teleport to="body">
        <div v-if="isMounted" class="auth" :class="[{ 'auth--active': isOpen }, modalClass]" @click.self="close">
            <div class="auth__wrapper">
                <!-- ============ ШАПКА МОДАЛКИ ============ -->
                <div class="auth__inner">
                    <!-- Заголовок: динамически меняется в зависимости от режима -->
                    <span class="auth__title">{{ modalTitle }}</span>

                    <!-- Кнопка закрытия: при клике вызывает close() -->
                    <button class="auth__close" @click="close" type="button" aria-label="Закрыть модалку">
                        <svg width="20" height="20" aria-hidden="true">
                            <use xlink:href="/src/assets/images/sprite.svg#icon-close"></use>
                        </svg>
                    </button>
                </div>
                <!-- ============ ФОРМА ============ -->
                <form class="auth__form" @submit.prevent="handleSubmit">

                    <!-- ============ ПОЛЕ EMAIL ============ -->
                    <div class="auth__input-inner">
                        <!-- 
                            Само поле ввода email:
                            - class="auth__input" — базовый стиль
                            - :class — если есть ошибка, добавляем класс auth__input--error (красная обводка)
                            - type="email" — для мобильной клавиатуры с @
                            - v-model — двусторонняя привязка к formData.email
                            - placeholder — текст-подсказка
                            - @blur — при потере фокуса запускаем валидацию
                            - @input — при вводе текста очищаем ошибку (если была)
                        -->
                        <input class="auth__input" :class="{ 'auth__input--error': errors.email }" type="email"
                            v-model="formData.email" placeholder="Адрес электронной почты" @blur="validateEmail"
                            @input="() => { if (errors.email) errors.email = '' }">

                        <!-- 
                            Текст ошибки:
                            - class="auth__error" — базовый стиль (opacity: 0 по умолчанию)
                            - :style — если errors.email не пустой, opacity = 1 (ошибка видна)
                            - {{ errors.email }} — текст ошибки (пустая строка, если ошибки нет)
                        -->
                        <span class="auth__error" :style="{ opacity: errors.email ? 1 : 0 }">
                            {{ errors.email }}
                        </span>
                    </div>

                    <!-- ============ ПОЛЕ ПАРОЛЯ ============ -->
                    <div class="auth__input-inner">
                        <!-- 
                            Поле ввода пароля:
                            - type="password" — символы скрываются (звездочки)
                            - :placeholder — динамический текст:
                                * при логине: "Введите пароль"
                                * при регистрации: "Придумайте пароль"
                            - :class — если есть ошибка, добавляем красную обводку
                            - v-model="formData.password" — двусторонняя привязка
                            - @blur="validatePassword" — валидация при потере фокуса
                            - @input — при вводе очищаем ошибку пароля
                        -->
                        <input class="auth__input" :class="{ 'auth__input--error': errors.password }" type="password"
                            v-model="formData.password" :placeholder="passwordPlaceholder" @blur="validatePassword"
                            @input="() => { if (errors.password) errors.password = '' }">
                        <!-- Текст ошибки пароля -->
                        <span class="auth__error" :style="{ opacity: errors.password ? 1 : 0 }">
                            {{ errors.password }}
                        </span>
                    </div>

                    <!-- ============ ПОЛЕ ПОДТВЕРЖДЕНИЯ ПАРОЛЯ ============ -->
                    <!-- 
                    Класс auth__input-inner--confirm всегда есть на div
                    Появление/исчезновение управляется через CSS:
                    - по умолчанию opacity: 0, visibility: hidden
                    - когда у .auth есть класс auth--register, становится видимым
                    Класс auth--register добавляется через :class на корневом div
                    -->
                    <div class="auth__input-inner auth__input-inner--confirm">
                        <input class="auth__input" :class="{ 'auth__input--error': errors.confirm }" type="password"
                            v-model="confirmPassword" placeholder="Повторите пароль" @blur="validateConfirmPassword"
                            @input="() => { if (errors.confirm) errors.confirm = '' }">
                        <span class="auth__error" :style="{ opacity: errors.confirm ? 1 : 0 }">
                            {{ errors.confirm }}
                        </span>
                    </div>

                    <!-- ============ НИЖНЯЯ ЧАСТЬ С КНОПКАМИ ============ -->
                    <div class="auth__bottom">
                        <!-- 
                            Кнопка отправки формы
                            :disabled="isSubmitting" — блокируем пока идет отправка
                            Текст кнопки меняется динамически:
                            - login: "Войти"
                            - register: "Зарегистрироваться"
                            При отправке показывает "Загрузка..."
                        -->
                        <button class="auth__btn btn" type="submit" :disabled="isSubmitting">
                            {{ isSubmitting ? 'Загрузка...' : submitButtonText }}
                        </button>

                        <!-- 
                            Кнопка переключения режима (Вход ↔ Регистрация)
                            @click="switchMode" — вызывает функцию переключения
                            Текст кнопки динамический:
                            - login: "Регистрация"
                            - register: "Войти"
                        -->
                        <button class="auth__switch-btn" type="button" @click="switchMode">
                            {{ switchButtonText }}
                        </button>

                        <!-- 
                            Текст-подсказка под кнопкой
                            Динамический:
                            - login: "Если у Вас еще нет аккаунта"
                            - register: "Если у Вас уже есть аккаунт"
                        -->
                        <span class="auth__description">{{ switchHintText }}</span>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>


<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { registerUser, loginUser } from '@/data'
import type { UserData } from '@/types'

// ============ ТИПЫ ============

/** Режимы работы модалки */
type AuthMode = 'login' | 'register'

/** Данные формы авторизации */
interface AuthFormData {
    email: string
    password: string
}

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============

/** Управляет наличием модалки в DOM (для анимации) */
const isMounted = ref(false)

/** Управляет видимостью модалки (класс --active) */
const isOpen = ref(false)

/** Текущий режим: 'login' или 'register' */
const currentMode = ref<AuthMode>('login')

/** Блокировка повторной отправки формы */
const isSubmitting = ref(false)

// ============ ДАННЫЕ ФОРМЫ ============

/** Реактивные данные формы */
const formData = ref<AuthFormData>({
    email: '',
    password: ''
})

/** Пароль для подтверждения (только при регистрации) */
const confirmPassword = ref('')

// ============ ОШИБКИ ВАЛИДАЦИИ ============

/** Объект с ошибками полей */
const errors = ref({
    email: '',
    password: '',
    confirm: ''
})

// ============ СОСТОЯНИЕ ДЛЯ ЗАКРЫТИЯ ПО КЛИКУ ВНЕ ============
const dragState = ref({
    isDragging: false,
    startX: 0,
    startY: 0
})

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (COMPUTED) ============

/** Заголовок модалки в зависимости от режима */
const modalTitle = computed<string>(() => {
    return currentMode.value === 'login' ? 'Вход' : 'Регистрация'
})

/** Текст на кнопке отправки формы */
const submitButtonText = computed<string>(() => {
    return currentMode.value === 'login' ? 'Войти' : 'Зарегистрироваться'
})

/** Текст кнопки переключения режима */
const switchButtonText = computed<string>(() => {
    return currentMode.value === 'login' ? 'Регистрация' : 'Войти'
})

/** Текст подсказки под кнопкой переключения */
const switchHintText = computed<string>(() => {
    return currentMode.value === 'login'
        ? 'Если у Вас еще нет аккаунта'
        : 'Если у Вас уже есть аккаунт'
})

/** Placeholder для поля пароля */
const passwordPlaceholder = computed<string>(() => {
    return currentMode.value === 'login'
        ? 'Введите пароль'
        : 'Придумайте пароль'
})

/** CSS-класс для модалки (добавляет класс auth--register при регистрации (появляется поле confirm через css)) */
const modalClass = computed(() => {
    return {
        'auth--register': currentMode.value === 'register'
    }
})

// ============ ФУНКЦИИ ВАЛИДАЦИИ ============

/**
 * Валидация email
 * @returns {boolean} true если email валидный
 */
function validateEmail(): boolean {
    const emailValue = formData.value.email.trim()

    if (!emailValue) {
        errors.value.email = 'Email обязателен для заполнения'
        return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
        errors.value.email = 'Введите корректный email'
        return false
    }

    errors.value.email = ''
    return true
}

/**
 * Валидация пароля
 * @returns {boolean} true если пароль валидный
 */
function validatePassword(): boolean {
    const passwordValue = formData.value.password.trim()

    if (!passwordValue) {
        errors.value.password = 'Пароль обязателен для заполнения'
        return false
    }

    if (currentMode.value === 'register' && passwordValue.length < 6) {
        errors.value.password = 'Пароль должен содержать минимум 6 символов'
        return false
    }

    errors.value.password = ''
    return true
}

/**
 * Валидация подтверждения пароля (только для режима регистрации)
 * @returns {boolean} true если пароли совпадают
 */
function validateConfirmPassword(): boolean {
    // В режиме входа поле подтверждения не показывается — валидация не нужна
    if (currentMode.value === 'login') {
        return true
    }

    const confirmValue = confirmPassword.value.trim()
    const passwordValue = formData.value.password.trim()

    if (!confirmValue) {
        errors.value.confirm = 'Подтверждение пароля обязательно'
        return false
    }

    if (confirmValue !== passwordValue) {
        errors.value.confirm = 'Пароли не совпадают'
        return false
    }

    errors.value.confirm = ''
    return true
}

/**
 * Основная валидация всей формы
 * @returns {boolean} true если форма валидна
 */
function validateForm(): boolean {
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    const isConfirmValid = validateConfirmPassword()

    return isEmailValid && isPasswordValid && isConfirmValid
}

/**
 * Очищает все ошибки валидации
 */
function clearAllErrors(): void {
    errors.value = {
        email: '',
        password: '',
        confirm: ''
    }
}

/**
 * Сбрасывает форму к начальному состоянию
 */
function resetForm(): void {
    formData.value = {
        email: '',
        password: ''
    }
    confirmPassword.value = ''
    clearAllErrors()
}

// ============ ОБРАБОТЧИКИ АВТОРИЗАЦИИ ============

/**
 * Обработчик входа пользователя
 * @param {AuthFormData} data - данные формы (email, password)
 */
function handleLogin(data: AuthFormData): void {
    try {
        const user = loginUser(data.email, data.password)

        // Закрываем модалку
        close()

        // Отправляем событие об успешном входе
        window.dispatchEvent(new CustomEvent('auth:change', {
            detail: { user, type: 'login' }
        }))
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка входа'

        // Определяем, какое поле подсветить
        if (message.toLowerCase().includes('email')) {
            errors.value.email = message
        } else if (message.toLowerCase().includes('пароль') || message.toLowerCase().includes('password')) {
            errors.value.password = message
        } else {
            alert(message)
        }
    }
}

/**
 * Обработчик регистрации пользователя
 * @param {AuthFormData} data - данные формы (email, password)
 */
function handleRegistration(data: AuthFormData): void {
    try {
        const userData: UserData = {
            email: data.email,
            password: data.password,
            login: data.email.split('@')[0],
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
        }

        const user = registerUser(userData)

        // Закрываем модалку
        close()

        // Отправляем событие об успешном входе
        window.dispatchEvent(new CustomEvent('auth:change', {
            detail: { user, type: 'login' }
        }))

        alert('Регистрация прошла успешно!')
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка регистрации'

        // Определяем, какое поле подсветить
        if (message.toLowerCase().includes('email')) {
            errors.value.email = message
        } else if (message.toLowerCase().includes('пароль') || message.toLowerCase().includes('password')) {
            errors.value.password = message
        } else {
            alert(message)
        }
    }
}

/**
 * Обработчик отправки формы
 */
async function handleSubmit(): Promise<void> {
    // 1. Защита от повторной отправки
    if (isSubmitting.value) return

    // 2. Валидация формы
    if (!validateForm()) return

    // 3. Блокируем кнопку
    isSubmitting.value = true

    try {
        const data: AuthFormData = {
            email: formData.value.email.trim(),
            password: formData.value.password.trim()
        }

        if (currentMode.value === 'login') {
            await handleLogin(data)
        } else {
            await handleRegistration(data)
        }
    } finally {
        // 4. Разблокируем кнопку (выполнится в любом случае)
        isSubmitting.value = false
    }
}

// ============ УПРАВЛЕНИЕ МОДАЛКОЙ ============

/**
 * Открывает модальное окно
 */
function open(): void {
    // 1. Добавляем модалку в DOM
    isMounted.value = true
    
    // 2. Ждем рендеринга с небольшой задержкой
    setTimeout(() => {
        
        // 3. Добавляем класс --active, запускается анимация
        isOpen.value = true
        
        // 4. Блокируем скролл страницы
        document.body.classList.add('modal-open')
        
        // 5. Слушаем нажатие Escape
        window.addEventListener('keydown', handleEscapePress)
    }, 50) // небольшая задержка (с nextTick не успевал отрендерить модалку)
    
    // 6. Сбрасываем режим на 'login'
    currentMode.value = 'login'
    
    // 7. Очищаем форму и ошибки
    resetForm()
}

/**
 * Закрывает модальное окно
 */
function close(): void {
    // 1. Убираем класс --active, запускается анимация закрытия
    isOpen.value = false

    // 2. Ждем завершения анимации (300ms — соответствует transition в CSS)
    setTimeout(() => {
        // 3. Удаляем модалку из DOM
        isMounted.value = false

        // 4. Возвращаем скролл странице
        document.body.classList.remove('modal-open')

        // 5. Убираем слушатель Escape
        window.removeEventListener('keydown', handleEscapePress)
    }, 300)
}

/**
 * Переключает режим между 'login' и 'register'
 * Сбрасывает форму и ошибки при переключении
 */
function switchMode(): void {
    // Меняем режим
    currentMode.value = currentMode.value === 'login' ? 'register' : 'login'

    // Очищаем форму и ошибки
    resetForm()
}

/**
 * Обработчик нажатия клавиши Escape
 * @param {KeyboardEvent} event - событие клавиатуры
 */
function handleEscapePress(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isOpen.value) {
        close()
    }
}

/**
 * Обработчик клика вне модалки (для закрытия)
 * @param {MouseEvent} event - событие клика
 */
function handleOutsideClick(event: MouseEvent): void {
    // Если модалка не открыта — ничего не делаем
    if (!isOpen.value) return

    // Находим элемент .auth__wrapper (внутренний контейнер модалки)
    const wrapper = document.querySelector('.auth__wrapper')
    const target = event.target as HTMLElement

    // Если кликнули НЕ по wrapper'у и НЕ по его дочерним элементам
    if (wrapper && !wrapper.contains(target)) {
        // Проверяем, что не было выделения текста
        if (!dragState.value.isDragging) {
            close()
        }
    }
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============

/**
 * При монтировании компонента добавляем слушатель кликов для закрытия по оверлею
 */
onMounted(() => {
    // Добавляем слушатель для закрытия по клику на оверлей
    document.addEventListener('click', handleOutsideClick)
})

/**
 * При размонтировании компонента удаляем слушатель
 */
onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
    // Убираем блокировку скролла, если модалка осталась открытой
    document.body.classList.remove('modal-open')
})

// ============ ЭКСПОРТ МЕТОДОВ ДЛЯ РОДИТЕЛЬСКОГО КОМПОНЕНТА ============

/**
 * Предоставляем родительским компонентам доступ к методам open и close
 */
defineExpose({
    open,
    close
})
</script>