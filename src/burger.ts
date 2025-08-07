const btnBurger = document.querySelector('.burger') as HTMLButtonElement | null;
const nav = document.querySelector('.main-nav') as HTMLDivElement | null;

if (btnBurger && nav) {
    btnBurger.onclick = () => {
        btnBurger.classList.toggle('burger--active')
        nav.classList.toggle('main-nav--active');
    }
};

