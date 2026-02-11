/* ============================================
   REGEXHELPER - SUGGESTIONS
   Индивидуальные настройки триггеров
   
   ВЕРСИЯ: 2.0 FINAL
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ:
   - CRIT-1: Удален type3 из настроек триггеров
   - Теперь только: type1, type2, type4, type5
   - Type 3 используется ТОЛЬКО для связанных групп
   - ДОБАВЛЕНО: Safe функции с fallback
   - ДОБАВЛЕНО: Полный экспорт функций
   - УЛУЧШЕНО: Проверки зависимостей
   
   ЗАВИСИМОСТИ:
   - converter.js (parseSimpleTriggers)
   - errors.js (showToast)
   - utils.js или errors.js (closeModal)
   ============================================ */

/**
 * Модуль для работы с индивидуальными настройками триггеров
 * Хранит настройки оптимизаций для каждого триггера отдельно
 * 
 * ВАЖНО: Type 3 НЕ используется для простых триггеров!
 * Type 3 = расстояние между словами (только для связанных групп)
 */

// Глобальный объект для хранения индивидуальных настроек
const triggerSettings = new Map(); // Map<triggerText, {type1, type2, type4, type5}>

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
 * Безопасное закрытие модального окна
 */
function closeModalSafe(modalId) {
    if (typeof closeModal === 'function') {
        closeModal(modalId);
        return;
    }
    
    // Fallback
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

/**
 * Безопасный парсинг триггеров
 */
function parseSimpleTriggersSafe(text) {
    if (typeof parseSimpleTriggers === 'function') {
        return parseSimpleTriggers(text);
    }
    
    // Fallback
    if (!text) return [];
    return text.split('\n')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);
}

/* ============================================
   ИНДИВИДУАЛЬНЫЕ НАСТРОЙКИ ТРИГГЕРОВ
   ============================================ */

/**
 * Сохранение настроек триггера в localStorage
 */
function saveTriggerSettings() {
    try {
        const data = {};
        triggerSettings.forEach((settings, trigger) => {
            data[trigger] = settings;
        });
        localStorage.setItem('regexhelper_trigger_settings', JSON.stringify(data));
        console.log('[Suggestions] Настройки триггеров сохранены:', Object.keys(data).length, 'триггеров');
    } catch (error) {
        console.error('[Suggestions] Ошибка сохранения настроек триггеров:', error);
    }
}

/**
 * Загрузка настроек триггеров из localStorage
 */
function loadTriggerSettings() {
    try {
        const data = localStorage.getItem('regexhelper_trigger_settings');
        if (data) {
            const parsed = JSON.parse(data);
            Object.keys(parsed).forEach(trigger => {
                // ИСПРАВЛЕНИЕ CRIT-1: Удаляем type3 если он есть в старых данных
                const settings = parsed[trigger];
                if (settings.type3 !== undefined) {
                    delete settings.type3;
                    console.log('[Suggestions] Удален type3 из настроек триггера:', trigger);
                }
                triggerSettings.set(trigger, settings);
            });
            console.log('[Suggestions] Настройки триггеров загружены:', triggerSettings.size, 'триггеров');
        }
    } catch (error) {
        console.error('[Suggestions] Ошибка загрузки настроек триггеров:', error);
    }
}

/**
 * Получить настройки для конкретного триггера
 * @param {string} trigger - Текст триггера
 * @returns {Object|null} - Настройки {type1, type2, type4, type5} или null
 */
function getTriggerSettings(trigger) {
    return triggerSettings.get(trigger) || null;
}

/**
 * Установить настройки для триггера
 * @param {string} trigger - Текст триггера
 * @param {Object} settings - Настройки {type1, type2, type4, type5}
 */
function setTriggerSettings(trigger, settings) {
    // ИСПРАВЛЕНИЕ CRIT-1: Удаляем type3 если он передан
    const cleanSettings = { ...settings };
    if (cleanSettings.type3 !== undefined) {
        delete cleanSettings.type3;
        console.log('[Suggestions] Type 3 удален из настроек (не используется для триггеров)');
    }
    
    triggerSettings.set(trigger, cleanSettings);
    saveTriggerSettings();
    console.log('[Suggestions] Настройки установлены для:', trigger, cleanSettings);
}

/**
 * Удалить настройки триггера
 * @param {string} trigger - Текст триггера
 */
function removeTriggerSettings(trigger) {
    triggerSettings.delete(trigger);
    saveTriggerSettings();
    console.log('[Suggestions] Настройки удалены для:', trigger);
}

