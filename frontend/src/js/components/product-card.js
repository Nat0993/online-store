import {
    addToCart,
    removeFromCart,
    toggleFavorite,
    isInFavorites,
    getCartItemsWithProducts,
    updateCartQuantity,
} from '../data.js';

export function createProductCard(product) {
    const isFavorite = isInFavorites(product.id);

    return `
    <div class="product-card" data-product-id="${product.id}">
            <div class="product-card__image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <button class="product-card__favorite ${isFavorite ? 'product-card__favorite--active' : ''}" 
                        type="button" aria-label="Добавить в избранное">
                    <svg width="20" height="20" aria-hidden="true">
                        <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-favorite"></use>
                    </svg>
                </button>
            </div>
            <div class="product-card__content">
                <h3 class="product-card__title">${product.name}</h3>
                <p class="product-card__description">${product.description}</p>
                <div class="product-card__bottom">
                    <span class="product-card__price">${product.price.toLocaleString()} ₽</span>
                    <div class="product-card__cart-controls">
                        <button class="product-card__cart-btn btn" type="button">
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initProductCard (cardElement) {
    const favoriteBtn = cardElement.querySelector('.product-card__favorite');
    const cartControls = cardElement.querySelector('.product-card__cart-controls');
    const productId = cardElement.dataset.productId;

    //Обработчик избранного
    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(productId);
        favoriteBtn.classList.toggle('product-card__favorite--active');
        window.dispatchEvent(new CustomEvent('favorites:update'));
    });

    //Функция обновления кнопки корзины
    function updateCartButton () {
        const cartItems = getCartItemsWithProducts();
        const cartItem = cartItems.find(item => item.productId === productId);
        const inCart = Boolean(cartItem);
        const quantity = inCart ? cartItem.quantity : 0;

        if(inCart) {
            cartControls.innerHTML = `
                <button class="product-card__quantity-btn product-card__quantity-btn--minus" type="button" aria-label="Уменьшить количество">
                    <svg width="16" height="16" aria-hidden="true">
                        <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-minus"></use>
                    </svg>
                </button>
                <span class="product-card__quantity">${quantity}</span>
                <button class="product-card__quantity-btn product-card__quantity-btn--plus" type="button" aria-label="Увеличить количество">
                    <svg width="16" height="16" aria-hidden="true">
                        <use xlink:href="/frontend/src/assets/images/sprite.svg#icon-plus"></use>
                    </svg>
                </button>
            `;
            cartControls.classList.add('product-card__cart-controls--active');

            setupCartHandlers();
        } else {
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
    function setupCartHandlers () {
        const minusBtn = cartControls.querySelector('.product-card__quantity-btn--minus');
        const plusBtn = cartControls.querySelector('.product-card__quantity-btn--plus');

        minusBtn.addEventListener('click', () => {
            const cartItems = getCartItemsWithProducts();
            const cartItem = cartItems.find(item => item.productId === productId);

            if(cartItem) {
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