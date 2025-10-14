//Отрисовка
function createPortfolio () {
    return `
    <section class="portfolio">
            <div class="container">
                <h2 class="portfolio__title">Наши работы в ваших интерьерах</h2>
                <ul class="portfolio__list">
                    <li class="portfolio__item">
                        <picture>
                            <img class="portfolio__img" src="/src/assets/images/portfolio-img-1.png" alt="Мебель в интерьере"
                                width="600" height="350">
                        </picture>
                    </li>
                    <li class="portfolio__item">
                        <picture>
                            <img class="portfolio__img" src="/src/assets/images/portfolio-img-2.jpg" alt="Мебель в интерьере"
                                width="600" height="350">
                        </picture>
                    </li>
                    <li class="portfolio__item">
                        <picture>
                            <img class="portfolio__img" src="/src/assets/images/portfolio-img-3.jpg" alt="Мебель в интерьере"
                                width="600" height="350">
                        </picture>
                    </li>
                    <li class="portfolio__item">
                        <picture>
                            <img class="portfolio__img" src="/src/assets/images/portfolio-img-4.jpg" alt="Мебель в интерьере"
                                width="600" height="350">
                        </picture>
                    </li>
                    <li class="portfolio__item">
                        <picture>
                            <img class="portfolio__img" src="/src/assets/images/portfolio-img-5.jpg" alt="Мебель в интерьере"
                                width="600" height="350">
                        </picture>
                    </li>
                </ul>
            </div>
        </section>
    `
};

function initPortfolio (portfolioContainer) {
    const portfolioItems = portfolioContainer.querySelectorAll('.portfolio__item');

    portfolioItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            //будет добавлено открытие полноразмерного изображения по клику, но это не точно
        })
    });
};

export function renderPortfolio () {
    const portfolioContainer = document.createElement('div');
    portfolioContainer.innerHTML = createPortfolio();
    initPortfolio(portfolioContainer);
    return portfolioContainer;
};