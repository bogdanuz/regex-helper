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
        showToast('error', 'Ваш браузер не поддерживается. Используйте современный браузер (Chrome, Firefox, Edge).', 10000);
        return;
    }
    
    // Инициализация всех модулей
    try {
        initSuggestions();
        initLinkedTriggers();
        initExport();
        initHistory();
        initTester();
        
        // ДОБАВЛЕНО: Инициализация визуализатора (если есть)
        if (typeof initVisualizer === 'function') {
            initVisualizer();
        }
        
        // ДОБАВЛЕНО: Инициализация обратного конвертера (если есть)
        if (typeof initReverse === 'function') {
            initReverse();
        }
        
        console.log('[Main] Все модули инициализированы');
    } catch (error) {
        console.error('[Main] Ошибка инициализации модулей:', error);
        showToast('error', 'Ошибка загрузки приложения. Перезагрузите страницу.');
        return;
    }
    
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

    // ДОБАВЛЕНО: Кнопка "Визуализация"
    const visualizeBtn = document.getElementById('visualizeBtn');
    if (visualizeBtn) {
        visualizeBtn.addEventListener('click', () => {
            if (typeof showVisualizer === 'function') {
                showVisualizer();
            } else {
                showToast('error', 'Визуализатор не загружен');
            }
        });
    }
    
    // ДОБАВЛЕНО: Кнопка "Обратный конвертер"
    const reverseBtn = document.getElementById('reverseBtn');
    if (reverseBtn) {
        reverseBtn.addEventListener('click', () => {
            if (typeof showReverse === 'function') {
                showReverse();
            } else {
                showToast('error', 'Обратный конвертер не загружен');
            }
        });
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
        const debouncedUpdate = debounce(() => {
            updateSimpleTriggerCount();
            // ДОБАВЛЕНО: Обновляем UI индивидуальных настроек
            if (typeof updateTriggerSettingsUI === 'function') {
                updateTriggerSettingsUI();
            }
        }, 300);
        
        simpleTextarea.addEventListener('input', debouncedUpdate);
        
        // Начальное обновление
        updateSimpleTriggerCount();
        if (typeof updateTriggerSettingsUI === 'function') {
            updateTriggerSettingsUI();
        }
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
        counter.title = 'Превышен лимит (максимум 200 триггеров)';
    } else if (stats.nearLimit) {
        counter.classList.add('counter-warning');
        counter.title = 'Приближение к лимиту (используйте до 200 триггеров)';
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
        clearAllInlineErrors();

        // Получаем поля
        const simpleTextarea = document.getElementById('simpleTriggers');
        const resultTextarea = document.getElementById('resultRegex');

        if (!simpleTextarea || !resultTextarea) {
            console.error('[Main] Textarea не найдены');
            return;
        }

        let text = simpleTextarea.value;

        // Обработка пустых строк
        if (text && text.includes('\\n')) {
            const lines = text
                .split('\\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            if (lines.length === 0) {
                simpleTextarea.value = '';
                text = '';
            } else {
                text = lines.join('\\n');
                simpleTextarea.value = text;
            }
        }

        // Проверяем наличие триггеров
        const hasSimple = hasTriggersInText(text);
        const hasLinked = hasLinkedTriggers();

        if (!hasSimple && !hasLinked) {
            showInlineError('simpleTriggers', 'Введите хотя бы один триггер (простой или связанный)');
            return;
        }

        let regex = '';
        let allTriggersProcessed = 0;
        let totalDuplicatesRemoved = 0;

        // ========================================
        // КОНВЕРТАЦИЯ ПРОСТЫХ ТРИГГЕРОВ
        // ========================================
        if (hasSimple) {
            // Получаем глобальные настройки оптимизаций
            const globalTypes = getGlobalOptimizationStates();
            
            console.log('[Main] Глобальные настройки:', globalTypes);
            
            // Парсим триггеры
            const triggers = parseSimpleTriggers(text);
            
            // ГРУППА 5: Применяем индивидуальные или глобальные настройки для каждого триггера
            const triggersWithSettings = triggers.map(trigger => {
                const effectiveSettings = getEffectiveSettings(trigger, globalTypes);
                console.log(`[Main] Триггер "${trigger}" использует настройки:`, effectiveSettings);
                return {
                    text: trigger,
                    types: effectiveSettings
                };
            });
            
            // Группируем триггеры по настройкам
            const groups = new Map();
            
            triggersWithSettings.forEach(item => {
                const key = JSON.stringify(item.types);
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key).push(item.text);
            });
            
            console.log(`[Main] Триггеры разделены на ${groups.size} групп по настройкам`);
            
            // Конвертируем каждую группу отдельно
            const regexParts = [];
            
            groups.forEach((triggerList, typesKey) => {
                const types = JSON.parse(typesKey);
                const groupText = triggerList.join('\n');
                
                console.log(`[Main] Конвертация группы: ${triggerList.length} триггеров с настройками:`, types);
                
                const result = performConversionWithOptimizations(groupText, types, false);
                
                if (result.success && result.regex) {
                    regexParts.push(result.regex);
                    allTriggersProcessed += result.info.finalCount || triggerList.length;
                    totalDuplicatesRemoved += result.info.duplicatesRemoved || 0;
                }
            });
            
            // Объединяем все части
            regex = regexParts.join('|');
        }

        // ========================================
        // ДОБАВЛЯЕМ СВЯЗАННЫЕ ТРИГГЕРЫ
        // ========================================
        if (hasLinked) {
            const permutations = generateLinkedPermutations();
            const permutationCount = countLinkedPermutations();

            if (permutationCount > 100) {
                showToast('warning', 'Большое количество перестановок может замедлить работу приложения');
            }

            if (regex) {
                regex = regex + '|' + permutations.join('|');
            } else {
                regex = permutations.join('|');
            }

            console.log(`[Main] Добавлено ${permutationCount} перестановок`);
        }

        // Проверка итогового regex
        if (!regex) {
            showToast('error', 'Не удалось создать regex');
            return;
        }

        // Установить результат
        resultTextarea.value = regex;
        
        // Обновляем счетчик длины
        const regexLengthSpan = document.getElementById('regexLength');
        if (regexLengthSpan) {
            const length = regex.length;
            regexLengthSpan.textContent = `Длина: ${length} ${pluralize(length, ['символ', 'символа', 'символов'])}`;
            
            // Цвет в зависимости от длины
            if (length > 9000) {
                regexLengthSpan.style.color = '#F44336'; // Красный (критично)
            } else if (length > 5000) {
                regexLengthSpan.style.color = '#FF9800'; // Оранжевый (предупреждение)
            } else {
                regexLengthSpan.style.color = '#4CAF50'; // Зеленый (норма)
            }
        }

        // Обновляем статистику
        const statsDiv = document.getElementById('resultStats');
        if (statsDiv) {
            let html = '<div class="result-stats-content">';
            html += `<span>Триггеров обработано: ${allTriggersProcessed}</span>`;
            
            if (totalDuplicatesRemoved > 0) {
                html += `<span>Дубликатов удалено: ${totalDuplicatesRemoved}</span>`;
            }
            
            html += `<span>Длина regex: ${regex.length}</span>`;
            html += `<span class="stats-highlight">✓ Оптимизации применены</span>`;
            html += '</div>';
            
            statsDiv.innerHTML = html;
            statsDiv.style.display = 'block';
        }

        // Подготовка массива всех триггеров для истории
        let allTriggers = [];
        try {
            if (text && hasSimple) {
                const simpleTriggers = parseSimpleTriggers(text);
                allTriggers = allTriggers.concat(simpleTriggers);
            }

            if (hasLinked && typeof generateLinkedPermutations === 'function') {
                const linkedStrings = generateLinkedPermutations();
                allTriggers = allTriggers.concat(linkedStrings);
            }
        } catch (e) {
            logError('handleConvert:allTriggers', e);
        }

        // Сохранение в историю
        try {
            if (regex && Array.isArray(allTriggers) && allTriggers.length > 0) {
                const selectedSettings = getGlobalOptimizationStates();
                const info = {
                    triggerCount: allTriggersProcessed,
                    regexLength: regex.length,
                    duplicatesRemoved: totalDuplicatesRemoved
                };
                saveToHistory(regex, allTriggers, selectedSettings, info);
            }
        } catch (e) {
            logError('handleConvert:saveToHistory', e);
        }

        // Уведомление об успехе
        showToast('success', 'Regex успешно создан!');
        console.log('[Main] ✓ Конвертация успешна');
        
    } catch (error) {
        logError('handleConvert', error);
        showToast('error', 'Произошла ошибка при конвертации. Попробуйте еще раз.');
    }
}

