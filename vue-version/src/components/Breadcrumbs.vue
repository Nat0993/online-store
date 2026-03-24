<template>
    <nav class="breadcrumbs" aria-label="Хлебные крошки">
        <template v-for="(link, index) in validLinks" :key="`breadcrumb-${index}`">
            <span
            v-if="index > 0"
            class="breadcrumbs__separator breadcrumbs__text">
            /
            </span>

            <a 
            v-if="link.url"
            :href="link.url"
            class="breadcrumbs__link breadcrumbs__text"
            @click.prevent="navigate">
            {{ link.text }}
            </a>

            <span
            v-else
            class="breadcrumbs__current breadcrumbs__text">
            {{ link.text }}
            </span>
        </template>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { BreadcrumbLink } from '../types/index';

const props = defineProps<{
    links: BreadcrumbLink[]
}>()

const validLinks = computed(() => {
    return props.links.filter(link => {
        return link !== null &&
        link !== undefined &&
        typeof link.text === 'string'
    })
})

const navigate = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLAnchorElement
  const href = target.getAttribute('href')
  
  if (href) {
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}
</script>