/* ============================================
   REGEXHELPER - MAIN
   Главный файл приложения
   
   ВЕРСИЯ: 3.0 FINAL
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ:
   - БЛОК 2: Интеграция расширенной истории (saveConversionToHistory)
   - БЛОК 3: Поддержка подгрупп и 3 режимов связи
   - БЛОК 5: Автозамена ё → [её] (через converter.js)
   - БЛОК 6: Confirm с отложением (через converter.js)
   - БЛОК 8: toggleAccordion() для сворачивания панелей ✅
   - ИСПРАВЛЕНО: Перенос строк (\n вместо \\n)
   - ДОБАВЛЕНО: Safe функции с fallback
   - ДОБАВЛЕНО: Проверки зависимостей
   
   ЗАВИСИМОСТИ:
   - utils.js (copyToClipboard, debounce, pluralize)
   - errors.js (showToast, confirmAction, clearAllInlineErrors, logError)
   - converter.js (parseSimpleTriggers, validateTriggers, etc.)
   - linked-triggers.js (initLinkedTriggers, hasLinkedTriggers, getLinkedGroups)
   - optimizations.js (applyOptimizations, getGlobalOptimizationStates)
   - suggestions.js (initSuggestions)
   - export.js (initExport, openExportModal)
   - history.js (initHistory, saveConversionToHistory)
   ============================================ */

/* ============================================
   ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
   ============================================ */

/**
 * Главная функция инициализации
 */
function initApp() {
    console.log('='.repeat(50));
    console.log('RegexHelper v3.0 FINAL - Запуск приложения');
    console.log('='.repeat(50));
    
    // Проверка совместимости браузера
    if (!checkBrowserCompatibility()) {
        showToastSafe('error', 'Ваш браузер не поддерживается. Используйте современный браузер (Chrome, Firefox, Edge).', 10000);
        return;
    }
    
    // Инициализация всех модулей
    try {
        // Проверяем наличие функций инициализации
        if (typeof initSuggestions === 'function') {
            initSuggestions();
        } else {
            console.warn('[Main] initSuggestions не найдена');
        }
        
        if (typeof initLinkedTriggers === 'function') {
            initLinkedTriggers();
        } else {
            console.warn('[Main] initLinkedTriggers не найдена');
        }
        
        if (typeof initExport === 'function') {
            initExport();
        } else {
            console.warn('[Main] initExport не найдена');
        }
        
        if (typeof initHistory === 'function') {
            initHistory();
        } else {
            console.warn('[Main] initHistory не найдена');
        }
        
        console.log('[Main] Все модули инициализированы');
    } catch (error) {
        console.error('[Main] Ошибка инициализации модулей:', error);
        showToastSafe('error', 'Ошибка загрузки приложения. Перезагрузите страницу.');
        return;
    }
    
    // Установка event listeners
    setupEventListeners();
    
    // Установка счетчиков триггеров
    setupTriggerCounters();
    
    // Фокус на первое поле
    focusFirstInput();
    
    console.log('[Main] ✅ Приложение запущено успешно');
    console.log('='.repeat(50));
}

/* ============================================
   SAFE ФУНКЦИИ (FALLBACK)
   ============================================ */

/**
 * Безопасный toast
 */
