<template>
    <button 
        class="category-card" 
        :data-category-id="category.id"
        type="button" 
        :aria-label="`Перейти к категории ${category.name}`"
        @click="$emit('click')"
    >
        <img 
            class="category-card__image" 
            :src="category.image || ''" 
            :alt="category.name"
            loading="lazy"
        />
        <div class="category-card__content">
            <h2 class="category-card__title">{{ category.name }}</h2>
            <p class="category-card__description">{{ category.description || '' }}</p>
        </div>
    </button>
</template>

<script setup lang="ts">
import type { Category } from '@/types'

defineProps<{
    category: Category
}>()

defineEmits<{
    (e: 'click'): void
}>()
</script>