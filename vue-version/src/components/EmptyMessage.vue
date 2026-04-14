<template>
    <div class="empty-message">
        <div class="page-header">
            <h3 class="page-header__title">{{ title }}</h3>
            <span class="page-header__description">{{ description }}</span>
        </div>
        <router-link 
            to="link.href" 
            class="empty-message__btn btn"
        >
            {{ link.label }}
        </router-link>
    </div>
</template>

<script setup lang="ts">
import type { NavLink } from '../types/index';

const props = defineProps<{
title: string;
description: string;
link: NavLink;
}>()

</script>