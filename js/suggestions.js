/* ============================================
   REGEXHELPER - SUGGESTIONS (UI)
   Управление чекбоксами оптимизации
   ============================================ */

/* ============================================
   КОНСТАНТЫ
   ============================================ */

const STORAGE_KEY_OPTIMIZATIONS = 'regexhelper_optimizations';

// ОБНОВЛЕНО: Дефолтные настройки (все включены, type3 убран, type5 добавлен)
const DEFAULT_OPTIMIZATIONS = {
    type1: true,  // Вариации букв (латиница ↔ кириллица)
    type2: true,  // Опциональные буквы (окончания)
    type4: true,  // Склонения (русские падежи)
    type5: true   // Опциональный символ ?
};

/* ============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================ */

/**
 * Инициализация модуля suggestions
 */
function initSuggestions() {
    // Загружаем сохранённые настройки
    loadOptimizationPreferences();
    
    // Устанавливаем event listeners на чекбоксы
    setupOptimizationListeners();
    
    console.log('[Suggestions] Модуль инициализирован');
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

/**
 * ОБНОВЛЕНО: Установка event listeners для чекбоксов
 */
function setupOptimizationListeners() {
    // ИСПРАВЛЕНО: Правильные ID чекбоксов (без префикса opt)
    const checkboxIds = [
        'type1',
        'type2',
        'type4',
        'type5'
    ];
    
    checkboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        
        if (checkbox) {
            checkbox.addEventListener('change', handleOptimizationChange);
        } else {
            console.warn(`[Suggestions] Чекбокс ${id} не найден`);
        }
    });
}

/**
 * Обработчик изменения чекбокса
 * @param {Event} event - Event объект
 */
function handleOptimizationChange(event) {
    const checkbox = event.target;
    const optimizationType = checkbox.id; // type1, type2, type4, type5
    const isChecked = checkbox.checked;
    
    console.log(`[Suggestions] ${optimizationType} = ${isChecked}`);
    
    // Сохраняем в localStorage
    saveOptimizationPreferences();
}

/* ============================================
   ПОЛУЧЕНИЕ ВЫБРАННЫХ ОПТИМИЗАЦИЙ
   ============================================ */

/**
 * ОБНОВЛЕНО: Получить текущие выбранные оптимизации
 * @returns {Object} - { type1: boolean, type2: boolean, type4: boolean, type5: boolean }
 */
function getSelectedOptimizations() {
    const optimizations = {
        type1: false,
        type2: false,
        type4: false,
        type5: false
    };
    
    // ИСПРАВЛЕНО: Правильные ID
    const checkboxes = {
        type1: document.getElementById('type1'),
        type2: document.getElementById('type2'),
        type4: document.getElementById('type4'),
        type5: document.getElementById('type5')
    };
    
    for (let type in checkboxes) {
        const checkbox = checkboxes[type];
        if (checkbox) {
            optimizations[type] = checkbox.checked;
        }
    }
    
    return optimizations;
}

/**
 * ОБНОВЛЕНО: Проверка: выбрана ли хотя бы одна оптимизация
 * @returns {boolean}
 */
function hasAnyOptimization() {
    const opts = getSelectedOptimizations();
    return opts.type1 || opts.type2 || opts.type4 || opts.type5;
}

/* ============================================
   ЛОКАЛЬНОЕ ХРАНИЛИЩЕ (localStorage)
   ============================================ */

/**
 * Сохранить настройки оптимизаций в localStorage
 */
function saveOptimizationPreferences() {
    try {
        const optimizations = getSelectedOptimizations();
        localStorage.setItem(STORAGE_KEY_OPTIMIZATIONS, JSON.stringify(optimizations));
        console.log('[Suggestions] Настройки сохранены:', optimizations);
    } catch (error) {
        console.error('[Suggestions] Ошибка сохранения в localStorage:', error);
    }
}

/**
 * Загрузить настройки оптимизаций из localStorage
 */
