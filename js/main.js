/* ============================================
   REGEXHELPER - MAIN
   Главный файл приложения
   
   ВЕРСИЯ: 3.0 (+ toggleAccordion)
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ:
   - БЛОК 2: Интеграция расширенной истории (saveConversionToHistory)
   - БЛОК 3: Поддержка подгрупп и 3 режимов связи
   - БЛОК 5: Автозамена ё → [её] (через converter.js)
   - БЛОК 6: Confirm с отложением (через converter.js)
   - БЛОК 8: toggleAccordion() для сворачивания панелей ✅
   - Убрана старая логика сохранения истории
   ============================================ */

/* ============================================
   ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
   ============================================ */

/**
 * Главная функция инициализации
 */
function initApp() {
    console.log('='.repeat(50));
    console.log('RegexHelper v3.0 - Запуск приложения');
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
    
    // Кнопка "Регламент"
    const regulationsBtn = document.getElementById('regulationsBtn');
    if (regulationsBtn) {
        regulationsBtn.addEventListener('click', () => showModal('regulationsModal'));
    }

    // Кнопка тестера
    const testRegexBtn = document.getElementById('testRegexBtn');
    if (testRegexBtn) {
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
                showToast('error', 'Визуализатор не загружен');
            }
        });
    }

    // Кнопка "Экспорт SVG"
    const exportSvgBtn = document.getElementById('exportSvgBtn');
    if (exportSvgBtn) {
        exportSvgBtn.addEventListener('click', () => {
            if (typeof exportSVG === 'function') {
                exportSVG();
            } else {
                console.error('[Main] Функция exportSVG не найдена');
            }
        });
    }

    // Кнопка "Экспорт PNG"
    const exportPngBtn = document.getElementById('exportPngBtn');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', () => {
            if (typeof exportPNG === 'function') {
                exportPNG();
            } else {
                console.error('[Main] Функция exportPNG не найдена');
            }
        });
    }

    // Кнопка "Zoom In"
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (typeof zoomDiagram === 'function') {
                zoomDiagram(1.2);
            }
        });
    }

    // Кнопка "Zoom Out"
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (typeof zoomDiagram === 'function') {
                zoomDiagram(0.8);
            }
        });
    }

    // Кнопка "На весь экран"
    const openFullscreenBtn = document.getElementById('openFullscreenBtn');
    if (openFullscreenBtn) {
        openFullscreenBtn.addEventListener('click', () => {
            if (typeof openFullscreen === 'function') {
                openFullscreen();
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
            // Обновляем UI индивидуальных настроек (если есть)
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
        // 1. Парсим триггеры (replaceYo применяется автоматически внутри)
        let triggers = parseSimpleTriggers(text);
        
        // 2. Валидация
        const validation = validateTriggers(triggers);
        if (!validation.valid) {
            return {
                success: false,
                regex: '',
                info: { errors: validation.errors }
            };
        }
        
        // 3. Удаление дубликатов
        const deduped = removeDuplicatesFromTriggers(triggers);
        triggers = deduped.triggers;
        
        // 4. Применяем оптимизации
        if (typeof applyOptimizations === 'function') {
            triggers = applyOptimizations(triggers, types);
        } else {
            console.warn('[Main] applyOptimizations не найдена, применяем базовое экранирование');
            triggers = triggers.map(t => escapeRegex(t));
        }
        
        // 5. Конвертируем в regex
        const regex = triggers.join('|');
        
        // 6. Валидация длины
        const lengthValidation = validateRegexLength(regex);
        if (!lengthValidation.valid) {
            return {
                success: false,
                regex: '',
                info: { errors: lengthValidation.errors }
            };
        }
        
        return {
            success: true,
            regex: regex,
            info: {
                originalCount: triggers.length + deduped.duplicatesCount,
                finalCount: triggers.length,
                duplicatesRemoved: deduped.duplicatesCount,
                regexLength: regex.length
            }
        };
        
    } catch (error) {
        logError('performConversionWithOptimizations', error);
        return {
            success: false,
            regex: '',
            info: { errors: [error.message] }
        };
    }
}

/* ============================================
   ОБРАБОТЧИК КОНВЕРТАЦИИ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Обработчик кнопки "Конвертировать"
 * 
 * ОБНОВЛЕНО v3.0:
 * - Интеграция с confirm (через performConversion в converter.js)
 * - Использование saveConversionToHistory() вместо старой логики
 * - Поддержка подгрупп в связанных триггерах
 */
function handleConvert() {
    console.log('[Main] ========== НАЧАЛО КОНВЕРТАЦИИ ==========');
    
    try {
        clearAllInlineErrors();

        // Получаем поля
        const simpleTextarea = document.getElementById('simpleTriggers');
        const resultTextarea = document.getElementById('regexResult');

        if (!simpleTextarea || !resultTextarea) {
            console.error('[Main] Textarea не найдены');
            return;
        }

        let text = simpleTextarea.value.trim();

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
        let conversionType = hasLinked ? 'linked' : 'simple'; // Определяем тип

        // ========================================
        // КОНВЕРТАЦИЯ ПРОСТЫХ ТРИГГЕРОВ
        // ========================================
        if (hasSimple) {
            console.log('[Main] --- КОНВЕРТАЦИЯ ПРОСТЫХ ТРИГГЕРОВ ---');
            
            // Получаем глобальные настройки оптимизаций
            const globalTypes = getGlobalOptimizationStates();
            
            console.log('[Main] Глобальные настройки:', globalTypes);
            
            // Парсим триггеры (replaceYo применяется автоматически)
            const triggers = parseSimpleTriggers(text);
            
            console.log(`[Main] Распарсено ${triggers.length} триггеров`);
            
            // ГРУППА 5: Применяем индивидуальные или глобальные настройки
            const triggersWithSettings = triggers.map(trigger => {
                const effectiveSettings = typeof getEffectiveSettings === 'function'
                    ? getEffectiveSettings(trigger, globalTypes)
                    : globalTypes;
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
            const linkedGroups = getLinkedGroups();
            
            console.log(`[Main] Найдено ${linkedGroups.length} связанных групп`);
            
            // Валидация связанных групп
            const validation = validateLinkedGroups();
            if (!validation.valid) {
                console.error('[Main] Валидация связанных групп не прошла:', validation.errors);
                showToast('error', validation.errors[0]);
                return;
            }
            
            // Предупреждения
            if (validation.warnings.length > 0) {
                validation.warnings.forEach(warning => {
                    showToast('warning', warning, 5000);
                });
            }
            
            if (linkedGroups.length > 0) {
                // Конвертируем все группы (с поддержкой подгрупп)
                const linkedRegex = convertLinkedGroups(linkedGroups);
                
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
            showToast('error', 'Не удалось создать regex');
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
        showToast('success', '✓ Regex успешно создан!');
        console.log('[Main] ========== КОНВЕРТАЦИЯ ЗАВЕРШЕНА ==========');
        
    } catch (error) {
        logError('handleConvert', error);
        showToast('error', 'Произошла ошибка при конвертации. Попробуйте еще раз.');
    }
}

/**
 * Обновить счетчик длины regex (НОВОЕ v3.0)
 * @param {number} length - Длина regex
 */
function updateRegexLengthCounter(length) {
    const regexLengthSpan = document.getElementById('regexLength');
    if (!regexLengthSpan) return;
    
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
        
        // Очистка индивидуальных настроек триггеров (если есть)
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
    
    if (typeof confirmAction === 'function') {
        confirmAction(
            'Подтверждение',
            'Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.',
            performReset,
            null
        );
    } else {
        if (window.confirm('Вы уверены, что хотите очистить все данные?')) {
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
    const resultTextarea = document.getElementById('regexResult');
    
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
function confirmClearSimpleTriggers() {
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
                
                if (typeof updateTriggerSettingsUI === 'function') {
                    updateTriggerSettingsUI();
                }
                
                showToast('info', 'Поле очищено');
            },
            null
        );
    } else {
        showToast('info', 'Поле уже пустое');
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
    } else {
        showToast('info', 'Результат уже пустой');
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
    console.log('%c RegexHelper v3.0 ', 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px;');
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

console.log('✓ Модуль main.js загружен (v3.0 с toggleAccordion)');