/**
 * Проверить, есть ли индивидуальные настройки у триггера
 * @param {string} trigger - Текст триггера
 * @returns {boolean}
 */
function hasTriggerSettings(trigger) {
    return triggerSettings.has(trigger);
}

/**
 * Очистить все настройки триггеров
 */
function clearAllTriggerSettings() {
    triggerSettings.clear();
    localStorage.removeItem('regexhelper_trigger_settings');
    console.log('[Suggestions] Все настройки триггеров очищены');
}

/**
 * Получить настройки оптимизаций для триггера (индивидуальные или глобальные)
 * 
 * ВАЖНО: Type 3 НЕ возвращается! Используется только для связанных групп.
 * 
 * @param {string} trigger - Текст триггера
 * @param {Object} globalTypes - Глобальные настройки {type1, type2, type4, type5}
 * @returns {Object} - Финальные настройки для триггера {type1, type2, type4, type5}
 */
function getEffectiveSettings(trigger, globalTypes) {
    const individual = getTriggerSettings(trigger);
    
    if (individual) {
        console.log('[Suggestions] Используем индивидуальные настройки для:', trigger);
        return individual;
    }
    
    // ИСПРАВЛЕНИЕ CRIT-1: Убираем type3 из глобальных настроек
    const cleanGlobalTypes = { ...globalTypes };
    if (cleanGlobalTypes.type3 !== undefined) {
        delete cleanGlobalTypes.type3;
    }
    
    return cleanGlobalTypes;
}

/* ============================================
   ГЛОБАЛЬНЫЕ НАСТРОЙКИ ОПТИМИЗАЦИЙ
   ============================================ */

/**
 * Объект для хранения состояния глобальных чекбоксов
 * 
 * ВАЖНО: Type 3 УДАЛЕН! (CRIT-1 исправлен)
 * Type 3 используется только для связанных групп.
 */
const globalOptimizationStates = {
    type1: true,  // Вариации букв (латиница↔кириллица)
    type2: true,  // Общий корень
    // type3: УДАЛЕН! (только для связанных групп)
    type4: true,  // Склонения
    type5: true   // Опциональный ?
};

/**
 * Сохранение состояния глобальных оптимизаций в localStorage
 */
function saveGlobalOptimizationStates() {
    try {
        localStorage.setItem('regexhelper_global_optimizations', JSON.stringify(globalOptimizationStates));
        console.log('[Suggestions] Настройки сохранены:', globalOptimizationStates);
    } catch (error) {
        console.error('[Suggestions] Ошибка сохранения настроек:', error);
    }
}

/**
 * Загрузка состояния глобальных оптимизаций из localStorage
 */
function loadGlobalOptimizationStates() {
    try {
        const saved = localStorage.getItem('regexhelper_global_optimizations');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // ИСПРАВЛЕНИЕ CRIT-1: Удаляем type3 если он есть в старых данных
            if (parsed.type3 !== undefined) {
                delete parsed.type3;
                console.log('[Suggestions] Type 3 удален из глобальных настроек (старые данные)');
            }
            
            Object.assign(globalOptimizationStates, parsed);
            console.log('[Suggestions] Загружены сохранённые настройки:', globalOptimizationStates);
        }
    } catch (error) {
        console.error('[Suggestions] Ошибка загрузки настроек:', error);
    }
}

/**
 * Применение сохранённых состояний к чекбоксам
 * 
 * ВАЖНО: Type 3 пропущен (чекбокса для него нет)
 */
function applyGlobalOptimizationStates() {
    // Только Type 1, 2, 4, 5 (без Type 3!)
    const types = [1, 2, 4, 5];
    
    types.forEach(i => {
        const checkbox = document.getElementById(`optType${i}`);
        if (checkbox) {
            checkbox.checked = globalOptimizationStates[`type${i}`];
        }
    });
}

/**
 * Обработчик изменения глобального чекбокса
 */
function handleGlobalOptimizationChange(typeNumber, isChecked) {
    // ИСПРАВЛЕНИЕ CRIT-1: Игнорируем type3
    if (typeNumber === 3) {
        console.warn('[Suggestions] Type 3 не используется для простых триггеров');
        return;
    }
    
    globalOptimizationStates[`type${typeNumber}`] = isChecked;
    saveGlobalOptimizationStates();
    console.log('[Suggestions]', `type${typeNumber}`, '=', isChecked);
}

/**
 * Получение текущих состояний глобальных оптимизаций
 * 
 * ВАЖНО: Type 3 НЕ включен (CRIT-1 исправлен)
 * 
 * @returns {Object} - {type1, type2, type4, type5}
 */
