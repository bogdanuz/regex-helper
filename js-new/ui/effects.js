/**
 * RegexHelper v4.0 - UI Effects
 * Header hide/show при скролле
 * @version 1.0
 * @date 12.02.2026
 */

import { throttle } from '../core/utils.js';

/**
 * Инициализирует эффект скрытия/показа header
 * @example
 * initHeaderHideShow();
 */
export function initHeaderHideShow() {
    const header = document.querySelector('.header');
    const threshold = 100;
    let hideTimeout;
    let lastMouseY = 0;

    if (!header) {
        return;
    }

    const throttledUpdate = throttle(updateHeaderVisibility, 100);
    window.addEventListener('scroll', throttledUpdate);

    document.addEventListener('mousemove', function(e) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > threshold && e.clientY < 80 && e.clientY > lastMouseY) {
            clearTimeout(hideTimeout);
            header.classList.add('visible');
            header.classList.remove('hidden');
        } else if (scrollTop > threshold && e.clientY > 80) {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(function() {
                if ((window.pageYOffset || document.documentElement.scrollTop) > threshold) {
                    header.classList.add('hidden');
                    header.classList.remove('visible');
                }
            }, 1000);
        }

        lastMouseY = e.clientY;
    });

    header.addEventListener('mouseenter', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > threshold) {
            clearTimeout(hideTimeout);
            header.classList.add('visible');
            header.classList.remove('hidden');
        }
    });

    header.addEventListener('mouseleave', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > threshold) {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(function() {
                if ((window.pageYOffset || document.documentElement.scrollTop) > threshold) {
                    header.classList.add('hidden');
                    header.classList.remove('visible');
                }
            }, 1000);
        }
    });

    updateHeaderVisibility();
}

/**
 * Обновляет видимость header в зависимости от позиции скролла
 * @example
 * updateHeaderVisibility();
 */
export function updateHeaderVisibility() {
    const header = document.querySelector('.header');
    const threshold = 100;

    if (!header) {
        return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop < threshold) {
        clearTimeout(window.headerHideTimeout);
        header.classList.remove('hidden');
        header.classList.add('visible');
    } else {
        header.classList.add('hidden');
        header.classList.remove('visible');
    }
}
