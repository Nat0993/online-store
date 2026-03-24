<template>
    <footer class="footer">
    <div class="container">
      <div class="footer__wrapper">
        <div class="footer__info">
          <!-- Левая колонка: навигация -->
          <div class="footer__left-col">
            <ul class="footer__nav-list">
              <li 
                v-for="link in navLinks" 
                :key="`nav-${link.href}`"
                class="footer__nav-item"
              >
                <a :href="link.href" class="footer__nav-link footer__text">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Логотип (центр) -->
          <a 
            class="footer__logo-link" 
            href="/"
            aria-label="Логотип компании, переход на главную страницу"
          >
            <svg width="70" height="70" aria-hidden="true">
              <use xlink:href="/src/assets/images/sprite.svg#icon-logo"></use>
            </svg>
          </a>

          <!-- Правая колонка: контакты и соцсети -->
          <div class="footer__right-col">
            <!-- Контактная информация -->
            <div class="footer__inner">
              <span class="footer__text">Мы всегда на связи:</span>
              <a 
                class="footer__phone-link" 
                :href="`tel:${companyPhoneClean}`"
                aria-label="Звонок в компанию"
              >
                <svg width="20" height="20" aria-hidden="true">
                  <use xlink:href="/src/assets/images/sprite.svg#icon-phone"></use>
                </svg>
                {{ companyPhone }}
              </a>
            </div>

            <!-- Социальные сети -->
            <div class="footer__inner">
              <span class="footer__text">Мы в социальных сетях:</span>
              <ul class="social">
                <li 
                  v-for="social in socialLinks" 
                  :key="`social-${social.icon}`"
                  class="social__item"
                >
                  <a 
                    :href="social.href" 
                    class="social__link" 
                    :aria-label="social.label"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="30" height="30" aria-hidden="true">
                      <use :xlink:href="`/src/assets/images/sprite.svg#icon-${social.icon}`"></use>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Копирайт -->
        <span class="footer__copyright">
          &copy; {{ currentYear }} {{ companyName }}. Все права защищены
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NavLink, SocialLink } from '../types/index';

// ============ КОНСТАНТЫ ============

/** Навигационные ссылки */
const navLinks: NavLink[] = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/delivery', label: 'Доставка и оплата' },
  { href: '/sales', label: 'Акции' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/contacts', label: 'Контакты' }
]

/** Ссылки на социальные сети */
const socialLinks: SocialLink[] = [
  { href: '#', icon: 'vk', label: 'VK' },
  { href: '#', icon: 'tg', label: 'Telegram' },
  { href: '#', icon: 'whatsapp', label: 'WhatsApp' },
  { href: '#', icon: 'email', label: 'Почта' }
]

/** Номер телефона для отображения */
const companyPhone = '8 (800) 88 00 80 00'

/** Номер телефона для ссылки tel: (только цифры) */
const companyPhoneClean = '880088008000'

/** Название компании */
const companyName = '"FURNITURE"'

// ============ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ============

/** Текущий год */
const currentYear = computed(() => new Date().getFullYear())

</script>