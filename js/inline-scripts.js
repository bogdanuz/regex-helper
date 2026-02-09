/* ============================================
   INLINE SCRIPTS
   Скрипты для навигации и UI эффектов
   ============================================ */

// Smooth scroll для навигации
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Кнопка "Наверх"
const scrollTopBtn = document.getElementById('scrollTopBtn');

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

// Header Hide/Show
const header = document.querySelector('.header');
const threshold = 100;
let hideTimeout;
let lastMouseY = 0;

function updateHeaderVisibility() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop <= threshold) {
        clearTimeout(hideTimeout);
        header.classList.remove('hidden');
        header.classList.add('visible');
    } else {
        header.classList.add('hidden');
        header.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateHeaderVisibility);

document.addEventListener('mousemove', function(e) {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > threshold && e.clientY < 80 && e.clientY < lastMouseY) {
        clearTimeout(hideTimeout);
        header.classList.add('visible');
        header.classList.remove('hidden');
    } else if (scrollTop > threshold && e.clientY > 80) {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(function() {
            if (window.pageYOffset > threshold) {
                header.classList.add('hidden');
                header.classList.remove('visible');
            }
        }, 1000);
    }
    
    lastMouseY = e.clientY;
});

header.addEventListener('mouseenter', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > threshold) {
        clearTimeout(hideTimeout);
        header.classList.add('visible');
        header.classList.remove('hidden');
    }
});

header.addEventListener('mouseleave', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > threshold) {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(function() {
            if (window.pageYOffset > threshold) {
                header.classList.add('hidden');
                header.classList.remove('visible');
            }
        }, 1000);
    }
});

updateHeaderVisibility();

console.log('✓ Inline scripts loaded');
