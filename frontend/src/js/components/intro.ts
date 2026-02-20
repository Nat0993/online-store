//Отрисовка разметки
function createIntro(): string {
    return `
    <section class="intro">
            <div class="container">
                <div class="intro__wrap">
                    <picture>
                        <img class="intro__img" src="/src/assets/images/intro-img.png" alt="Изображение кресла">
                    </picture>
                    <h1 class="intro__title">
                        <span class="intro__title-text intro__title-text--left intro__title-top">Магазин</span>
                        <span class="intro__title-text intro__title-text--right intro__title-central">готовой</span>
                        <span class="intro__title-text intro__title-text--left intro__title-text--bottom">мебели</span>
                    </h1>
                </div>
                <span class="intro__description">создаем ваш уют</span>
                <button class="intro__btn-link btn" type="button">Перейти в каталог</button>
            </div>
        </section>
    `
};


/**
 * Инициализирует логику интро-секции (навигация по кнопке)
 * @param {HTMLElement} introContainer - контейнер интро-секции
 */
function initIntro (introContainer: HTMLElement): void {
    const introBtn = introContainer.querySelector<HTMLButtonElement>('.intro__btn-link');

    if (!introBtn) {
        console.warn('Кнопка интро не найдена');
        return;
    }

    introBtn.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        console.log('Переход в каталог');
        
        window.history.pushState({}, '', '/catalog');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
};

/**
 * Рендерит интро-секцию главной страницы
 * @returns {HTMLElement} DOM-элемент интро-секции
 */
export function renderIntro (): HTMLElement {
    const introContainer = document.createElement('div');
    introContainer.innerHTML = createIntro();
    initIntro(introContainer);
    return introContainer;
}