/* ============================================
   REGEXHELPER - SUGGESTIONS
   Индивидуальные настройки триггеров
   ============================================ */

/**
 * Модуль для работы с индивидуальными настройками триггеров
 * Хранит настройки оптимизаций для каждого триггера отдельно
 */

// Глобальный объект для хранения индивидуальных настроек
const triggerSettings = new Map(); // Map<triggerText, {type1, type2, type3, type4, type5}>

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
                triggerSettings.set(trigger, parsed[trigger]);
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
 * @returns {Object|null} - Настройки или null
 */
function getTriggerSettings(trigger) {
    return triggerSettings.get(trigger) || null;
}

/**
 * Установить настройки для триггера
 * @param {string} trigger - Текст триггера
 * @param {Object} settings - Настройки {type1, type2, type3, type4, type5}
 */
function setTriggerSettings(trigger, settings) {
    triggerSettings.set(trigger, settings);
    saveTriggerSettings();
    console.log('[Suggestions] Настройки установлены для:', trigger, settings);
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
 * @param {string} trigger - Текст триггера
 * @param {Object} globalTypes - Глобальные настройки {type1, type2, type3, type4, type5}
 * @returns {Object} - Финальные настройки для триггера
 */
function getEffectiveSettings(trigger, globalTypes) {
    const individual = getTriggerSettings(trigger);
    
    if (individual) {
        console.log('[Suggestions] Используем индивидуальные настройки для:', trigger);
        return individual;
    }
    
    return globalTypes;
}

/* ============================================
   ГЛОБАЛЬНЫЕ НАСТРОЙКИ ОПТИМИЗАЦИЙ
   ============================================ */

/**
 * Объект для хранения состояния глобальных чекбоксов
 */
const globalOptimizationStates = {
    type1: true,
    type2: true,
    type3: true,
    type4: true,
    type5: true
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
            Object.assign(globalOptimizationStates, parsed);
            console.log('[Suggestions] Загружены сохранённые настройки:', globalOptimizationStates);
        }
    } catch (error) {
        console.error('[Suggestions] Ошибка загрузки настроек:', error);
    }
}

/**
 * Применение сохранённых состояний к чекбоксам
 */
function applyGlobalOptimizationStates() {
    for (let i = 1; i <= 5; i++) {
        const checkbox = document.getElementById(`optType${i}`);
        if (checkbox) {
            checkbox.checked = globalOptimizationStates[`type${i}`];
        }
    }
}

/**
 * Обработчик изменения глобального чекбокса
 */
function handleGlobalOptimizationChange(typeNumber, isChecked) {
    globalOptimizationStates[`type${typeNumber}`] = isChecked;
    saveGlobalOptimizationStates();
    console.log('[Suggestions]', `type${typeNumber}`, '=', isChecked);
}

/**
 * Получение текущих состояний глобальных оптимизаций
 */
function getGlobalOptimizationStates() {
    return {
        type1: document.getElementById('optType1')?.checked || false,
        type2: document.getElementById('optType2')?.checked || false,
        type3: document.getElementById('optType3')?.checked || false,
        type4: document.getElementById('optType4')?.checked || false,
        type5: document.getElementById('optType5')?.checked || false
    };
}

/* ============================================
   UI ДЛЯ ИНДИВИДУАЛЬНЫХ НАСТРОЕК
   ============================================ */

/**
 * Обновление UI textarea с кнопками настроек
 */
function updateTriggerSettingsUI() {
    const textarea = document.getElementById('simpleTriggers');
    if (!textarea) return;
    
    const triggers = parseSimpleTriggers(textarea.value);
    
    // Создаем контейнер для кнопок если его нет
    let buttonsContainer = document.getElementById('triggerSettingsButtons');
    if (!buttonsContainer) {
        buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'triggerSettingsButtons';
        buttonsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;';
        textarea.parentElement.appendChild(buttonsContainer);
    }
    
    // Очищаем контейнер
    buttonsContainer.innerHTML = '';
    
    // Создаем кнопку для каждого триггера
    triggers.forEach((trigger, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-icon';
        btn.title = `Настройки для "${trigger}"`;
        btn.style.cssText = 'font-size: 12px; padding: 4px 8px;';
        
        // Проверяем есть ли индивидуальные настройки
        const hasSettings = hasTriggerSettings(trigger);
        btn.textContent = hasSettings ? '⚙️✓' : '⚙️';
        btn.style.background = hasSettings ? '#4CAF50' : '';
        btn.style.color = hasSettings ? 'white' : '';
        
        btn.onclick = () => openTriggerSettingsModal(trigger);
        
        const label = document.createElement('span');
        label.textContent = trigger.length > 15 ? trigger.substring(0, 15) + '...' : trigger;
        label.style.cssText = 'font-size: 12px; margin-right: 5px;';
        
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; align-items: center; gap: 5px;';
        wrapper.appendChild(label);
        wrapper.appendChild(btn);
        
        buttonsContainer.appendChild(wrapper);
    });
}

/**
 * Открытие модального окна настроек триггера
 */
function openTriggerSettingsModal(trigger) {
    const modal = document.getElementById('triggerSettingsModal');
    const title = document.getElementById('triggerSettingsTitle');
    
    if (!modal || !title) return;
    
    // Устанавливаем заголовок
    title.textContent = trigger;
    
    // Загружаем текущие настройки (индивидуальные или глобальные)
    const settings = getTriggerSettings(trigger) || getGlobalOptimizationStates();
    
    // Применяем к чекбоксам
    for (let i = 1; i <= 5; i++) {
        const checkbox = document.getElementById(`triggerOptType${i}`);
        if (checkbox) {
            checkbox.checked = settings[`type${i}`];
        }
    }
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    
    // Обработчик кнопки "Применить"
    const applyBtn = document.getElementById('applyTriggerSettingsBtn');
    if (applyBtn) {
        applyBtn.onclick = () => {
            const newSettings = {
                type1: document.getElementById('triggerOptType1')?.checked || false,
                type2: document.getElementById('triggerOptType2')?.checked || false,
                type3: document.getElementById('triggerOptType3')?.checked || false,
                type4: document.getElementById('triggerOptType4')?.checked || false,
                type5: document.getElementById('triggerOptType5')?.checked || false
            };
            
            setTriggerSettings(trigger, newSettings);
            closeModal('triggerSettingsModal');
            updateTriggerSettingsUI();
            showToast('success', `Настройки применены для "${trigger}"`);
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
    
    // Добавляем обработчики на глобальные чекбоксы
    for (let i = 1; i <= 5; i++) {
        const checkbox = document.getElementById(`optType${i}`);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                handleGlobalOptimizationChange(i, e.target.checked);
            });
        }
    }
    
    // Обновляем UI при изменении textarea
    const textarea = document.getElementById('simpleTriggers');
    if (textarea) {
        textarea.addEventListener('input', () => {
            updateTriggerSettingsUI();
        });
        
        // Первоначальное обновление
        updateTriggerSettingsUI();
    }
    
    console.log('[Suggestions] Модуль инициализирован');
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

console.log('✓ Модуль suggestions.js загружен');
