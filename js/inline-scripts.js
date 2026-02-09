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

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ МОДАЛОК
   ============================================ */

/**
 * Открыть модальное окно
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Закрыть модальное окно
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Закрыть регламент
 */
function closeRegulationsModal() {
    closeModal('regulationsModal');
}

/**
 * Закрыть настройки триггера
 */
function closeTriggerSettingsModal() {
    closeModal('triggerSettingsModal');
}

/**
 * Закрыть настройки группы
 */
function closeGroupSettingsModal() {
    closeModal('groupSettingsModal');
}

/* ============================================
   ПОДТВЕРЖДЕНИЕ ОЧИСТКИ
   ============================================ */

let confirmCallback = null;

/**
 * Показать модалку подтверждения
 */
function showConfirm(title, text, onYes) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalText').textContent = text;
    confirmCallback = onYes;
    openModal('confirmModal');
}

/**
 * Подтверждение очистки простых триггеров
 */
function confirmClearSimpleTriggers() {
    showConfirm(
        'Очистить триггеры?',
        'Все введенные триггеры будут удалены. Продолжить?',
        () => {
            document.getElementById('simpleTriggers').value = '';
            updateSimpleTriggerCount();
            closeModal('confirmModal');
        }
    );
}

/**
 * Подтверждение очистки результата
 */
function confirmClearResult() {
    showConfirm(
        'Очистить результат?',
        'Сгенерированное regex будет удалено. Продолжить?',
        () => {
            document.getElementById('resultRegex').value = '';
            document.getElementById('regexLength').textContent = 'Длина: 0 символов';
            document.getElementById('resultStats').style.display = 'none';
            closeModal('confirmModal');
        }
    );
}

/* ============================================
   EVENT LISTENERS ДЛЯ МОДАЛОК
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // Регламент
    const regulationsBtn = document.getElementById('regulationsBtn');
    if (regulationsBtn) {
        regulationsBtn.addEventListener('click', () => openModal('regulationsModal'));
    }
    
    // Кнопки помощи по панелям
    document.getElementById('inputHelpBtn')?.addEventListener('click', () => showPanelHelp('input'));
    document.getElementById('optimizationHelpBtn')?.addEventListener('click', () => showPanelHelp('optimization'));
    document.getElementById('resultHelpBtn')?.addEventListener('click', () => showPanelHelp('result'));
    
    // Подтверждение
    document.getElementById('confirmModalYes')?.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
    });
    document.getElementById('confirmModalNo')?.addEventListener('click', () => {
        closeModal('confirmModal');
    });
    
    // Закрытие модалок по клику на overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Закрытие модалок по кнопке ×
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
});

/* ============================================
   ПОМОЩЬ ПО ПАНЕЛЯМ
   ============================================ */

function showPanelHelp(panelType) {
    const content = getPanelHelpContent(panelType);
    document.getElementById('panelHelpTitle').textContent = content.title;
    document.getElementById('panelHelpContent').innerHTML = content.html;
    openModal('panelHelpModal');
}

function getPanelHelpContent(panelType) {
    const helpContent = {
        'input': {
            title: 'Помощь: Панель 1 - Триггеры',
            html: `
                <h4>Простые триггеры</h4>
                <p>Введите триггеры (каждый с новой строки). Максимум 200 триггеров.</p>
                
                <h4>Доступные настройки:</h4>
                <ul>
                    <li><strong>Глобальные</strong> (панель 2) — применяются ко ВСЕМ триггерам</li>
                    <li><strong>Индивидуальные</strong> (кнопка ⚙) — для КОНКРЕТНОГО триггера</li>
                </ul>
                
                <h4>Автоматические правила:</h4>
                <div class="warning-box">
                    ⚠️ <strong>Границы \\b</strong> добавляются автоматически для триггеров ≤ 3 символов.<br>
                    Пример: <code>"кот"</code> → <code>\\bкот\\b</code>
                </div>
                
                <h4>Связанные триггеры:</h4>
                <p>Используйте для создания комбинаций триггеров с расстоянием между ними.</p>
                <div class="example-box">
                    <strong>Пример:</strong> "выкуп" + "дорого" → <code>выкуп.{1,7}дорого</code>
                </div>
            `
        },
        'optimization': {
            title: 'Помощь: Панель 2 - Оптимизация',
            html: `
                <h4>Глобальные оптимизации</h4>
                <p>Выберите оптимизации, которые будут применены ко ВСЕМ триггерам.</p>
                
                <h4>Типы оптимизаций:</h4>
                
                <div class="regulation-section">
                    <h5>1. Вариации букв (латиница ↔ кириллица)</h5>
                    <p>Заменяет похожие символы латиницы и кириллицы.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> test → <code>[tт][eе][sѕ][tт]</code>
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>2. Опциональные буквы (окончания)</h5>
                    <p>Группирует триггеры с общим началом.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> слон, слоны → <code>слон(ы)?</code>
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>3. Склонения (русские падежи)</h5>
                    <p>Автоматически генерирует все падежные формы русских слов.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> дрон → <code>дрон(а|у|ом|е|ов|ам|ами|ах)</code>
                    </div>
                    <div class="warning-box">
                        ⚠️ <strong>Важно:</strong> Использует круглые скобки <code>()</code> для многобуквенных окончаний!
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>4. Опциональный символ ?</h5>
                    <p>Находит триггеры, отличающиеся на одну букву.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> пассивный, пасивный → <code>пасс?ивный</code>
                    </div>
                </div>
                
                <h4>Если все отключены:</h4>
                <p>Триггеры будут объединены через <code>|</code> (альтернация) без оптимизаций.</p>
                <div class="example-box">
                    <strong>Пример:</strong> дрон, беспилотник → <code>дрон|беспилотник</code>
                </div>
                
                <div class="info-box">
                    💡 <strong>Совет:</strong> Для индивидуальных настроек конкретного триггера используйте кнопку ⚙ в панели 1.
                </div>
            `
        },
        'result': {
            title: 'Помощь: Панель 3 - Результат',
            html: `
                <h4>Регулярное выражение</h4>
                <p>Здесь отображается сгенерированное regex после конвертации.</p>
                
                <h4>Статистика:</h4>
                <ul>
                    <li><strong>Длина:</strong> количество символов в regex</li>
                    <li><strong>Оригинальных триггеров:</strong> количество введенных триггеров</li>
                    <li><strong>Удалено дубликатов:</strong> количество повторяющихся триггеров</li>
                </ul>
                
                <h4>Действия:</h4>
                <ul>
                    <li><strong>📋 Копировать</strong> — скопировать regex в буфер обмена</li>
                    <li><strong>🧪 Тестер</strong> — проверить regex на тестовом тексте</li>
                    <li><strong>💾 Экспорт</strong> — сохранить в файл (TXT, JSON, CSV)</li>
                </ul>
                
                <div class="warning-box">
                    ⚠️ <strong>Лимиты:</strong><br>
                    • Предупреждение при длине > 150 символов<br>
                    • Ошибка при длине > 200 символов
                </div>
            `
        }
    };
    
    return helpContent[panelType] || { title: 'Помощь', html: '<p>Информация не найдена</p>' };
}

console.log('✓ Inline scripts loaded (with modals)');