function getGlobalOptimizationStates() {
    return {
        type1: document.getElementById('optType1')?.checked || false,
        type2: document.getElementById('optType2')?.checked || false,
        // type3: УДАЛЕН! (только для связанных групп)
        type4: document.getElementById('optType4')?.checked || false,
        type5: document.getElementById('optType5')?.checked || false
    };
}

/* ============================================
   UI ДЛЯ ИНДИВИДУАЛЬНЫХ НАСТРОЕК
   ============================================ */

/**
 * Очистка устаревших настроек триггеров
 * Удаляет настройки для триггеров, которых больше нет в поле ввода
 */
function cleanupStaleSettings() {
    const textarea = document.getElementById('simpleTriggers');
    if (!textarea) return;
    
    const currentTriggers = parseSimpleTriggersSafe(textarea.value);
    const currentTriggerSet = new Set(currentTriggers);
    
    // Удаляем настройки для триггеров, которых больше нет
    const toRemove = [];
    triggerSettings.forEach((settings, trigger) => {
        if (!currentTriggerSet.has(trigger)) {
            toRemove.push(trigger);
        }
    });
    
    toRemove.forEach(trigger => {
        triggerSettings.delete(trigger);
        console.log('[Suggestions] Удалены устаревшие настройки для:', trigger);
    });
    
    if (toRemove.length > 0) {
        saveTriggerSettings();
    }
}

/**
 * Обновление UI textarea с кнопками настроек
 */
function updateTriggerSettingsUI() {
    // Очистка устаревших настроек
    cleanupStaleSettings();
    
    const textarea = document.getElementById('simpleTriggers');
    if (!textarea) return;
    
    const triggers = parseSimpleTriggersSafe(textarea.value);
    
    // Создаем контейнер для кнопок если его нет
    let buttonsContainer = document.getElementById('triggerSettingsButtons');
    if (!buttonsContainer) {
        buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'triggerSettingsButtons';
        buttonsContainer.className = 'trigger-settings-buttons';
        textarea.parentElement.appendChild(buttonsContainer);
    }
    
    // Очищаем контейнер
    buttonsContainer.innerHTML = '';
    
    // Если нет триггеров, скрываем контейнер
    if (triggers.length === 0) {
        buttonsContainer.style.display = 'none';
        return;
    }
    
    buttonsContainer.style.display = 'flex';
    
    // Создаем кнопку для каждого триггера
    triggers.forEach((trigger, index) => {
        // Проверяем есть ли индивидуальные настройки
        const hasSettings = hasTriggerSettings(trigger);
        
        // Контейнер для триггера
        const wrapper = document.createElement('div');
        wrapper.className = `trigger-settings-item ${hasSettings ? 'has-settings' : ''}`;
        
        // Название триггера
        const label = document.createElement('span');
        label.className = 'trigger-label';
        label.textContent = trigger.length > 20 ? trigger.substring(0, 20) + '...' : trigger;
        label.title = trigger;
        
        // Иконка настроек
        const icon = document.createElement('span');
        icon.className = 'trigger-icon';
        icon.textContent = hasSettings ? '⚙️✓' : '⚙️';
        
        wrapper.appendChild(label);
        wrapper.appendChild(icon);
        
        // Обработчик клика
        wrapper.onclick = () => openTriggerSettingsModal(trigger);
        
        buttonsContainer.appendChild(wrapper);
    });
}

/**
 * Открытие модального окна настроек триггера
 * 
 * ВАЖНО: Type 3 НЕ отображается (CRIT-1 исправлен)
 */
