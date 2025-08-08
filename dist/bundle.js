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

eval("{__webpack_require__.r(__webpack_exports__);\ndocument.addEventListener('DOMContentLoaded', () => {\n    const btnBurger = document.querySelector('.burger');\n    const nav = document.querySelector('.main-nav');\n    const btnLogin = document.querySelector('#login-btn');\n    const authModal = document.querySelector('.auth');\n    const btnCloseModal = document.querySelector('.auth__close');\n    if (btnBurger && nav) {\n        btnBurger.onclick = () => {\n            btnBurger.classList.toggle('burger--active');\n            nav.classList.toggle('main-nav--active');\n        };\n    }\n    if (btnLogin && authModal) {\n        btnLogin.onclick = () => {\n            authModal.classList.toggle('auth--active');\n        };\n    }\n    if (btnCloseModal) {\n        btnCloseModal.onclick = () => {\n            authModal === null || authModal === void 0 ? void 0 : authModal.classList.remove('auth--active');\n        };\n    }\n    document.addEventListener('click', (event) => {\n        const target = event.target;\n        // закрытие навигации и бургера\n        if (nav && !nav.contains(target) && btnBurger && !btnBurger.contains(target)) {\n            nav.classList.remove('main-nav--active');\n            btnBurger.classList.remove('burger--active');\n        }\n        // закрытие модалки\n        if (authModal && !authModal.contains(target) && btnLogin && !btnLogin.contains(target)) {\n            authModal.classList.remove('auth--active');\n        }\n    });\n});\n\n\n\n//# sourceURL=webpack:///./src/buttons.ts?\n}");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _buttons__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buttons */ \"./src/buttons.ts\");\n\n\n\n//# sourceURL=webpack:///./src/index.ts?\n}");

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