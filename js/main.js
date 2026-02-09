/* ============================================
   REGEXHELPER - MAIN
   Главный файл приложения
   ============================================ */

/* ============================================
   ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
   ============================================ */

/**
 * Главная функция инициализации
 */
function initApp() {
    console.log('='.repeat(50));
    console.log('RegexHelper v1.0 - Запуск приложения');
    console.log('='.repeat(50));
    
    // Проверка совместимости браузера
    if (!checkBrowserCompatibility()) {
        showToast('error', ERROR_MESSAGES.BROWSER_NOT_SUPPORTED, 10000);
        return;
    }
    
    // Инициализация всех модулей
    try {
        initSuggestions();
        initLinkedTriggers();
        initExport();
        
        console.log('[Main] Все модули инициализированы');
    } catch (error) {
        console.error('[Main] Ошибка инициализации модулей:', error);
        showToast('error', 'Ошибка загрузки приложения. Перезагрузите страницу.');
        return;
    }

   // Инициализация истории
initHistory();
   
    // Установка event listeners
    setupEventListeners();
    
    // Установка счетчиков триггеров
    setupTriggerCounters();
    
    // Фокус на первое поле
    focusFirstInput();
    
    console.log('[Main] ✓ Приложение запущено успешно');
    console.log('='.repeat(50));
}

/* ============================================
   ПРОВЕРКА БРАУЗЕРА
   ============================================ */

/**
 * Проверка совместимости браузера
 * @returns {boolean} - true если совместим
 */
function checkBrowserCompatibility() {
    // Проверяем наличие необходимых API
    const requiredAPIs = [
        'localStorage' in window,
        'JSON' in window,
        'addEventListener' in window,
        'querySelector' in document,
        'classList' in document.createElement('div')
    ];
    
    const isCompatible = requiredAPIs.every(api => api === true);
    
    if (!isCompatible) {
        console.error('[Main] Браузер не поддерживается');
    }
    
    return isCompatible;
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

/**
 * Установка всех event listeners
 */
function setupEventListeners() {
    // Кнопка "Конвертировать"
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', handleConvert);
    }
    
    // Кнопка "Сбросить всё"
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
    
    // Кнопка "Копировать regex"
    const copyBtn = document.getElementById('copyRegexBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopyRegex);
    }
    
    // Кнопка "Экспорт"
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', openExportModal);
    }
    
    // Кнопка "Справка"
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => showModal('helpModal'));
    }

   // Кнопка тестера
const testRegexBtn = document.getElementById('testRegexBtn');
if (testRegexBtn) {
    testRegexBtn.addEventListener('click', toggleTester);
}
    
    // Закрытие модалок по крестику
    setupModalCloseButtons();
    
    console.log('[Main] Event listeners установлены');
}

/**
 * Установка кнопок закрытия модальных окон
 */
