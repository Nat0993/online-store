interface PortfolioImage {
    src: string;
    alt: string;
    description?: string; // опционально для будущего
}

/**
 * Создает HTML-разметку секции портфолио
 * @returns {string} HTML-строка с разметкой портфолио
 */
function createPortfolio (): string {
    const images: PortfolioImage[] = [
        { 
            src: '/src/assets/images/portfolio-img-1.png', 
            alt: 'Мебель в интерьере' 
        },
        { 
            src: '/src/assets/images/portfolio-img-2.jpg', 
            alt: 'Мебель в интерьере' 
        },
        { 
            src: '/src/assets/images/portfolio-img-3.jpg', 
            alt: 'Мебель в интерьере' 
        },
        { 
            src: '/src/assets/images/portfolio-img-4.jpg', 
            alt: 'Мебель в интерьере' 
        },
        { 
            src: '/src/assets/images/portfolio-img-5.jpg', 
            alt: 'Мебель в интерьере' 
        }
    ];

    const itemsHtml = images.map(img => `
        <li class="portfolio__item">
            <picture>
                <img class="portfolio__img" src="${img.src}" alt="${img.alt}">
            </picture>
        </li>
    `).join('');

    return `
    <section class="portfolio">
        <div class="container">
            <h2 class="portfolio__title">Наши работы в ваших интерьерах</h2>
            <ul class="portfolio__list">${itemsHtml}</ul>
        </div>
    </section>`;
};

/**
 * Инициализирует обработчики событий для элементов портфолио
 * @param {HTMLElement} portfolioContainer - Контейнер портфолио
 */
function initPortfolio (portfolioContainer: HTMLElement): void {
    const portfolioItems = portfolioContainer.querySelectorAll<HTMLElement>('.portfolio__item');

    if (!portfolioItems.length) {
        console.warn('Элементы портфолио не найдены');
        return;
    }

    portfolioItems.forEach(item => {
        item.addEventListener('click', (e: Event) => {
            e.preventDefault();
            //будет добавлено открытие полноразмерного изображения по клику, но это не точно
        })
    });
};

/**
 * Рендерит секцию портфолио с примерами работ
 * @returns {HTMLElement} DOM-элемент секции портфолио
 */
export function renderPortfolio (): HTMLElement {
    const portfolioContainer = document.createElement('div');
    portfolioContainer.innerHTML = createPortfolio();
    initPortfolio(portfolioContainer);
    return portfolioContainer;
};