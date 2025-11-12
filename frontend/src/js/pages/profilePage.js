
/**
 * Рендерит страницу личного кабинета пользователя
 * @returns {HTMLElement} DOM-элемент страницы профиля
 */
export function renderProfilePage () {
    const page = document.createElement('div');
    page.className = 'profile-page';

    page.innerHTML = `<h1>Личный кабинет</h1>
            <p>Здесь будет информация о пользователе, история заказов и т.д.</p>`;
    
    return page;
}