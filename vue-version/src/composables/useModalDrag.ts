import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * Composable для закрытия модалки по клику на оверлей
 * с защитой от закрытия при выделении текста
 * 
 * @param isOpen - реактивная переменная, показывающая открыта ли модалка
 * @param modalRef - ссылка на корневой DOM-элемент модалки (оверлей)
 * @param wrapperRef - ссылка на внутренний контейнер (где содержимое)
 * @param onClose - функция закрытия модалки
 */
export function useModalDrag(
    isOpen: Ref<boolean>,
    modalRef: Ref<HTMLElement | null>,
    wrapperRef: Ref<HTMLElement | null>,
    onClose: () => void
) {
    // Флаг: выделяет ли пользователь текст прямо сейчас
    const isDragging = ref(false)
    
    // Координаты начала выделения
    let startX = 0
    let startY = 0

    /**
     * 1. Пользователь нажал кнопку мыши внутри модалки
     *    Запоминаем координаты и сбрасываем флаг выделения
     */
    const onWrapperMouseDown = (e: MouseEvent) => {
        isDragging.value = false      // сброс флага
        startX = e.clientX            // запомнили X
        startY = e.clientY            // запомнили Y
    }

    /**
     * 2. Пользователь двигает мышь (выделяет текст)
     *    Если координаты изменились больше чем на 5px — считаем, что выделяет
     */
    const onWrapperMouseMove = (e: MouseEvent) => {
        // Вычисляем, насколько сдвинулась мышь от начальной точки
        const deltaX = Math.abs(e.clientX - startX)
        const deltaY = Math.abs(e.clientY - startY)
        
        // Если сдвиг больше 5 пикселей по любой оси — пользователь выделяет текст
        if (deltaX > 5 || deltaY > 5) {
            isDragging.value = true
        }
    }

    /**
     * 3. Пользователь кликнул на оверлее
     *    Закрываем модалку, только если:
     *    - кликнули именно на оверлей (e.target === modalRef.value)
     *    - и не было выделения текста (!isDragging.value)
     */
    const onModalClick = (e: MouseEvent) => {
        // Проверяем: клик на оверлее И не выделение текста
        if (e.target === modalRef.value && !isDragging.value) {
            onClose()  // закрываем модалку
        }
        // Сбрасываем флаг для следующего раза
        isDragging.value = false
    }

    /**
     * Подписка на события (вешаем слушатели)
     */
    const attach = () => {
        const wrapper = wrapperRef.value
        const modal = modalRef.value
        
        if (wrapper) {
            wrapper.addEventListener('mousedown', onWrapperMouseDown)
            wrapper.addEventListener('mousemove', onWrapperMouseMove)
        }
        
        if (modal) {
            modal.addEventListener('click', onModalClick)
        }
    }

    /**
     * Отписка от событий (удаляем слушатели)
     */
    const detach = () => {
        const wrapper = wrapperRef.value
        const modal = modalRef.value
        
        if (wrapper) {
            wrapper.removeEventListener('mousedown', onWrapperMouseDown)
            wrapper.removeEventListener('mousemove', onWrapperMouseMove)
        }
        
        if (modal) {
            modal.removeEventListener('click', onModalClick)
        }
    }

    // Следим за открытием/закрытием модалки
    watch(isOpen, (newValue) => {
        if (newValue) {
            // Модалка открылась — ждём рендера и подписываемся
            setTimeout(() => attach(), 50)
        } else {
            // Модалка закрылась — отписываемся
            detach()
        }
    })

    // При размонтировании компонента обязательно отписываемся
    onUnmounted(() => {
        detach()
    })

    // Возвращаем isDragging на случай, если нужно отладить или показать индикатор
    return { isDragging }
}
