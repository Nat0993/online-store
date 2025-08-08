document.addEventListener('DOMContentLoaded', () => {
  const btnBurger = document.querySelector('.burger') as HTMLButtonElement | null;
  const nav = document.querySelector('.main-nav') as HTMLElement | null;
  const btnLogin = document.querySelector('#login-btn') as HTMLButtonElement | null;
  const authModal = document.querySelector('.auth') as HTMLElement | null;

  if (btnBurger && nav) {
    btnBurger.onclick = () => {
      btnBurger.classList.toggle('burger--active')
      nav.classList.toggle('main-nav--active');
    };
  }

  if (btnLogin && authModal) {
    btnLogin.onclick = () => {
      authModal.classList.toggle('auth--active');
    };
  }

  document.addEventListener('click', (event) => {
    const target = event.target as Node;

    // закрытие навигации и бургера
    if (nav && !nav.contains(target) && btnBurger && !btnBurger.contains(target)) {
      nav.classList.remove('main-nav--active');
      btnBurger.classList.remove('burger--active');
    }

    // закрытие модалки
    if (authModal && !authModal.contains(target) && btnLogin && !btnLogin.contains(target)) {
      authModal.classList.remove('auth--active');
    }
  });
});