<template>
    <div class="empty-message">
        <div class="page-header">
            <h3 class="page-header__title">{{ title }}</h3>
            <span class="page-header__description">{{ description }}</span>
        </div>
        <a 
            :href="link.href" 
            class="empty-message__btn btn"
            @click.prevent="navigate"
        >
            {{ link.label }}
        </a>
    </div>
</template>

<script setup lang="ts">
import type { NavLink } from '../types/index';

const props = defineProps<{
title: string;
description: string;
link: NavLink;
}>()

const navigate = () => {
    window.history.pushState({}, '', props.link.href);
    window.dispatchEvent(new PopStateEvent('popstate'));
}
</script>