/* ============================================
   ОБРАБОТЧИК СБРОСА
   ============================================ */

/**
 * Обработчик кнопки "Сбросить всё"
 */
function handleReset() {
    // Функция сброса
    const performReset = () => {
        // Очистка простых триггеров
        const simpleTextarea = document.getElementById('simpleTriggers');
        if (simpleTextarea) {
            simpleTextarea.value = '';
            updateSimpleTriggerCount();
        }
        
        // Очистка результата
        const resultTextarea = document.getElementById('resultRegex');
        if (resultTextarea) {
            resultTextarea.value = '';
        }
        
        // Очистка статистики
        const statsDiv = document.getElementById('resultStats');
        if (statsDiv) {
            statsDiv.innerHTML = '';
            statsDiv.style.display = 'none';
        }
        
        // Сброс счетчика длины
        const regexLengthSpan = document.getElementById('regexLength');
        if (regexLengthSpan) {
            regexLengthSpan.textContent = 'Длина: 0 символов';
            regexLengthSpan.style.color = '';
        }
        
        // Очистка связанных триггеров
        if (typeof clearAllLinkedGroups === 'function') {
            clearAllLinkedGroups();
        }
        
        // Очистка индивидуальных настроек триггеров
        if (typeof clearAllTriggerSettings === 'function') {
            clearAllTriggerSettings();
        }
        
        // Обновляем UI кнопок настроек
        if (typeof updateTriggerSettingsUI === 'function') {
            updateTriggerSettingsUI();
        }
        
        // Очистка inline ошибок
        clearAllInlineErrors();
        
        showToast('success', 'Все данные очищены');
    };
    
    // Проверяем наличие confirmAction
    if (typeof confirmAction === 'function') {
        confirmAction(
            'Подтверждение',
            'Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.',
            performReset,
            null
        );
    } else {
        // Fallback на стандартный confirm
        if (window.confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
            performReset();
        }
    }
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
            showToast('success', 'Regex скопирован в буфер обмена');
            
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
            showToast('error', 'Копирование в буфер обмена не поддерживается вашим браузером');
        }
        
    } catch (error) {
        logError('handleCopyRegex', error);
        showToast('error', 'Ошибка при копировании');
    }
}

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
            'Подтверждение',
            'Очистить поле простых триггеров?',
            () => {
                textarea.value = '';
                clearInlineError('simpleTriggers');
                updateSimpleTriggerCount();
                
                // Обновляем UI кнопок настроек
                if (typeof updateTriggerSettingsUI === 'function') {
                    updateTriggerSettingsUI();
                }
                
                showToast('info', 'Поле очищено');
            },
            null
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
            'Подтверждение',
            'Очистить результат?',
            () => {
                textarea.value = '';
                if (statsDiv) {
                    statsDiv.innerHTML = '';
                    statsDiv.style.display = 'none';
                }
                
                // Сброс счетчика длины
                const regexLengthSpan = document.getElementById('regexLength');
                if (regexLengthSpan) {
                    regexLengthSpan.textContent = 'Длина: 0 символов';
                    regexLengthSpan.style.color = '';
                }
                
                showToast('info', 'Результат очищен');
            },
            null
        );
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

// Делаем функции глобальными
window.clearSimpleTriggers = clearSimpleTriggers;
window.clearResultRegex = clearResultRegex;

console.log('✓ Модуль main.js загружен');
