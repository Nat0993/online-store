//Отрисовка разметки
function createIntro() {
    return `
    <section class="intro">
            <div class="container">
                <div class="intro__wrap">
                    <picture>
                        <img class="intro__img" src="../src/assets/images/intro-img.png" alt="Изображение кресла" width="200"
                            height="350">
                    </picture>
                    <h1 class="intro__title">
                        <span class="intro__title-text intro__title-text--left intro__title-top">Магазин</span>
                        <span class="intro__title-text intro__title-text--right intro__title-central">готовой</span>
                        <span class="intro__title-text intro__title-text--left intro__title-text--bottom">мебели</span>
                    </h1>
                </div>
                <span class="intro__description">создаем ваш уют</span>
                <a class="intro__btn-link btn" href="#">Перейти в каталог</a>
            </div>
        </section>
    `
};


//Подключение логики 
function initIntro (introContainer) {
    const introBtn = introContainer.querySelector('.intro__btn-link');

    introBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Переход в каталог');
        //здесь будет логика перехода
    });
};

export function renderIntro () {
    const introContainer = document.createElement('div');
    introContainer.innerHTML = createIntro();
    initIntro(introContainer);
    return introContainer;
}