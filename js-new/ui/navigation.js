/**
 * RegexHelper v4.0 - UI Navigation
 * Smooth scroll, кнопка "Наверх", навигация
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Инициализирует smooth scroll для навигационных ссылок
 * @example
 * initNavigation();
 */
export function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            scrollToElement(targetId);
        });
    });
}

/**
 * Инициализирует кнопку "Прокрутить наверх"
 * @example
 * initScrollTopBtn();
 */
export function initScrollTopBtn() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollTopBtn) {
        return;
    }
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Прокручивает страницу к элементу с указанным ID
 * @param {string} elementId - ID целевого элемента
 * @example
 * scrollToElement('inputPanel');
 */
export function scrollToElement(elementId) {
    const targetElement = document.getElementById(elementId);
    
    if (!targetElement) {
        console.warn(`scrollToElement: элемент #${elementId} не найден`);
        return;
    }
    
    targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