function openTriggerSettingsModal(trigger) {
    const modal = document.getElementById('triggerSettingsModal');
    const title = document.getElementById('triggerSettingsTitle');
    
    if (!modal || !title) return;
    
    // Устанавливаем заголовок
    title.textContent = trigger;
    
    // Загружаем текущие настройки (индивидуальные или глобальные)
    const settings = getTriggerSettings(trigger) || getGlobalOptimizationStates();
    
    // Применяем к чекбоксам (ТОЛЬКО Type 1, 2, 4, 5 - БЕЗ Type 3!)
    const types = [1, 2, 4, 5];
    types.forEach(i => {
        const checkbox = document.getElementById(`triggerOptType${i}`);
        if (checkbox) {
            checkbox.checked = settings[`type${i}`] || false;
        }
    });
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Обработчик кнопки "Применить"
    const applyBtn = document.getElementById('applyTriggerSettingsBtn');
    if (applyBtn) {
        // Удаляем старые обработчики
        applyBtn.onclick = null;
        applyBtn.onclick = () => {
            // ИСПРАВЛЕНИЕ CRIT-1: Собираем только type1, 2, 4, 5 (БЕЗ type3!)
            const newSettings = {
                type1: document.getElementById('triggerOptType1')?.checked || false,
                type2: document.getElementById('triggerOptType2')?.checked || false,
                // type3: ПРОПУЩЕН! (не используется для триггеров)
                type4: document.getElementById('triggerOptType4')?.checked || false,
                type5: document.getElementById('triggerOptType5')?.checked || false
            };
            
            // Проверяем, все ли галочки сняты
            const allUnchecked = !newSettings.type1 && !newSettings.type2 && 
                                 !newSettings.type4 && !newSettings.type5;
            
            if (allUnchecked) {
                // Если все галочки сняты - удаляем индивидуальные настройки
                removeTriggerSettings(trigger);
                closeModalSafe('triggerSettingsModal');
                
                setTimeout(() => {
                    updateTriggerSettingsUI();
                }, 100);
                
                showToastSafe('info', `Настройки сброшены для "${trigger}". Используются глобальные.`);
            } else {
                // Если хотя бы одна галочка стоит - сохраняем индивидуальные настройки
                setTriggerSettings(trigger, newSettings);
                closeModalSafe('triggerSettingsModal');
                
                setTimeout(() => {
                    updateTriggerSettingsUI();
                }, 100);
                
                showToastSafe('success', `Настройки применены для "${trigger}"`);
            }
        };
    }
    
    // Обработчик кнопки "Сбросить настройки"
    const resetBtn = document.getElementById('resetTriggerSettingsBtn');
    if (resetBtn) {
        // Удаляем старые обработчики
        resetBtn.onclick = null;
        resetBtn.onclick = () => {
            // Сразу удаляем настройки без подтверждения
            removeTriggerSettings(trigger);
            closeModalSafe('triggerSettingsModal');
            
            // Обновляем UI после закрытия модалки
            setTimeout(() => {
                updateTriggerSettingsUI();
            }, 100);
            
            showToastSafe('info', `Настройки сброшены для "${trigger}". Используются глобальные.`);
        };
    }
}

/* ============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================ */

/**
 * Инициализация модуля suggestions
 */
function initSuggestions() {
    // Загружаем глобальные настройки
    loadGlobalOptimizationStates();
    applyGlobalOptimizationStates();
    
    // Загружаем индивидуальные настройки триггеров
    loadTriggerSettings();
    
    // Добавляем обработчики на глобальные чекбоксы (ТОЛЬКО 1, 2, 4, 5 - БЕЗ 3!)
    const types = [1, 2, 4, 5];
    types.forEach(i => {
        const checkbox = document.getElementById(`optType${i}`);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                handleGlobalOptimizationChange(i, e.target.checked);
            });
        }
    });
    
    // Обновляем UI при изменении textarea
    const textarea = document.getElementById('simpleTriggers');
    if (textarea) {
        textarea.addEventListener('input', () => {
            updateTriggerSettingsUI();
        });
        
        // Первоначальное обновление
        updateTriggerSettingsUI();
    }
    
    console.log('[Suggestions] ✅ Модуль инициализирован (v2.0 FINAL - CRIT-1 исправлен)');
}

/* ============================================
   ЭКСПОРТ (РАСШИРЕННЫЙ v2.0 FINAL)
   ============================================ */

// Индивидуальные настройки триггеров
window.getTriggerSettings = getTriggerSettings;
window.setTriggerSettings = setTriggerSettings;
window.removeTriggerSettings = removeTriggerSettings;
window.hasTriggerSettings = hasTriggerSettings;
window.clearAllTriggerSettings = clearAllTriggerSettings;
window.getEffectiveSettings = getEffectiveSettings;

// Глобальные настройки оптимизаций
window.getGlobalOptimizationStates = getGlobalOptimizationStates;
window.saveGlobalOptimizationStates = saveGlobalOptimizationStates;
window.loadGlobalOptimizationStates = loadGlobalOptimizationStates;
window.applyGlobalOptimizationStates = applyGlobalOptimizationStates;

// UI
window.updateTriggerSettingsUI = updateTriggerSettingsUI;
window.openTriggerSettingsModal = openTriggerSettingsModal;

// Инициализация
window.initSuggestions = initSuggestions;

console.log('✅ Модуль suggestions.js загружен (v2.0 FINAL - Type 3 удален из настроек триггеров)');
