/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/buttons.ts":
/*!************************!*\
  !*** ./src/buttons.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\ndocument.addEventListener('DOMContentLoaded', () => {\n    const btnBurger = document.querySelector('.burger');\n    const nav = document.querySelector('.main-nav');\n    const btnLogin = document.querySelector('.header__login-btn');\n    const modalWindow = document.querySelector('.auth');\n    const btnCloseModal = document.querySelector('.auth__close');\n    const btnSwitchModal = document.querySelector('.auth__switch-btn');\n    const modalTitle = document.querySelector('.auth__title');\n    const modalBtn = document.querySelector('.auth__btn');\n    const inputEmail = document.querySelector('#user-email');\n    const inputPassword = document.querySelector('#user-password');\n    const modalNote = document.querySelector('.auth__description');\n    //функция переключения модалки\n    function setAuthMode(mode) {\n        const isLogin = mode === 'login';\n        const targetMode = isLogin ? 'login' : 'register';\n        btnSwitchModal.setAttribute('data-target', targetMode);\n        btnSwitchModal.textContent = isLogin ? 'Регистрация' : 'Войти';\n        modalTitle.textContent = isLogin ? 'Вход' : 'Регистрация';\n        modalBtn.textContent = isLogin ? 'Войти' : 'Зарегистрироваться';\n        modalBtn.setAttribute('data-target', targetMode);\n        inputEmail.setAttribute('data-target', targetMode);\n        inputPassword.setAttribute('data-target', targetMode);\n        inputPassword.placeholder = isLogin ? 'Введите пароль' : 'Придумайте пароль';\n        modalNote.textContent = isLogin ? 'Если у Вас еще нет аккаунта' : 'Если у Вас уже есть аккаунт';\n        if (isLogin) {\n            modalWindow.classList.remove('auth--register');\n        }\n        else {\n            modalWindow.classList.add('auth--register');\n        }\n        ;\n    }\n    // активация бургера, открытие навигации\n    if (btnBurger && nav) {\n        btnBurger.onclick = () => {\n            btnBurger.classList.toggle('burger--active');\n            nav.classList.toggle('main-nav--active');\n        };\n    }\n    // открытие модалки\n    if (btnLogin && btnSwitchModal && modalTitle && modalBtn && inputEmail && inputPassword && modalNote && modalWindow) {\n        btnLogin.onclick = () => {\n            modalWindow.classList.toggle('auth--active');\n            setAuthMode('login');\n        };\n    }\n    // закрытие модалки по кнопке\n    if (btnCloseModal) {\n        btnCloseModal.onclick = () => {\n            modalWindow.classList.remove('auth--active');\n        };\n    }\n    // по клику в пустое пространство \n    document.addEventListener('click', (event) => {\n        const target = event.target;\n        // закрытие навигации и бургера\n        if (nav && !nav.contains(target) && btnBurger && !btnBurger.contains(target)) {\n            nav.classList.remove('main-nav--active');\n            btnBurger.classList.remove('burger--active');\n        }\n        // закрытие модалки\n        if (modalWindow && !modalWindow.contains(target) && btnLogin && !btnLogin.contains(target)) {\n            modalWindow.classList.remove('auth--active');\n        }\n    });\n    // переключение модалки\n    if (btnSwitchModal && modalTitle && modalBtn && inputEmail && inputPassword && modalNote && modalWindow) {\n        btnSwitchModal.onclick = () => {\n            const target = btnSwitchModal.getAttribute('data-target');\n            if (target === 'login') {\n                setAuthMode('register');\n            }\n            if (target === 'register') {\n                setAuthMode('login');\n            }\n        };\n    }\n});\n\n\n\n//# sourceURL=webpack://online-store/./src/buttons.ts?\n}");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _buttons__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buttons */ \"./src/buttons.ts\");\n\n\n\n//# sourceURL=webpack://online-store/./src/index.ts?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;