function showToastSafe(type, message, duration) {
    if (typeof showToast === 'function') {
        showToast(type, message, duration);
    } else {
        console.log(`[Toast ${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Безопасное подтверждение
 */
function confirmActionSafe(title, message, onConfirm, onCancel) {
    if (typeof confirmAction === 'function') {
        confirmAction(title, message, onConfirm, onCancel);
    } else if (window.confirm(`${title}\n\n${message}`)) {
        if (onConfirm) onConfirm();
    } else {
        if (onCancel) onCancel();
    }
}

/**
 * Безопасный pluralize
 */
function pluralizeSafe(count, forms) {
    if (typeof pluralize === 'function') {
        return pluralize(count, forms);
    }
    
    // Fallback
    const n = Math.abs(count) % 100;
    const n1 = n % 10;
    
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}

/* ============================================
   ПРОВЕРКА БРАУЗЕРА
   ============================================ */

/**
 * Проверка совместимости браузера
 * @returns {boolean} - true если совместим
 */
function checkBrowserCompatibility() {
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
    if (exportBtn && typeof openExportModal === 'function') {
        exportBtn.addEventListener('click', openExportModal);
    }
    
    // Кнопка "Регламент"
    const regulationsBtn = document.getElementById('regulationsBtn');
    if (regulationsBtn && typeof showModal === 'function') {
        regulationsBtn.addEventListener('click', () => showModal('regulationsModal'));
    }

    // Кнопка тестера
    const testRegexBtn = document.getElementById('testRegexBtn');
    if (testRegexBtn && typeof toggleTester === 'function') {
        testRegexBtn.addEventListener('click', toggleTester);
    }

    // ============================================================
    // EVENT LISTENERS ДЛЯ ВИЗУАЛИЗАТОРА
    // ============================================================

    // Кнопка "Визуализировать"
    const visualizeBtn = document.getElementById('visualizeBtn');
    if (visualizeBtn) {
        visualizeBtn.addEventListener('click', () => {
            const regex = document.getElementById('visualizerRegex')?.value || '';
            if (typeof visualizeRegex === 'function') {
                visualizeRegex(regex);
            } else {
                console.error('[Main] Функция visualizeRegex не найдена');
                showToastSafe('error', 'Визуализатор не загружен');
            }
        });
    }

    // Кнопка "Экспорт SVG"
    const exportSvgBtn = document.getElementById('exportSvgBtn');
    if (exportSvgBtn && typeof exportSVG === 'function') {
        exportSvgBtn.addEventListener('click', exportSVG);
    }

    // Кнопка "Экспорт PNG"
    const exportPngBtn = document.getElementById('exportPngBtn');
    if (exportPngBtn && typeof exportPNG === 'function') {
        exportPngBtn.addEventListener('click', exportPNG);
    }

    // Кнопка "Zoom In"
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn && typeof zoomDiagram === 'function') {
        zoomInBtn.addEventListener('click', () => zoomDiagram(1.2));
    }

    // Кнопка "Zoom Out"
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn && typeof zoomDiagram === 'function') {
        zoomOutBtn.addEventListener('click', () => zoomDiagram(0.8));
    }

    // Кнопка "На весь экран"
    const openFullscreenBtn = document.getElementById('openFullscreenBtn');
    if (openFullscreenBtn && typeof openFullscreen === 'function') {
        openFullscreenBtn.addEventListener('click', openFullscreen);
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
                document.body.classList.remove('modal-open');
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
        const debouncedUpdate = typeof debounce === 'function'
            ? debounce(() => {
                updateSimpleTriggerCount();
                if (typeof updateTriggerSettingsUI === 'function') {
                    updateTriggerSettingsUI();
                }
            }, 300)
            : () => {
                updateSimpleTriggerCount();
                if (typeof updateTriggerSettingsUI === 'function') {
                    updateTriggerSettingsUI();
                }
            };
        
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
    
    const stats = typeof getTriggerStats === 'function'
        ? getTriggerStats(textarea.value)
        : { count: 0, uniqueCount: 0, duplicatesCount: 0, hasLimit: false, nearLimit: false };
    
    // Обновляем текст
    counter.textContent = `${stats.count} ${pluralizeSafe(stats.count, ['триггер', 'триггера', 'триггеров'])}`;
    
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
   КОНВЕРТАЦИЯ С ОПТИМИЗАЦИЯМИ
   ============================================ */

/**
 * Конвертация с применением оптимизаций
 * @param {string} text - Текст с триггерами
 * @param {Object} types - Настройки оптимизаций {type1, type2, type4, type5}
 * @param {boolean} showWarnings - Показывать ли предупреждения
 * @returns {Object} - {success: boolean, regex: string, info: {}}
 */
function performConversionWithOptimizations(text, types, showWarnings = true) {
    try {
        // Проверяем наличие необходимых функций
        if (typeof parseSimpleTriggers !== 'function') {
            console.error('[Main] parseSimpleTriggers не найдена');
            return { success: false, regex: '', info: { errors: ['Модуль converter.js не загружен'] } };
        }
        
        // 1. Парсим триггеры (replaceYo применяется автоматически внутри)
        let triggers = parseSimpleTriggers(text);
        
        // 2. Валидация
        if (typeof validateTriggers === 'function') {
            const validation = validateTriggers(triggers);
            if (!validation.valid) {
                return {
                    success: false,
                    regex: '',
                    info: { errors: validation.errors }
                };
            }
        }
        
        // 3. Удаление дубликатов
        if (typeof removeDuplicatesFromTriggers === 'function') {
            const deduped = removeDuplicatesFromTriggers(triggers);
            triggers = deduped.triggers;
        }
        
        // 4. Применяем оптимизации
        if (typeof applyOptimizations === 'function') {
            triggers = applyOptimizations(triggers, types);
        } else {
            console.warn('[Main] applyOptimizations не найдена, применяем базовое экранирование');
            if (typeof escapeRegex === 'function') {
                triggers = triggers.map(t => escapeRegex(t));
            }
        }
        
        // 5. Конвертируем в regex
        const regex = triggers.join('|');
        
        // 6. Валидация длины
        if (typeof validateRegexLength === 'function') {
            const lengthValidation = validateRegexLength(regex);
            if (!lengthValidation.valid) {
                return {
                    success: false,
                    regex: '',
                    info: { errors: lengthValidation.errors }
                };
            }
        }
        
        return {
            success: true,
            regex: regex,
            info: {
                originalCount: triggers.length,
                finalCount: triggers.length,
                duplicatesRemoved: 0,
                regexLength: regex.length
            }
        };
        
    } catch (error) {
        if (typeof logError === 'function') {
            logError('performConversionWithOptimizations', error);
        } else {
            console.error('[Main] Ошибка performConversionWithOptimizations:', error);
        }
        return {
            success: false,
            regex: '',
            info: { errors: [error.message] }
        };
    }
}

/* ============================================
   ОБРАБОТЧИК КОНВЕРТАЦИИ (ОБНОВЛЕНО v3.0 FINAL)
   ============================================ */

/**
 * Обработчик кнопки "Конвертировать"
 * 
 * ОБНОВЛЕНО v3.0 FINAL:
 * - ИСПРАВЛЕНО: Перенос строк (\n вместо \\n)
 * - Интеграция с confirm (через performConversion в converter.js)
 * - Использование saveConversionToHistory() вместо старой логики
 * - Поддержка подгрупп в связанных триггерах
 * - Проверки зависимостей
 */
function handleConvert() {
    console.log('[Main] ========== НАЧАЛО КОНВЕРТАЦИИ ==========');
    
    try {
        if (typeof clearAllInlineErrors === 'function') {
            clearAllInlineErrors();
        }

        // Получаем поля
        const simpleTextarea = document.getElementById('simpleTriggers');
        const resultTextarea = document.getElementById('regexResult');

        if (!simpleTextarea || !resultTextarea) {
            console.error('[Main] Textarea не найдены');
            return;
        }

        let text = simpleTextarea.value.trim();

        // Проверяем наличие триггеров
        const hasSimple = typeof hasTriggersInText === 'function' 
            ? hasTriggersInText(text) 
            : text.length > 0;
        const hasLinked = typeof hasLinkedTriggers === 'function' 
            ? hasLinkedTriggers() 
            : false;

        if (!hasSimple && !hasLinked) {
            if (typeof showInlineError === 'function') {
                showInlineError('simpleTriggers', 'Введите хотя бы один триггер (простой или связанный)');
            } else {
                showToastSafe('error', 'Введите хотя бы один триггер');
            }
            return;
        }

        let regex = '';
        let allTriggersProcessed = 0;
        let totalDuplicatesRemoved = 0;
        let conversionType = hasLinked ? 'linked' : 'simple'; // Определяем тип

        // ========================================
        // КОНВЕРТАЦИЯ ПРОСТЫХ ТРИГГЕРОВ
        // ========================================
        if (hasSimple) {
            console.log('[Main] --- КОНВЕРТАЦИЯ ПРОСТЫХ ТРИГГЕРОВ ---');
            
            // Получаем глобальные настройки оптимизаций
            const globalTypes = typeof getGlobalOptimizationStates === 'function'
                ? getGlobalOptimizationStates()
                : { type1: false, type2: false, type4: false, type5: false };
            
            console.log('[Main] Глобальные настройки:', globalTypes);
            
            // Парсим триггеры (replaceYo применяется автоматически)
            const triggers = typeof parseSimpleTriggers === 'function'
                ? parseSimpleTriggers(text)
                : text.split('\n').map(t => t.trim()).filter(t => t);
            
            console.log(`[Main] Распарсено ${triggers.length} триггеров`);
            
            // Группируем триггеры по настройкам (если есть функция getEffectiveSettings)
            const groups = new Map();
            
            triggers.forEach(trigger => {
                // ПРИМЕЧАНИЕ: getEffectiveSettings должна быть в отдельном модуле
                // для поддержки ГРУППЫ 5 (индивидуальные настройки триггеров)
                const effectiveSettings = typeof getEffectiveSettings === 'function'
                    ? getEffectiveSettings(trigger, globalTypes)
                    : globalTypes;
                
                const key = JSON.stringify(effectiveSettings);
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key).push(trigger);
            });
            
            console.log(`[Main] Триггеры разделены на ${groups.size} групп по настройкам`);
            
            // Конвертируем каждую группу отдельно
            const regexParts = [];
            
            groups.forEach((triggerList, typesKey) => {
                const types = JSON.parse(typesKey);
                // ИСПРАВЛЕНО: правильный перенос строк
                const groupText = triggerList.join('\n');
                
                console.log(`[Main] Конвертация группы: ${triggerList.length} триггеров`);
                
                const result = performConversionWithOptimizations(groupText, types, false);
                
                if (result.success && result.regex) {
                    regexParts.push(result.regex);
                    allTriggersProcessed += result.info.finalCount || triggerList.length;
                    totalDuplicatesRemoved += result.info.duplicatesRemoved || 0;
                }
            });
            
            // Объединяем все части
            regex = regexParts.join('|');
            
            console.log(`[Main] ✓ Простые триггеры: обработано ${allTriggersProcessed}, regex длина: ${regex.length}`);
        }

        // ========================================
        // КОНВЕРТАЦИЯ СВЯЗАННЫХ ТРИГГЕРОВ (v3.0 - с подгруппами)
        // ========================================
        if (hasLinked) {
            console.log('[Main] --- КОНВЕРТАЦИЯ СВЯЗАННЫХ ГРУПП ---');
            
            // Получаем все группы с подгруппами
            const linkedGroups = typeof getLinkedGroups === 'function'
                ? getLinkedGroups()
                : [];
            
            console.log(`[Main] Найдено ${linkedGroups.length} связанных групп`);
            
            // Валидация связанных групп
            if (typeof validateLinkedGroups === 'function') {
                const validation = validateLinkedGroups();
                if (!validation.valid) {
                    console.error('[Main] Валидация связанных групп не прошла:', validation.errors);
                    showToastSafe('error', validation.errors[0]);
                    return;
                }
                
                // Предупреждения
                if (validation.warnings.length > 0) {
                    validation.warnings.forEach(warning => {
                        showToastSafe('warning', warning, 5000);
                    });
                }
            }
            
            if (linkedGroups.length > 0) {
                // Конвертируем все группы (с поддержкой подгрупп)
                const linkedRegex = typeof convertLinkedGroups === 'function'
                    ? convertLinkedGroups(linkedGroups)
                    : '';
                
                if (linkedRegex) {
                    console.log('[Main] ✓ Связанные группы конвертированы успешно');
                    console.log(`[Main] Связанные триггеры regex длина: ${linkedRegex.length}`);
                    
                    // Добавляем к общему regex
                    if (regex) {
                        regex = regex + '|' + linkedRegex;
                    } else {
                        regex = linkedRegex;
                    }
                    
                    // Подсчитываем триггеры в подгруппах
                    linkedGroups.forEach(group => {
                        if (group.subgroups) {
                            group.subgroups.forEach(subgroup => {
                                allTriggersProcessed += subgroup.triggers.length;
                            });
                        }
                    });
                    
                    console.log(`[Main] ✓ Добавлено ${linkedGroups.length} связанных групп`);
                }
            }
        }

        // ========================================
        // ФИНАЛИЗАЦИЯ
        // ========================================
        
        if (!regex) {
            showToastSafe('error', 'Не удалось создать regex');
            return;
        }
        
        console.log(`[Main] ========== ИТОГОВЫЙ REGEX ==========`);
        console.log(`[Main] Длина: ${regex.length} символов`);
        console.log(`[Main] Триггеров обработано: ${allTriggersProcessed}`);
        console.log(`[Main] ========================================`);

        // Устанавливаем результат в textarea
        resultTextarea.value = regex;
        
        // Обновляем счетчик длины
        updateRegexLengthCounter(regex.length);
        
        // Обновляем статистику
        updateResultStats(allTriggersProcessed, totalDuplicatesRemoved, regex.length);

        // ========================================
        // СОХРАНЕНИЕ В ИСТОРИЮ (НОВОЕ v3.0)
        // ========================================
        
        // Используем новую функцию-обертку из history.js
        if (typeof saveConversionToHistory === 'function') {
            saveConversionToHistory(regex, conversionType);
            console.log('[Main] ✓ Конвертация сохранена в историю');
        } else {
            console.warn('[Main] saveConversionToHistory не найдена');
        }

        // Уведомление об успехе
        showToastSafe('success', '✓ Regex успешно создан!');
        console.log('[Main] ========== КОНВЕРТАЦИЯ ЗАВЕРШЕНА ==========');
        
    } catch (error) {
        if (typeof logError === 'function') {
            logError('handleConvert', error);
        } else {
            console.error('[Main] Ошибка handleConvert:', error);
        }
        showToastSafe('error', 'Произошла ошибка при конвертации. Попробуйте еще раз.');
    }
}

/**
 * Обновить счетчик длины regex (НОВОЕ v3.0)
 * @param {number} length - Длина regex
 */
function updateRegexLengthCounter(length) {
    const regexLengthSpan = document.getElementById('regexLength');
    if (!regexLengthSpan) return;
    
    regexLengthSpan.textContent = `Длина: ${length} ${pluralizeSafe(length, ['символ', 'символа', 'символов'])}`;
    
    // Цвет в зависимости от длины
    if (length > 9000) {
        regexLengthSpan.style.color = '#F44336'; // Красный (критично)
    } else if (length > 5000) {
        regexLengthSpan.style.color = '#FF9800'; // Оранжевый (предупреждение)
    } else {
        regexLengthSpan.style.color = '#4CAF50'; // Зеленый (норма)
    }
}

/**
 * Обновить статистику результата (НОВОЕ v3.0)
 * @param {number} triggerCount - Количество триггеров
 * @param {number} duplicatesRemoved - Удалено дубликатов
 * @param {number} regexLength - Длина regex
 */
function updateResultStats(triggerCount, duplicatesRemoved, regexLength) {
    const statsDiv = document.getElementById('resultStats');
    if (!statsDiv) return;
    
    let html = '<div class="result-stats-content">';
    html += `<span>Триггеров обработано: ${triggerCount}</span>`;
    
    if (duplicatesRemoved > 0) {
        html += `<span>Дубликатов удалено: ${duplicatesRemoved}</span>`;
    }
    
    html += `<span>Длина regex: ${regexLength}</span>`;
    html += `<span class="stats-highlight">✓ Оптимизации применены</span>`;
    html += '</div>';
    
    statsDiv.innerHTML = html;
    statsDiv.style.display = 'block';
}

/* ============================================
   ОБРАБОТЧИК СБРОСА
   ============================================ */

/**
 * Обработчик кнопки "Сбросить всё"
 */
function handleReset() {
    const performReset = () => {
        // Очистка простых триггеров
        const simpleTextarea = document.getElementById('simpleTriggers');
        if (simpleTextarea) {
            simpleTextarea.value = '';
            updateSimpleTriggerCount();
        }
        
        // Очистка результата
        const resultTextarea = document.getElementById('regexResult');
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
            const container = document.getElementById('linkedTriggersContainer');
            if (container) {
                container.innerHTML = '';
            }
        }
        
        // Очистка индивидуальных настроек триггеров (ГРУППА 5)
        // ПРИМЕЧАНИЕ: Функция должна быть определена в отдельном модуле
        if (typeof clearAllTriggerSettings === 'function') {
            clearAllTriggerSettings();
        }
        
        // Обновляем UI кнопок настроек
        if (typeof updateTriggerSettingsUI === 'function') {
            updateTriggerSettingsUI();
        }
        
        // Очистка inline ошибок
        if (typeof clearAllInlineErrors === 'function') {
            clearAllInlineErrors();
        }
        
        showToastSafe('success', 'Все данные очищены');
    };
    
    confirmActionSafe(
        'Подтверждение',
        'Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.',
        performReset,
        null
    );
}

/* ============================================
   ОБРАБОТЧИК КОПИРОВАНИЯ
   ============================================ */

/**
 * Обработчик кнопки "Копировать regex"
 */
async function handleCopyRegex() {
    const resultTextarea = document.getElementById('regexResult');
    
    if (!resultTextarea) {
        console.error('[Main] Textarea regexResult не найдена');
        return;
    }
    
    const regex = resultTextarea.value.trim();
    
    if (!regex) {
        showToastSafe('warning', 'Сначала создайте regex для копирования');
        return;
    }
    
    try {
        const success = typeof copyToClipboard === 'function'
            ? await copyToClipboard(regex)
            : false;
        
        if (success) {
            showToastSafe('success', 'Regex скопирован в буфер обмена');
            
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
            showToastSafe('error', 'Копирование в буфер обмена не поддерживается вашим браузером');
        }
        
    } catch (error) {
        if (typeof logError === 'function') {
            logError('handleCopyRegex', error);
        } else {
            console.error('[Main] Ошибка handleCopyRegex:', error);
        }
        showToastSafe('error', 'Ошибка при копировании');
    }
}

/* ============================================
   ОЧИСТКА ПОЛЕЙ
   ============================================ */

/**
 * Очистить поле простых триггеров
 */
function confirmClearSimpleTriggers() {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) return;
    
    if (textarea.value.trim()) {
        confirmActionSafe(
            'Подтверждение',
            'Очистить поле простых триггеров?',
            () => {
                textarea.value = '';
                if (typeof clearInlineError === 'function') {
                    clearInlineError('simpleTriggers');
                }
                updateSimpleTriggerCount();
                
                if (typeof updateTriggerSettingsUI === 'function') {
                    updateTriggerSettingsUI();
                }
                
                showToastSafe('info', 'Поле очищено');
            },
            null
        );
    } else {
        showToastSafe('info', 'Поле уже пустое');
    }
}

/**
 * Очистить результат
 */
function confirmClearResult() {
    const textarea = document.getElementById('regexResult');
    const statsDiv = document.getElementById('resultStats');
    
    if (!textarea) return;
    
    if (textarea.value.trim()) {
        confirmActionSafe(
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
                
                showToastSafe('info', 'Результат очищен');
            },
            null
        );
    } else {
        showToastSafe('info', 'Результат уже пустой');
    }
}

/* ============================================
   АККОРДЕОН ПАНЕЛЕЙ (НОВОЕ - БЛОК 8) ✅
   ============================================ */

/**
 * Сворачивание/разворачивание панелей
 * 
 * БЛОК 8: UI/UX улучшения
 * 
 * @param {string} panelId - ID панели (например, 'panel1')
 * 
 * @example
 * HTML: <button class="btn-accordion" onclick="toggleAccordion('panel1')">▼</button>
 */
function toggleAccordion(panelId) {
    const panel = document.getElementById(panelId);
    
    if (!panel) {
        console.warn(`[Main] Панель ${panelId} не найдена`);
        return;
    }
    
    const body = panel.querySelector('.panel-body');
    const btn = panel.querySelector('.btn-accordion');
    
    if (!body) {
        console.warn(`[Main] .panel-body не найден в панели ${panelId}`);
        return;
    }
    
    if (!btn) {
        console.warn(`[Main] .btn-accordion не найдена в панели ${panelId}`);
        return;
    }
    
    // Проверяем текущее состояние
    const isCollapsed = body.style.display === 'none';
    
    if (isCollapsed) {
        // Разворачиваем
        body.style.display = 'block';
        btn.textContent = '▼';
        btn.title = 'Свернуть панель';
        console.log(`[Main] Панель ${panelId} развернута`);
    } else {
        // Сворачиваем
        body.style.display = 'none';
        btn.textContent = '▲';
        btn.title = 'Развернуть панель';
        console.log(`[Main] Панель ${panelId} свернута`);
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
    console.log('%c RegexHelper v3.0 FINAL ', 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px;');
    console.log('%c Конвертер триггеров в regex ', 'background: #2196F3; color: white; padding: 3px 8px;');
    console.log('');
    console.log('✓ БЛОК 2: История 100 записей + импорт/экспорт');
    console.log('✓ БЛОК 3: Подгруппы + 3 режима связи');
    console.log('✓ БЛОК 5: Автозамена ё → [её]');
    console.log('✓ БЛОК 6: Confirm с отложением');
    console.log('✓ БЛОК 8: toggleAccordion() для сворачивания панелей');
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
window.confirmClearSimpleTriggers = confirmClearSimpleTriggers;
window.confirmClearResult = confirmClearResult;
window.toggleAccordion = toggleAccordion; // НОВОЕ! ✅
window.updateSimpleTriggerCount = updateSimpleTriggerCount;

console.log('✅ Модуль main.js загружен (v3.0 FINAL)');
