<template>
    <div class="categories">
        <div class="container">
            <!-- Хлебные крошки -->
            <Breadcrumbs :links="breadcrumbLinks" />
            
            <!-- Заголовок страницы -->
            <PageHeader 
                title="Категории мебели" 
                description="Выберите интересующую вас категорию"
            />
            
            <!-- Сетка категорий -->
            <div class="categories__wrapper">
                <CategoryCard
                    v-for="category in validCategories"
                    :key="category.id"
                    :category="category"
                    @click="navigateToCategory(category.id)"
                />
            </div>
            
            <!-- Сообщение, если нет категорий -->
            <EmptyMessage
                v-if="validCategories.length === 0"
                title="Категории временно недоступны"
                description="Попробуйте обновить страницу позже"
                :link="{ href: '/', label: 'На главную' }"
            />
        </div>
    </div>
</template>


<script setup lang="ts">
// ============ ИМПОРТЫ ============
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCategories } from '@/data'
import { isValidCategory } from '@/utils/security'
import type { Category } from '@/types'

// ============ РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ ============
const categories = ref<Category[]>([])

// ============ КОМПОНЕНТЫ ============
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyMessage from '@/components/EmptyMessage.vue'
import CategoryCard from '@/components/CategoryCard.vue'

// ============ РОУТЕР ============
const router = useRouter()

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============
/** Отфильтрованные валидные категории */
const validCategories = computed(() => {
    return categories.value.filter(isValidCategory)
})

/** Данные для хлебных крошек */
const breadcrumbLinks = computed(() => [
    { url: '/', text: 'Главная' },
    { text: 'Категории' }
])

// ============ МЕТОДЫ ============
/** Переход к странице товаров выбранной категории */
function navigateToCategory(categoryId: string) {
    console.log('Переход к категории:', categoryId)
    router.push(`/catalog/${categoryId}`)
}

// ============ ЖИЗНЕННЫЙ ЦИКЛ ============
onMounted(async () => {
    categories.value = await fetchCategories()
})
</script>
