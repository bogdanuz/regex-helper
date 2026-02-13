/**
 * REGEXHELPER v4.0
 * Header Functionality
 * Module 2: Dropdown interactions
 */

export function initHeader() {
    initDropdown();
    initScrollBehavior();
}

/**
 * Initialize dropdown menu
 */
function initDropdown() {
    const dropdownBtn = document.querySelector('.header__dropdown-btn');
    const dropdownMenu = document.querySelector('.header__dropdown-menu');
    
    if (!dropdownBtn || !dropdownMenu) return;
    
    // Toggle dropdown on click
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dropdownBtn.getAttribute('aria-expanded') === 'true';
        dropdownBtn.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownBtn.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdownBtn.setAttribute('aria-expanded', 'false');
            dropdownBtn.focus();
        }
    });
    
    // Keyboard navigation for menu items
    const menuItems = dropdownMenu.querySelectorAll('.header__dropdown-item');
    menuItems.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextItem = menuItems[index + 1] || menuItems[0];
                nextItem.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
                prevItem.focus();
            }
        });
    });
}

/**
 * Add shadow to header on scroll
 */
function initScrollBehavior() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        // Optional: Hide header on scroll down, show on scroll up
        // Uncomment if needed:
        /*
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.classList.add('header--hidden');
        } else {
            header.classList.remove('header--hidden');
        }
        lastScrollTop = scrollTop;
        */
    });
}
