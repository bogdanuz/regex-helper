/* ============================================
   INLINE SCRIPTS
   Скрипты для навигации и UI эффектов
   
   ВЕРСИЯ: 2.1 FINAL
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ:
   - ИСПРАВЛЕНО: ID элемента resultRegex → regexResult
   - Обновлены подсказки (Группа 6)
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

if (scrollTopBtn) {
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

if (header) {
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
}

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
        document.body.classList.add('modal-open');
    }
}

/**
 * Закрыть модальное окно
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
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
    const titleEl = document.getElementById('confirmModalTitle');
    const textEl = document.getElementById('confirmModalText');
    
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    
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
            const textarea = document.getElementById('simpleTriggers');
            if (textarea) {
                textarea.value = '';
            }
            
            if (typeof updateSimpleTriggerCount === 'function') {
                updateSimpleTriggerCount();
            }
            if (typeof updateTriggerSettingsUI === 'function') {
                updateTriggerSettingsUI();
            }
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
            // ИСПРАВЛЕНО: правильный ID элемента
            const resultTextarea = document.getElementById('regexResult');
            const lengthEl = document.getElementById('regexLength');
            const statsEl = document.getElementById('resultStats');
            
            if (resultTextarea) {
                resultTextarea.value = '';
            }
            if (lengthEl) {
                lengthEl.textContent = 'Длина: 0 символов';
            }
            if (statsEl) {
                statsEl.style.display = 'none';
            }
            
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
    const inputHelpBtn = document.getElementById('inputHelpBtn');
    const optimizationHelpBtn = document.getElementById('optimizationHelpBtn');
    const resultHelpBtn = document.getElementById('resultHelpBtn');
    
    if (inputHelpBtn) {
        inputHelpBtn.addEventListener('click', () => showPanelHelp('input'));
    }
    if (optimizationHelpBtn) {
        optimizationHelpBtn.addEventListener('click', () => showPanelHelp('optimization'));
    }
    if (resultHelpBtn) {
        resultHelpBtn.addEventListener('click', () => showPanelHelp('result'));
    }
    
    // Подтверждение
    const confirmYesBtn = document.getElementById('confirmModalYes');
    const confirmNoBtn = document.getElementById('confirmModalNo');
    
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
        });
    }
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            closeModal('confirmModal');
        });
    }
    
    // Закрытие модалок по клику на overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // Закрытие модалок по кнопке ×
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    });
    
    // ESC для закрытия модальных окон
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
    });
});

/* ============================================
   ПОМОЩЬ ПО ПАНЕЛЯМ (ОБНОВЛЕНО - Группа 6)
   ============================================ */

function showPanelHelp(panelType) {
    const content = getPanelHelpContent(panelType);
    const titleEl = document.getElementById('panelHelpTitle');
    const contentEl = document.getElementById('panelHelpContent');
    
    if (titleEl) titleEl.textContent = content.title;
    if (contentEl) contentEl.innerHTML = content.html;
    
    openModal('panelHelpModal');
}

