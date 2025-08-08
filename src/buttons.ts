document.addEventListener('DOMContentLoaded', () => {
  const btnBurger = document.querySelector('.burger') as HTMLButtonElement | null;
  const nav = document.querySelector('.main-nav') as HTMLElement | null;

  const btnLogin = document.querySelector('.header__login-btn') as HTMLButtonElement | null;
  const modalWindow = document.querySelector('.auth') as HTMLElement | null;
  const btnCloseModal = document.querySelector('.auth__close') as HTMLButtonElement | null;

  const btnSwitchModal = document.querySelector('.auth__switch-btn') as HTMLButtonElement | null;
  const modalTitle = document.querySelector('.auth__title') as HTMLElement | null;
  const modalBtn = document.querySelector('.auth__btn') as HTMLButtonElement | null;
  const inputEmail = document.querySelector('#user-email') as HTMLInputElement | null;
  const inputPassword = document.querySelector('#user-password') as HTMLInputElement | null;
  const modalNote = document.querySelector('.auth__description') as HTMLElement | null;

    //функция переключения модалки
  function setAuthMode(mode: 'login' | 'register') {
    const isLogin = mode === 'login';
    const targetMode = isLogin ? 'login' : 'register';

    btnSwitchModal!.setAttribute('data-target', targetMode);
    btnSwitchModal!.textContent = isLogin? 'Регистрация' : 'Войти';
    modalTitle!.textContent = isLogin? 'Вход' : 'Регистрация';
    modalBtn!.textContent = isLogin? 'Войти' : 'Зарегистрироваться';
    modalBtn!.setAttribute('data-target', targetMode);
    inputEmail!.setAttribute('data-target', targetMode);
    inputPassword!.setAttribute('data-target', targetMode);
    inputPassword!.placeholder = isLogin? 'Введите пароль' : 'Придумайте пароль';
    modalNote!.textContent = isLogin? 'Если у Вас еще нет аккаунта' : 'Если у Вас уже есть аккаунт';
    
    if (isLogin) {
      modalWindow!.classList.remove('auth--register')
    } else {
      modalWindow!.classList.add('auth--register');
    };
  }


     // активация бургера, открытие навигации
  if (btnBurger && nav) {
    btnBurger.onclick = () => {
      btnBurger.classList.toggle('burger--active')
      nav.classList.toggle('main-nav--active');
    };
  }
    // открытие модалки
  if (btnLogin && btnSwitchModal && modalTitle && modalBtn && inputEmail && inputPassword && modalNote && modalWindow) {
    btnLogin.onclick = () => {
      modalWindow.classList.toggle('auth--active');

      setAuthMode('login');
    };
  }
    // закрытие модалки по кнопке
  if (btnCloseModal) {
    btnCloseModal.onclick = () => {
      modalWindow!.classList.remove('auth--active');
    }
  }
    // по клику в пустое пространство 
  document.addEventListener('click', (event) => {
    const target = event.target as Node;

    // закрытие навигации и бургера
    if (nav && !nav.contains(target) && btnBurger && !btnBurger.contains(target)) {
      nav.classList.remove('main-nav--active');
      btnBurger.classList.remove('burger--active');
    }

    // закрытие модалки
    if (modalWindow && !modalWindow.contains(target) && btnLogin && !btnLogin.contains(target)) {
      modalWindow.classList.remove('auth--active');
    }
  });

    // переключение модалки
  if (btnSwitchModal && modalTitle && modalBtn && inputEmail && inputPassword && modalNote && modalWindow) {
    btnSwitchModal.onclick = () => {
      const target = btnSwitchModal.getAttribute('data-target');

      if (target === 'login') {
        setAuthMode('register');
      }

      if (target === 'register') {
        setAuthMode('login');
      }
    }
  }
});
