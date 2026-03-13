<template>
    <div class="page-header">
        <h1 class="page-header__title">{{ title }}</h1>
        <span class="page-header__description">{{ description }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
}>();
</script>