function setupModalCloseButtons() {
    const closeButtons = document.querySelectorAll('.modal-close');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

/* ============================================
   СЧЕТЧИКИ ТРИГГЕРОВ
   ============================================ */

/**
 * Установка счетчиков триггеров с debounce
 */
function setupTriggerCounters() {
    const simpleTextarea = document.getElementById('simpleTriggers');
    
    if (simpleTextarea) {
        // Debounce для оптимизации (300ms задержка)
        const debouncedUpdate = debounce(updateSimpleTriggerCount, 300);
        
        simpleTextarea.addEventListener('input', debouncedUpdate);
        
        // Начальное обновление
        updateSimpleTriggerCount();
    }
    
    console.log('[Main] Счетчики триггеров настроены');
}

/**
 * Обновить счетчик простых триггеров
 */
function updateSimpleTriggerCount() {
    const textarea = document.getElementById('simpleTriggers');
    const counter = document.getElementById('simpleTriggerCount');
    
    if (!textarea || !counter) return;
    
    const stats = getTriggerStats(textarea.value);
    
    // Обновляем текст
    counter.textContent = `${stats.count} ${pluralize(stats.count, ['триггер', 'триггера', 'триггеров'])}`;
    
    // Предупреждение о лимите
    if (stats.hasLimit) {
        counter.classList.add('counter-error');
        counter.title = `Превышен лимит (максимум ${LIMITS.MAX_TRIGGERS})`;
    } else if (stats.nearLimit) {
        counter.classList.add('counter-warning');
        counter.title = `Приближение к лимиту (${stats.count} из ${LIMITS.MAX_TRIGGERS})`;
    } else {
        counter.classList.remove('counter-error', 'counter-warning');
        counter.title = '';
    }
    
    // Предупреждение о дубликатах
    if (stats.duplicatesCount > 0) {
        const duplicateNote = document.getElementById('duplicateNote');
        if (duplicateNote) {
            duplicateNote.textContent = `(${stats.duplicatesCount} дубликатов будут удалены)`;
            duplicateNote.style.display = 'inline';
        }
    } else {
        const duplicateNote = document.getElementById('duplicateNote');
        if (duplicateNote) {
            duplicateNote.style.display = 'none';
        }
    }
}

/* ============================================
   ОБРАБОТЧИК КОНВЕРТАЦИИ
   ============================================ */

/**
 * Обработчик кнопки "Конвертировать"
 */
function handleConvert() {
    console.log('[Main] Начало конвертации');
    
    try {
        // Получаем текст из textarea
        const simpleTextarea = document.getElementById('simpleTriggers');
        const resultTextarea = document.getElementById('resultRegex');
        
        if (!simpleTextarea || !resultTextarea) {
            console.error('[Main] Textarea не найдены');
            return;
        }
        
        const text = simpleTextarea.value;
        
        // Проверяем есть ли триггеры (простые ИЛИ связанные)
const hasSimple = hasTriggersInText(text);
const hasLinked = hasLinkedTriggers();

if (!hasSimple && !hasLinked) {
    showInlineError('simpleTriggers', 'Введите хотя бы один триггер (простой или связанный)');
    return;
}
        
        // Получаем настройки оптимизаций
        const optimizations = getSelectedOptimizations();
        const hasOptimizations = hasAnyOptimization();
        
        // Выполняем конвертацию
let result;
let regex = '';

// Если есть простые триггеры - конвертируем их
if (hasSimple) {
    if (hasOptimizations) {
        result = performConversionWithOptimizations(text, optimizations, true);
    } else {
        result = performConversion(text, true);
    }
    
    if (!result.success) {
        console.error('[Main] Конвертация не удалась:', result.info);
        return;
    }
    
    regex = result.regex;
   
   // Сохранение в историю
if (result.success && result.regex) {
    const selectedSettings = getSelectedOptimizations();
    saveToHistory(
        result.regex,
        allTriggers, // массив всех триггеров
        selectedSettings,
        result.info
    );
}

}

// Добавляем перестановки связанных триггеров если есть
if (hasLinked) {
    const permutations = generateLinkedPermutations();
    const permutationCount = countLinkedPermutations();
    
    // Предупреждение о большом количестве перестановок
    if (permutationCount > LINKED_LIMITS.PERMUTATION_WARNING) {
        showToast('warning', WARNING_MESSAGES.PERMUTATIONS_TOO_MANY);
    }
    
    // Объединяем regex простых триггеров и перестановок
    if (regex) {
        regex = regex + '|' + permutations.join('|');
    } else {
        // Только связанные триггеры
        regex = permutations.join('|');
    }
    
    console.log(`[Main] Добавлено ${permutationCount} перестановок`);
}

// Записываем результат
resultTextarea.value = regex;

// Показываем успех
showMessage('success', 'CONVERSION_SUCCESS');

// Обновляем статистику результата
if (result) {
    updateResultStats(result);
}

console.log('[Main] ✓ Конвертация успешна');
        
    } catch (error) {
        logError('handleConvert', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR);
    }
}

/**
 * Обновить статистику результата
 * @param {Object} result - Результат конвертации
 */
function updateResultStats(result) {
    const statsDiv = document.getElementById('resultStats');
    
    if (!statsDiv) return;
    
    const info = result.info;
    
    let html = '<div class="result-stats">';
    html += `<span>Триггеров: ${info.finalCount}</span>`;
    
    if (info.duplicatesRemoved > 0) {
        html += `<span>Дубликатов удалено: ${info.duplicatesRemoved}</span>`;
    }
    
    html += `<span>Длина regex: ${info.regexLength}</span>`;
    
    if (info.optimizationsApplied) {
        html += `<span class="stats-highlight">✓ Оптимизации применены</span>`;
    }
    
    html += '</div>';
    
    statsDiv.innerHTML = html;
}

/* ============================================
   ОБРАБОТЧИК СБРОСА
   ============================================ */

/**
 * Обработчик кнопки "Сбросить всё"
 */
function handleReset() {
    confirmAction(
        'Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.',
        () => {
            try {
                // Очищаем textarea
                const simpleTextarea = document.getElementById('simpleTriggers');
                const resultTextarea = document.getElementById('resultRegex');
                
                if (simpleTextarea) simpleTextarea.value = '';
                if (resultTextarea) resultTextarea.value = '';
                
                // Очищаем inline ошибки
                clearAllInlineErrors();
                
                // Очищаем связанные триггеры
                const container = document.getElementById('linkedTriggersContainer');
                if (container) {
                    container.innerHTML = '';
                }
                
                // Очищаем статистику
                const statsDiv = document.getElementById('resultStats');
                if (statsDiv) statsDiv.innerHTML = '';
                
                // Обновляем счетчики
                updateSimpleTriggerCount();
                
                // Показываем успех
                showMessage('success', 'RESET_SUCCESS');
                
                // Фокус на первое поле
                focusFirstInput();
                
                console.log('[Main] ✓ Все данные очищены');
                
            } catch (error) {
                logError('handleReset', error);
                showToast('error', 'Ошибка при сбросе данных');
            }
        }
    );
}

/* ============================================
   ОБРАБОТЧИК КОПИРОВАНИЯ
   ============================================ */

/**
 * Обработчик кнопки "Копировать regex"
 */
async function handleCopyRegex() {
    const resultTextarea = document.getElementById('resultRegex');
    
    if (!resultTextarea) {
        console.error('[Main] Textarea resultRegex не найдена');
        return;
    }
    
    const regex = resultTextarea.value.trim();
    
    if (!regex) {
        showToast('warning', 'Сначала создайте regex для копирования');
        return;
    }
    
    try {
        const success = await copyToClipboard(regex);
        
        if (success) {
            showMessage('success', 'COPIED_TO_CLIPBOARD');
            
            // Визуальная обратная связь на кнопке
            const copyBtn = document.getElementById('copyRegexBtn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Скопировано';
                copyBtn.classList.add('btn-success');
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('btn-success');
                }, 2000);
            }
            
            console.log('[Main] ✓ Regex скопирован в буфер');
        } else {
            showToast('error', ERROR_MESSAGES.CLIPBOARD_NOT_SUPPORTED);
        }
        
    } catch (error) {
        logError('handleCopyRegex', error);
        showToast('error', 'Ошибка при копировании');
    }
}

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================ */

