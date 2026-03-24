<template>
  <section class="portfolio">
    <div class="container">
      <h2 class="portfolio__title">Наши работы в ваших интерьерах</h2>
      <ul class="portfolio__list">
        <li 
          v-for="image in portfolioImages" 
          :key="`portfolio-${image.src}`"
          class="portfolio__item"
        >
          <picture>
            <img 
              class="portfolio__img" 
              :src="image.src" 
              :alt="image.alt"
              loading="lazy"
            >
          </picture>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
// ============ ТИПЫ ============

interface PortfolioImage {
  src: string
  alt: string
}

// ============ КОНСТАНТЫ ============

const portfolioImages: PortfolioImage[] = [
  {
    src: '/src/assets/images/portfolio-img-1.png',
    alt: 'Мебель в интерьере'
  },
  {
    src: '/src/assets/images/portfolio-img-2.jpg',
    alt: 'Мебель в интерьере'
  },
  {
    src: '/src/assets/images/portfolio-img-3.jpg',
    alt: 'Мебель в интерьере'
  },
  {
    src: '/src/assets/images/portfolio-img-4.jpg',
    alt: 'Мебель в интерьере'
  },
  {
    src: '/src/assets/images/portfolio-img-5.jpg',
    alt: 'Мебель в интерьере'
  }
]
</script>