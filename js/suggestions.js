/* ============================================
   REGEXHELPER - SUGGESTIONS (UI)
   Управление чекбоксами оптимизации
   ============================================ */

/* ============================================
   КОНСТАНТЫ
   ============================================ */

const STORAGE_KEY_OPTIMIZATIONS = 'regexhelper_optimizations';

// Дефолтные настройки (все включены)
const DEFAULT_OPTIMIZATIONS = {
    type1: true,  // Повторы (префиксы)
    type2: true,  // Общий корень (окончания 1-2 буквы)
    type3: true,  // Вариации букв (латиница ↔ кириллица)
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
 * Установка event listeners для чекбоксов
 */
function setupOptimizationListeners() {
    // ПРАВИЛЬНЫЕ ID чекбоксов (с префиксом opt)
    const checkboxIds = [
        'optType1',
        'optType2',
        'optType3',
        'optType4',
        'optType5'
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
    const optimizationType = checkbox.id.replace('opt', '').toLowerCase(); // optType1 → type1
    const isChecked = checkbox.checked;
    
    console.log(`[Suggestions] ${optimizationType} = ${isChecked}`);
    
    // Сохраняем в localStorage
    saveOptimizationPreferences();
}

/* ============================================
   ПОЛУЧЕНИЕ ВЫБРАННЫХ ОПТИМИЗАЦИЙ
   ============================================ */

/**
 * Получить текущие выбранные оптимизации
 * @returns {Object} - { type1: boolean, type2: boolean, type3: boolean, type4: boolean, type5: boolean }
 */
function getSelectedOptimizations() {
    const optimizations = {
        type1: false,
        type2: false,
        type3: false,
        type4: false,
        type5: false
    };
    
    // ПРАВИЛЬНЫЕ ID
    const checkboxes = {
        type1: document.getElementById('optType1'),
        type2: document.getElementById('optType2'),
        type3: document.getElementById('optType3'),
        type4: document.getElementById('optType4'),
        type5: document.getElementById('optType5')
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
 * Проверка: выбрана ли хотя бы одна оптимизация
 * @returns {boolean}
 */
function hasAnyOptimization() {
    const opts = getSelectedOptimizations();
    return opts.type1 || opts.type2 || opts.type3 || opts.type4 || opts.type5;
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
 * Применить настройки оптимизаций к UI (чекбоксам)
 * @param {Object} optimizations - Объект с настройками
 */
function applyOptimizationsToUI(optimizations) {
    // ПРАВИЛЬНЫЕ ID чекбоксов
    const checkboxes = {
        type1: document.getElementById('optType1'),
        type2: document.getElementById('optType2'),
        type3: document.getElementById('optType3'),
        type4: document.getElementById('optType4'),
        type5: document.getElementById('optType5')
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
 * Включить все оптимизации
 */
function enableAllOptimizations() {
    const checkboxIds = [
        'optType1',
        'optType2',
        'optType3',
        'optType4',
        'optType5'
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
 * Выключить все оптимизации
 */
function disableAllOptimizations() {
    const checkboxIds = [
        'optType1',
        'optType2',
        'optType3',
        'optType4',
        'optType5'
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
 * Получить количество включённых оптимизаций
 * @returns {number} - Количество включённых оптимизаций (0-5)
 */
function getEnabledOptimizationsCount() {
    const opts = getSelectedOptimizations();
    let count = 0;
    
    if (opts.type1) count++;
    if (opts.type2) count++;
    if (opts.type3) count++;
    if (opts.type4) count++;
    if (opts.type5) count++;
    
    return count;
}

/**
 * Получить список включённых оптимизаций
 * @returns {Array} - Массив имён включённых оптимизаций ['type1', 'type2', 'type3', 'type4', 'type5']
 */
function getEnabledOptimizationsList() {
    const opts = getSelectedOptimizations();
    const enabled = [];
    
    if (opts.type1) enabled.push('type1');
    if (opts.type2) enabled.push('type2');
    if (opts.type3) enabled.push('type3');
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