/**
 * Установить фокус на первое поле ввода
 */
function focusFirstInput() {
    const simpleTextarea = document.getElementById('simpleTriggers');
    
    if (simpleTextarea) {
        setTimeout(() => {
            simpleTextarea.focus();
        }, 100);
    }
}

/**
 * Показать версию приложения в консоли
 */
function showVersionInfo() {
    console.log('%c RegexHelper v1.0 ', 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px;');
    console.log('%c Конвертер триггеров в regex ', 'background: #2196F3; color: white; padding: 3px 8px;');
    console.log('');
    console.log('Разработчик: bogdanuz');
    console.log('GitHub: https://github.com/bogdanuz/regex-helper');
    console.log('');
}

/* ============================================
   ЗАГРУЗКА ПРИЛОЖЕНИЯ
   ============================================ */

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    showVersionInfo();
    initApp();
});

/* ============================================
   ОЧИСТКА ПОЛЕЙ
   ============================================ */

/**
 * Очистить поле простых триггеров
 */
function clearSimpleTriggers() {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) return;
    
    if (textarea.value.trim()) {
        confirmAction(
            'Очистить поле простых триггеров?',
            () => {
                textarea.value = '';
                clearInlineError('simpleTriggers');
                updateSimpleTriggerCount();
                showToast('info', 'Поле очищено');
            }
        );
    }
}

/**
 * Очистить результат
 */
function clearResultRegex() {
    const textarea = document.getElementById('resultRegex');
    const statsDiv = document.getElementById('resultStats');
    
    if (!textarea) return;
    
    if (textarea.value.trim()) {
        confirmAction(
            'Очистить результат?',
            () => {
                textarea.value = '';
                if (statsDiv) statsDiv.innerHTML = '';
                showToast('info', 'Результат очищен');
            }
        );
    }
}

// Делаем функции глобальными
window.clearSimpleTriggers = clearSimpleTriggers;
window.clearResultRegex = clearResultRegex;

// Экспортируем функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        checkBrowserCompatibility,
        handleConvert,
        handleReset,
        handleCopyRegex,
        updateSimpleTriggerCount,
        updateResultStats
    };
}