function getPanelHelpContent(panelType) {
    const helpContent = {
        'input': {
            title: 'Помощь: Панель 1 - Триггеры',
            html: `
                <h4>📝 Простые триггеры</h4>
                <p>Введите триггеры (каждый с новой строки). <strong>Максимум 200 триггеров.</strong></p>
                
                <div class="example-box">
                    <strong>Пример:</strong><br>
                    дрон<br>
                    беспилотник<br>
                    квадрокоптер<br>
                    бпла
                </div>
                
                <h4>⚙️ Индивидуальные настройки триггеров</h4>
                <p>Кликните на кнопку <strong>⚙️</strong> рядом с триггером для настройки оптимизаций.</p>
                
                <div class="info-box">
                    💡 <strong>Индикация кнопки ⚙️:</strong><br>
                    • <strong>⚙️ БЕЛАЯ</strong> = используются глобальные настройки (панель 2)<br>
                    • <strong>⚙️ ЗЕЛЕНАЯ</strong> = установлены индивидуальные настройки для триггера
                </div>
                
                <h4>🔗 Связанные триггеры (группы)</h4>
                <p>Используйте для создания комбинаций триггеров с расстоянием между ними.</p>
                
                <div class="example-box">
                    <strong>Пример:</strong> группа [выкуп, дорого]<br>
                    → <code>выкуп.{1,7}дорого</code> (расстояние 1-7 символов)
                </div>
                
                <h4>⚙️ Настройки групп</h4>
                <p>Кликните на кнопку <strong>⚙️</strong> рядом с группой для настройки:</p>
                <ul>
                    <li><strong>Расстояние:</strong> Fixed (.{min,max}), Any ([\\s\\S]+), Paragraph (.+), Line ([^\\n]+)</li>
                    <li><strong>Любая последовательность:</strong> (A+B)|(B+A) — триггеры в любом порядке</li>
                    <li><strong>Оптимизации:</strong> Type 1,2,4,5 для триггеров в группе</li>
                </ul>
                
                <div class="info-box">
                    💡 <strong>Индикация кнопки ⚙️ у групп:</strong><br>
                    • <strong>⚙️ БЕЛАЯ</strong> = дефолтное расстояние .{1,7} + глобальные оптимизации<br>
                    • <strong>⚙️ ЗЕЛЕНАЯ (пульсирует)</strong> = индивидуальные настройки группы
                </div>
                
                <h4>📏 Лимиты</h4>
                <ul>
                    <li>Максимум <strong>200 простых триггеров</strong></li>
                    <li>Максимум <strong>10 связанных групп</strong></li>
                    <li>Максимум <strong>9 триггеров</strong> в одной группе</li>
                </ul>
                
                <div class="warning-box">
                    ⚠️ <strong>Автоматическое правило:</strong> Границы <code>\\b</code> добавляются автоматически для триггеров из 3 и менее символов.<br>
                    Пример: <code>"кот"</code> → <code>\\bкот\\b</code> (находит "кот", но НЕ "который")
                </div>
            `
        },
        'optimization': {
            title: 'Помощь: Панель 2 - Оптимизация',
            html: `
                <h4>🌐 Глобальные оптимизации</h4>
                <p>Настройки, которые применяются <strong>КО ВСЕМ триггерам</strong> (кроме тех, у которых есть индивидуальные настройки ⚙️).</p>
                
                <div class="info-box">
                    💡 <strong>Как работает:</strong><br>
                    • Галочка <strong>ВКЛЮЧЕНА</strong> = оптимизация применяется<br>
                    • Галочка <strong>ВЫКЛЮЧЕНА</strong> = оптимизация не применяется<br>
                    • Если ВСЕ выключены → триггеры объединяются через <code>|</code> без оптимизаций
                </div>
                
                <h4>📋 Типы оптимизаций</h4>
                
                <div class="regulation-section">
                    <h5>1️⃣ Повторы (префиксы)</h5>
                    <p>Находит общие префиксы у триггеров.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> джефф, джеффри → <code>джефф(ри)?</code>
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>2️⃣ Общий корень (окончания 1-2 буквы)</h5>
                    <p>Группирует триггеры с общим началом и разными окончаниями (1-2 символа).</p>
                    <div class="example-box">
                        <strong>Пример:</strong> черника, клубника → <code>(чер|клуб)ника</code><br>
                        <strong>Пример:</strong> книга, книги → <code>книг[аи]</code>
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>3️⃣ Вариации букв (латиница ↔ кириллица)</h5>
                    <p>Заменяет похожие символы латиницы и кириллицы в квадратных скобках.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> test → <code>[tт][eе][sѕ][tт]</code><br>
                        <em>(находит "test" и "теst" и "тest" и т.д.)</em>
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>4️⃣ Склонения (русские падежи)</h5>
                    <p>Автоматически генерирует все падежные формы русских существительных.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> дрон → <code>дрон(а|у|ом|е|ов|ам|ами|ах)</code><br>
                        <em>(находит: дрон, дрона, дрону, дроном, дроне, дронов, дронам, дронами, дронах)</em>
                    </div>
                    <div class="warning-box">
                        ⚠️ <strong>Важно:</strong> Использует <strong>круглые скобки</strong> <code>()</code>, потому что некоторые окончания состоят из 2+ букв ("ом", "ами")!
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>5️⃣ Опциональный символ ?</h5>
                    <p>Находит триггеры, отличающиеся на одну повторяющуюся букву.</p>
                    <div class="example-box">
                        <strong>Пример:</strong> пассивный, пасивный → <code>пасс?ивный</code><br>
                        <em>(находит оба варианта: с одной "с" и двумя "сс")</em>
                    </div>
                </div>
                
                <h4>⚙️ Глобальные vs Индивидуальные</h4>
                <div class="info-box">
                    💡 <strong>Когда использовать:</strong><br>
                    • <strong>Глобальные</strong> (панель 2) — для большинства триггеров<br>
                    • <strong>Индивидуальные</strong> (кнопка ⚙️) — для исключений<br><br>
                    <em>Пример:</em> Все триггеры со склонениями (Type 4), но "кот" без склонений → установите Type 4 глобально + отключите Type 4 для "кот" индивидуально
                </div>
                
                <h4>🔘 Если все оптимизации отключены</h4>
                <p>Триггеры будут объединены через альтернацию <code>|</code> без обработки.</p>
                <div class="example-box">
                    <strong>Пример:</strong> дрон, беспилотник → <code>дрон|беспилотник</code>
                </div>
            `
        },
        'result': {
            title: 'Помощь: Панель 3 - Результат',
            html: `
                <h4>✅ Регулярное выражение (Regex)</h4>
                <p>Здесь отображается сгенерированное регулярное выражение после конвертации триггеров.</p>
                
                <h4>📊 Статистика</h4>
                <p>Информация о результате конвертации:</p>
                <ul>
                    <li><strong>Длина:</strong> количество символов в regex</li>
                    <li><strong>Триггеров обработано:</strong> сколько триггеров было обработано</li>
                    <li><strong>Удалено дубликатов:</strong> сколько повторяющихся триггеров было удалено</li>
                    <li><strong>Оптимизации применены:</strong> галочка = оптимизации успешно применены</li>
                </ul>
                
                <div class="info-box">
                    💡 <strong>Цвет индикатора длины:</strong><br>
                    • <strong style="color: #4CAF50;">Зеленый</strong> (&lt; 5000 символов) = норма<br>
                    • <strong style="color: #FF9800;">Оранжевый</strong> (5000-9000 символов) = предупреждение<br>
                    • <strong style="color: #F44336;">Красный</strong> (&gt; 9000 символов) = критично
                </div>
                
                <h4>🛠️ Действия с результатом</h4>
                
                <div class="regulation-section">
                    <h5>📋 Копировать</h5>
                    <p>Скопировать regex в буфер обмена. После копирования кнопка изменится на <strong>"✓ Скопировано"</strong> на 2 секунды.</p>
                </div>
                
                <div class="regulation-section">
                    <h5>🧪 Тестер</h5>
                    <p>Открывает панель тестирования regex на текстовых примерах.</p>
                    <ul>
                        <li><strong>Подсветка:</strong> совпадения выделяются желтым фоном</li>
                        <li><strong>Счетчик:</strong> показывает количество найденных совпадений</li>
                        <li><strong>Список:</strong> показывает все совпадения с позициями в тексте</li>
                    </ul>
                    <div class="example-box">
                        <strong>Пример использования:</strong><br>
                        1. Конвертируйте триггеры → получите regex<br>
                        2. Нажмите "🧪 Тестер"<br>
                        3. Вставьте тестовый текст<br>
                        4. Увидите подсветку всех совпадений
                    </div>
                </div>
                
                <div class="regulation-section">
                    <h5>💾 Экспорт</h5>
                    <p>Сохранить результат в файл. <strong>Доступные форматы:</strong></p>
                    <ul>
                        <li><strong>TXT</strong> — только regex (простой текст)</li>
                        <li><strong>JSON</strong> — regex + триггеры + настройки (структурированные данные)</li>
                        <li><strong>CSV</strong> — таблица с триггерами и regex (для Excel)</li>
                    </ul>
                </div>
                
                <h4>📏 Лимиты</h4>
                <div class="warning-box">
                    ⚠️ <strong>Максимальная длина regex:</strong> 10 000 символов<br>
                    При превышении лимита появится ошибка. Рекомендуется разбить триггеры на несколько regex.
                </div>
                
                <h4>📜 История</h4>
                <p>Все успешные конвертации автоматически сохраняются в разделе <strong>"📜 История"</strong> ниже. Вы можете:</p>
                <ul>
                    <li>Просмотреть прошлые конвертации</li>
                    <li>Скопировать regex из истории</li>
                    <li>Загрузить триггеры обратно в форму</li>
                    <li>Удалить ненужные записи</li>
                </ul>
            `
        }
    };
    
    return helpContent[panelType] || { title: 'Помощь', html: '<p>Информация не найдена</p>' };
}

// Экспорт для глобального доступа
window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirm = showConfirm;
window.confirmClearSimpleTriggers = confirmClearSimpleTriggers;
window.confirmClearResult = confirmClearResult;
window.showPanelHelp = showPanelHelp;
window.closeRegulationsModal = closeRegulationsModal;
window.closeTriggerSettingsModal = closeTriggerSettingsModal;
window.closeGroupSettingsModal = closeGroupSettingsModal;

console.log('✅ Inline scripts loaded (v2.1 FINAL)');
