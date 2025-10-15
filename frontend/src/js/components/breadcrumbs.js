function createBreadcrumbs(links) {
    return `
        <nav class="breadcrumbs" aria-label="Хлебные крошки">
            ${links.map((link, index) => 
                `${index > 0 ? '<span class="breadcrumbs__separator breadcrumbs__text">/</span>' : ''}${
                    link.url 
                        ? `<a href="${link.url}" class="breadcrumbs__link breadcrumbs__text">${link.text}</a>`
                        : `<span class="breadcrumbs__current breadcrumbs__text">${link.text}</span>`
                }`
            ).join('')}
        </nav>
    `;
}

export function renderBreadcrumbs (links) {
    const breadcrumbsContainer = document.createElement('div');
    breadcrumbsContainer.innerHTML = createBreadcrumbs(links);

    return breadcrumbsContainer;
}