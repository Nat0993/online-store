import {
    addToCart,
    removeFromCart,
    toggleFavorite,
    getCartItemsWithProducts,
    updateCartQuantity,
    loadFromLocalStorage,
} from '../data.js';

function createProductCard(product) {
    const currentFavorites = loadFromLocalStorage('favorites') || [];
    console.log('данные избранного загружены');
    const isFavorite = currentFavorites.some(fav => fav.productId === product.id);

    return `
    <div class="product-card" data-product-id="${product.id}">
            <img class="product-card__image" src="${product.image}" alt="${product.name}" loading="lazy">
            <button class="product-card__favorite ${isFavorite ? 'product-card__favorite--active' : ''}" 
                    type="button" aria-label="Добавить в избранное">
                <svg class="product-card__favorite-icon" width="30" height="30">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-favorite-card"></use>
                </svg>
                <svg class="product-card__favorite-icon product-card__favorite-icon--active" width="30" height="30">
                    <use xlink:href="/src/assets/images/sprite.svg#icon-favorite-card-active"></use>
                </svg>
            </button>
            <h3 class="product-card__title">${product.name}</h3>
            <span class="product-card__price">${product.price.toLocaleString()} ₽</span>
            <div class="product-card__cart-controls">
                <button class="product-card__cart-btn btn" type="button">
                    В корзину
                </button>
            </div>
        </div>
    `;
}

function initProductCard(cardElement) {
    const cartControls = cardElement.querySelector('.product-card__cart-controls');
    const productId = cardElement.dataset.productId;
    const favoriteBtn = cardElement.querySelector('.product-card__favorite');

    // Обработчик кнопки избранного
    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(productId);
        favoriteBtn.classList.toggle('product-card__favorite--active');
        window.dispatchEvent(new CustomEvent('favorites:update'));
    });

    //Функция обновления кнопки корзины
    function updateCartButton() {
        const cartItems = getCartItemsWithProducts();
        const cartItem = cartItems.find(item => item.productId === productId);
        const inCart = Boolean(cartItem);
        const quantity = inCart ? cartItem.quantity : 0;

        if (inCart) {
            console.log('Товар в корзине, показываем счетчик');
            cartControls.innerHTML = `
                <button class="product-card__quantity-btn product-card__quantity-btn--minus" type="button" aria-label="Уменьшить количество">
                    -
                </button>
                <span class="product-card__quantity">${quantity}</span>
                <button class="product-card__quantity-btn product-card__quantity-btn--plus" type="button" aria-label="Увеличить количество">
                    +
                </button>
            `;
            cartControls.classList.add('product-card__cart-controls--active');

            setupCartHandlers();
        } else {
            console.log('Товара нет в корзине, показываем кнопку');
            cartControls.innerHTML = `
                <button class="product-card__cart-btn btn" type="button">
                    В корзину
                </button>
            `;
            cartControls.classList.remove('product-card__cart-controls--active');

            setupAddToCartHandler();
        }
    }

    //Функция для обработки добавления в корзину
    function setupAddToCartHandler() {
        const cartBtn = cartControls.querySelector('.product-card__cart-btn');

        cartBtn.addEventListener('click', () => {
            addToCart(productId);
            updateCartButton();
            window.dispatchEvent(new CustomEvent('cart:update'));
        });
    }

    //Функция для обработки изменения количества
    function setupCartHandlers() {
        const minusBtn = cartControls.querySelector('.product-card__quantity-btn--minus');
        const plusBtn = cartControls.querySelector('.product-card__quantity-btn--plus');

        minusBtn.addEventListener('click', () => {
            const cartItems = getCartItemsWithProducts();
            const cartItem = cartItems.find(item => item.productId === productId);

            if (cartItem) {
                updateCartQuantity(cartItem.id, cartItem.quantity - 1);
                updateCartButton();
                window.dispatchEvent(new CustomEvent('cart:update'));
            }
        });

        plusBtn.addEventListener('click', () => {
            addToCart(productId, 1);
            updateCartButton();
            window.dispatchEvent(new CustomEvent('cart:update'));
        });
    }

    updateCartButton();
}

export function renderProductCard(product) {
    const cardContainer = document.createElement('div');
    cardContainer.innerHTML = createProductCard(product);

    const cardElement = cardContainer.firstElementChild;

    initProductCard(cardElement);

    return cardElement;
}