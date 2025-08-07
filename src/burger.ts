const btnBurger = document.querySelector('.burger') as HTMLButtonElement | null;
const nav = document.querySelector('.main-nav') as HTMLDivElement | null;

if (btnBurger && nav) {
    btnBurger.onclick = () => {
        btnBurger.classList.toggle('burger--active')
        nav.classList.toggle('main-nav--active');
    }
    
    document.addEventListener('click', (event) => {
        const target = event.target as Node;
        if (
          !btnBurger.contains(target) &&
          !nav.contains(target)
        ) {
          btnBurger.classList.remove('burger--active');
          nav.classList.remove('main-nav--active');
        }
      });
};





