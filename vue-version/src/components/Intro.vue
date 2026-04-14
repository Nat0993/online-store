<template>
  <section class="intro">
    <div class="container">
      <div class="intro__wrap">
        <picture>
          <img 
            class="intro__img" 
            src="/src/assets/images/intro-img.png" 
            alt="Изображение кресла"
          >
        </picture>
        <h1 class="intro__title">
          <span class="intro__title-text intro__title-text--left intro__title-top">
            Магазин
          </span>
          <span class="intro__title-text intro__title-text--right intro__title-central">
            готовой
          </span>
          <span class="intro__title-text intro__title-text--left intro__title-text--bottom">
            мебели
          </span>
        </h1>
      </div>
      <span class="intro__description">создаем ваш уют</span>
      <router-link   
        to="/catalog" 
        class="intro__btn-link btn"
      >
        Перейти в каталог
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
// Нет логики — только разметка
// Навигация работает через глобальный initSPANavigation()
</script>