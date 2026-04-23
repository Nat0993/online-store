<template>
    <div class="page-header">
        <h1 class="page-header__title">{{ title }}</h1>
        <span 
            class="page-header__description" 
            :class="{ 'page-header__description--updating': isUpdating }"
        >
            {{ description }}
        </span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
    isUpdating?: boolean;
}>();
</script>