function loadOptimizationPreferences() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_OPTIMIZATIONS);
        
        let optimizations;
        
        if (saved) {
            // Загружаем сохранённые настройки
            optimizations = JSON.parse(saved);
            
            // ВАЖНО: Мигрируем старые настройки (если есть type3, удаляем его)
            if (optimizations.type3 !== undefined) {
                delete optimizations.type3;
            }
            
            // Добавляем type5, если его нет (для старых сохранений)
            if (optimizations.type5 === undefined) {
                optimizations.type5 = true; // По умолчанию включен
            }
            
            console.log('[Suggestions] Загружены сохранённые настройки:', optimizations);
        } else {
            // Используем дефолтные настройки
            optimizations = DEFAULT_OPTIMIZATIONS;
            console.log('[Suggestions] Используются дефолтные настройки');
        }
        
        // Применяем настройки к чекбоксам
        applyOptimizationsToUI(optimizations);
        
    } catch (error) {
        console.error('[Suggestions] Ошибка загрузки из localStorage:', error);
        
        // В случае ошибки используем дефолтные настройки
        applyOptimizationsToUI(DEFAULT_OPTIMIZATIONS);
    }
}

/**
 * ОБНОВЛЕНО: Применить настройки оптимизаций к UI (чекбоксам)
 * @param {Object} optimizations - Объект с настройками
 */
function applyOptimizationsToUI(optimizations) {
    // ИСПРАВЛЕНО: Правильные ID чекбоксов
    const checkboxes = {
        type1: document.getElementById('type1'),
        type2: document.getElementById('type2'),
        type4: document.getElementById('type4'),
        type5: document.getElementById('type5')
    };
    
    for (let type in checkboxes) {
        const checkbox = checkboxes[type];
        if (checkbox && optimizations[type] !== undefined) {
            checkbox.checked = optimizations[type];
        }
    }
}

/**
 * Сбросить настройки оптимизаций к дефолтным
 */
function resetOptimizationPreferences() {
    applyOptimizationsToUI(DEFAULT_OPTIMIZATIONS);
    saveOptimizationPreferences();
    console.log('[Suggestions] Настройки сброшены к дефолтным');
}

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================ */

/**
 * ОБНОВЛЕНО: Включить все оптимизации
 */
function enableAllOptimizations() {
    const checkboxIds = [
        'type1',
        'type2',
        'type4',
        'type5'
    ];
    
    checkboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    saveOptimizationPreferences();
    console.log('[Suggestions] Все оптимизации включены');
}

/**
 * ОБНОВЛЕНО: Выключить все оптимизации
 */
function disableAllOptimizations() {
    const checkboxIds = [
        'type1',
        'type2',
        'type4',
        'type5'
    ];
    
    checkboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    
    saveOptimizationPreferences();
    console.log('[Suggestions] Все оптимизации выключены');
}

/**
 * ОБНОВЛЕНО: Получить количество включённых оптимизаций
 * @returns {number} - Количество включённых оптимизаций (0-4)
 */
function getEnabledOptimizationsCount() {
    const opts = getSelectedOptimizations();
    let count = 0;
    
    if (opts.type1) count++;
    if (opts.type2) count++;
    if (opts.type4) count++;
    if (opts.type5) count++;
    
    return count;
}

/**
 * ОБНОВЛЕНО: Получить список включённых оптимизаций
 * @returns {Array} - Массив имён включённых оптимизаций ['type1', 'type2', 'type4', 'type5']
 */
function getEnabledOptimizationsList() {
    const opts = getSelectedOptimizations();
    const enabled = [];
    
    if (opts.type1) enabled.push('type1');
    if (opts.type2) enabled.push('type2');
    if (opts.type4) enabled.push('type4');
    if (opts.type5) enabled.push('type5');
    
    return enabled;
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

// Экспортируем функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Константы
        DEFAULT_OPTIMIZATIONS,
        
        // Инициализация
        initSuggestions,
        
        // Получение выбранных
        getSelectedOptimizations,
        hasAnyOptimization,
        getEnabledOptimizationsCount,
        getEnabledOptimizationsList,
        
        // Управление
        enableAllOptimizations,
        disableAllOptimizations,
        resetOptimizationPreferences,
        
        // localStorage
        saveOptimizationPreferences,
        loadOptimizationPreferences
    };
}

console.log('✓ Модуль suggestions.js загружен');
