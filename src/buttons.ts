document.addEventListener('DOMContentLoaded', () => {
  const btnBurger = document.querySelector('.burger') as HTMLButtonElement | null;
  const nav = document.querySelector('.main-nav') as HTMLElement | null;

  const btnLogin = document.querySelector('.header__login-btn') as HTMLButtonElement | null;
  const authModal = document.querySelector('.auth') as HTMLElement | null;
  const btnCloseModal = document.querySelector('.auth__close') as HTMLButtonElement | null;

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

  if (btnCloseModal) {
    btnCloseModal.onclick = () => {
      authModal?.classList.remove('auth--active');
    }
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

  const btnSwitchModal = document.querySelector('.auth__switch-btn') as HTMLButtonElement | null;
  const modalTitle = document.querySelector('.auth__title') as HTMLElement | null;
  const modalBtn = document.querySelector('.auth__btn') as HTMLButtonElement | null;
  const inputEmail = document.querySelector('#user-email') as HTMLInputElement | null;
  const inputPassword = document.querySelector('#user-password') as HTMLInputElement | null;;
  const modalNote = document.querySelector('.auth__description') as HTMLElement | null;;

  if(btnSwitchModal && modalTitle && modalBtn && inputEmail && inputPassword && modalNote) {
    btnSwitchModal.onclick = () => {
      const target = btnSwitchModal.getAttribute('data-target');

      if(target === 'login') {
        btnSwitchModal.setAttribute('data-target', 'register');
        btnSwitchModal.textContent = 'Войти';
        modalTitle.textContent = 'Регистрация';
        modalBtn.textContent = 'Зарегистрироваться';
        modalBtn.setAttribute('data-target', 'register');
        inputEmail.setAttribute('data-target', 'register');
        inputEmail.placeholder = 'Придумайте пароль';
        inputPassword.setAttribute('data-target', 'register');
        modalNote.textContent = 'Если у Вас уже есть аккаунт';
      }

      if(target === 'register') {
        btnSwitchModal.setAttribute('data-target', 'login');
        btnSwitchModal.textContent = 'Регистрация';
        modalTitle.textContent = 'Вход';
        modalBtn.textContent = 'Войти';
        modalBtn.setAttribute('data-target', 'login');
        inputEmail.setAttribute('data-target', 'login');
        inputPassword.setAttribute('data-target', 'login');
        modalNote.textContent = 'Если у Вас еще нет аккаунта';
      }
    }
  }
});