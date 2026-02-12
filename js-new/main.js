/**
 * RegexHelper v4.0 - Main Entry Point
 * @version 4.0.0
 * @date 12.02.2026
 * @description Главный файл приложения с инициализацией всех модулей и event listeners
 */

// ═══════════════════════════════════════════════════════════════════
// IMPORTS - Core Modules
// ═══════════════════════════════════════════════════════════════════
import { APP_CONFIG } from './core/config.js';
import { escapeRegex, pluralize, copyToClipboard, formatDate } from './core/utils.js';
import { showToast, clearAllInlineErrors, logError } from './core/errors.js';
import { parseSimpleTriggers, getTriggerStats } from './core/parser.js';
import { validateTriggers, validateRegexLength } from './core/validator.js';

// ═══════════════════════════════════════════════════════════════════
// IMPORTS - Converter Modules
// ═══════════════════════════════════════════════════════════════════
import { applyOptimizations } from './converter/optimizer.js';
import { 
    initLinkedTriggers,
    getLinkedGroups,
    convertLinkedGroups,
    addGroup,
    removeGroup
} from './converter/linkedTriggers.js';
import { 
    initSimpleTriggers,
    getSimpleTriggers,
    clearSimpleTriggers,
    updateSimpleTriggerCount
} from './converter/simpleTriggers.js';

// ═══════════════════════════════════════════════════════════════════
// IMPORTS - Features
// ═══════════════════════════════════════════════════════════════════
import { initHistory, saveConversionToHistory } from './features/history.js';
import { initExport } from './features/export.js';
import { initDragDrop } from './features/dragDrop.js';
import { showConfirm, openModal, closeModal, initModals } from './features/modals.js';

// ═══════════════════════════════════════════════════════════════════
// IMPORTS - UI Modules
// ═══════════════════════════════════════════════════════════════════
import { initAccordion } from './ui/accordion.js';
import { initClearButtons } from './ui/clearButtons.js';
import { initNotifications } from './ui/notifications.js';

// ═══════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════
const state = {
    currentConnectionMode: 'individual', // individual | common | alternation
    commonDistance: '.{1,10}',
    optimizationTypes: {
        type1: false,
        type2: false,
        type4: false,
        type5: false,
        type6: false
    },
    type6Mode: 'wildcard', // wildcard | exact
    type6WildcardOptions: {
        cyrillic: true,
        latin: true,
        digits: false,
        any: false
    }
};

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Инициализация приложения
 * @description Точка входа - вызывается при загрузке DOM
 */
function initApp() {
    console.log('═'.repeat(50));
    console.log(`🚀 RegexHelper v${APP_CONFIG.VERSION} - Initializing...`);
    console.log('═'.repeat(50));

    try {
        // Инициализация всех модулей
        initAllModules();

        // Установка event listeners
        setupEventListeners();

        // Глобальные event listeners
        setupGlobalEventListeners();

        // Логирование информации о приложении
        logAppInfo();

        console.log('✅ Application initialized successfully!');
        console.log('═'.repeat(50));

    } catch (error) {
        logError('initApp', error);
        showToast('error', '❌ Ошибка инициализации приложения');
    }
}

/**
 * Инициализация всех модулей приложения
 */
function initAllModules() {
    console.log('📦 Initializing modules...');

    // UI модули
    initAccordion();
    initClearButtons();
    initNotifications();
    initModals();

    // Конвертер модули
    initSimpleTriggers();
    initLinkedTriggers();

    // Функциональные модули
    initHistory();
    initExport();
    initDragDrop();

    console.log('✅ All modules initialized');
}

// ═══════════════════════════════════════════════════════════════════
// EVENT LISTENERS - Main Buttons
// ═══════════════════════════════════════════════════════════════════

/**
 * Установка event listeners для основных кнопок
 */
function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    // ───────────────────────────────────────────────────────────────
    // ПАНЕЛЬ 1: ТРИГГЕРЫ
    // ───────────────────────────────────────────────────────────────

    // Режимы связи групп
    setupConnectionModeListeners();

    // Кнопка "Добавить группу"
    const btnAddGroup = document.getElementById('btnAddGroup');
    if (btnAddGroup) {
        btnAddGroup.addEventListener('click', handleAddGroup);
    }

    // Кнопка "Очистить простые триггеры"
    const btnClearSimple = document.getElementById('btnClearSimple');
    if (btnClearSimple) {
        btnClearSimple.addEventListener('click', () => {
            showConfirm(
                '⚠️ Очистить все простые триггеры?',
                'Это действие нельзя отменить.',
                () => {
                    clearSimpleTriggers();
                    showToast('success', '✅ Простые триггеры очищены');
                }
            );
        });
    }

    // ───────────────────────────────────────────────────────────────
    // ПАНЕЛЬ 2: ОПТИМИЗАЦИИ
    // ───────────────────────────────────────────────────────────────

    // Type 1-5 checkboxes
    setupOptimizationCheckboxes();

    // Type 6 специальная логика
    setupType6Listeners();

    // ───────────────────────────────────────────────────────────────
    // ПАНЕЛЬ 3: РЕЗУЛЬТАТ
    // ───────────────────────────────────────────────────────────────

    // Кнопка "Конвертировать"
    const btnConvert = document.getElementById('btnConvert');
    if (btnConvert) {
        btnConvert.addEventListener('click', handleConvert);
    }

    // Кнопка "Копировать"
    const btnCopy = document.getElementById('btnCopy');
    if (btnCopy) {
        btnCopy.addEventListener('click', handleCopyRegex);
    }

    // Кнопка "Экспорт"
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', () => openModal('exportModal'));
    }

    // Кнопка "Очистить результат"
    const btnClearResult = document.getElementById('btnClearResult');
    if (btnClearResult) {
        btnClearResult.addEventListener('click', handleClearResult);
    }

    // ───────────────────────────────────────────────────────────────
    // HEADER BUTTONS
    // ───────────────────────────────────────────────────────────────

    // Кнопка "Regex-справочник"
    const btnRegulations = document.getElementById('btnRegulations');
    if (btnRegulations) {
        btnRegulations.addEventListener('click', () => openModal('regulationsModal'));
    }

    // Кнопка "Помощь"
    const btnWiki = document.getElementById('btnWiki');
    if (btnWiki) {
        btnWiki.addEventListener('click', () => openModal('wikiModal'));
    }

    // Кнопка "Сбросить всё"
    const btnResetAll = document.getElementById('btnResetAll');
    if (btnResetAll) {
        btnResetAll.addEventListener('click', handleResetAll);
    }

    // ───────────────────────────────────────────────────────────────
    // ИСТОРИЯ
    // ───────────────────────────────────────────────────────────────

    // Кнопка "Очистить историю"
    const btnClearHistory = document.getElementById('btnClearHistory');
    if (btnClearHistory) {
        btnClearHistory.addEventListener('click', () => {
            showConfirm(
                '⚠️ Очистить всю историю?',
                'Все записи будут удалены безвозвратно.',
                () => {
                    // TODO: Реализовать clearHistory()
                    showToast('success', '✅ История очищена');
                }
            );
        });
    }

    console.log('✅ Event listeners set up');
}

// ═══════════════════════════════════════════════════════════════════
// CONNECTION MODES - Режимы связи групп
// ═══════════════════════════════════════════════════════════════════

/**
 * Настройка listeners для режимов связи
 */
function setupConnectionModeListeners() {
    const modeRadios = document.querySelectorAll('input[name="connectionMode"]');
    const commonDistanceSelect = document.getElementById('commonDistance');
    const customDistanceInput = document.getElementById('customDistanceInput');
    const customDistanceValue = document.getElementById('customDistanceValue');

    // Переключение режимов
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentConnectionMode = e.target.value;

            // Enable/disable dropdown для "Общий параметр"
            if (commonDistanceSelect) {
                commonDistanceSelect.disabled = (e.target.value !== 'common');
            }

            console.log(`🔄 Connection mode changed: ${e.target.value}`);
        });
    });

    // Изменение общего расстояния
    if (commonDistanceSelect) {
        commonDistanceSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                // Показать поле для своего параметра
                if (customDistanceInput) {
                    customDistanceInput.style.display = 'block';
                }
            } else {
                // Скрыть поле
                if (customDistanceInput) {
                    customDistanceInput.style.display = 'none';
                }
                state.commonDistance = e.target.value;
            }
        });
    }

    // Свой параметр расстояния
    if (customDistanceValue) {
        customDistanceValue.addEventListener('input', (e) => {
            state.commonDistance = e.target.value;
        });
    }
}

// ═══════════════════════════════════════════════════════════════════
// OPTIMIZATIONS - Type 1-6
// ═══════════════════════════════════════════════════════════════════

/**
 * Настройка checkboxes для оптимизаций
 */
function setupOptimizationCheckboxes() {
    // Type 1-5
    const types = [1, 2, 4, 5];
    types.forEach(type => {
        const checkbox = document.getElementById(`type${type}Checkbox`);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                state.optimizationTypes[`type${type}`] = e.target.checked;
                console.log(`🔧 Type ${type}: ${e.target.checked ? 'ON' : 'OFF'}`);
            });
        }
    });
}

/**
 * Настройка Type 6 (Префикс)
 */
function setupType6Listeners() {
    const type6Checkbox = document.getElementById('type6Checkbox');
    const type6Modes = document.getElementById('type6Modes');
    const wildcardOptions = document.getElementById('wildcardOptions');
    const exactOptions = document.getElementById('exactOptions');

    // Toggle Type 6 modes
    if (type6Checkbox && type6Modes) {
        type6Checkbox.addEventListener('change', (e) => {
            state.optimizationTypes.type6 = e.target.checked;

            // Показать/скрыть режимы
            type6Modes.style.display = e.target.checked ? 'block' : 'none';

            console.log(`🔧 Type 6: ${e.target.checked ? 'ON' : 'OFF'}`);
        });
    }

    // Режимы Type 6
    const type6ModeRadios = document.querySelectorAll('input[name="type6Mode"]');
    type6ModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.type6Mode = e.target.value;

            // Показать соответствующие опции
            if (wildcardOptions) {
                wildcardOptions.style.display = (e.target.value === 'wildcard') ? 'block' : 'none';
            }
            if (exactOptions) {
                exactOptions.style.display = (e.target.value === 'exact') ? 'block' : 'none';
            }

            console.log(`🔧 Type 6 mode: ${e.target.value}`);
        });
    });

    // Wildcard options checkboxes
    const wildcardCheckboxes = [
        'wildcardCyrillic',
        'wildcardLatin',
        'wildcardDigits',
        'wildcardAny'
    ];

    wildcardCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                const key = id.replace('wildcard', '').toLowerCase();
                state.type6WildcardOptions[key] = e.target.checked;
                console.log(`🔧 Type 6 wildcard ${key}: ${e.target.checked ? 'ON' : 'OFF'}`);
            });
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS - Основные обработчики событий
// ═══════════════════════════════════════════════════════════════════

/**
 * Обработчик кнопки "Добавить группу"
 */
function handleAddGroup() {
    try {
        addGroup();
        console.log('➕ Group added');
    } catch (error) {
        logError('handleAddGroup', error);
        showToast('error', '❌ Ошибка при добавлении группы');
    }
}

/**
 * Обработчик кнопки "Конвертировать"
 */
function handleConvert() {
    try {
        clearAllInlineErrors();

        // Получить данные
        const simpleTriggers = getSimpleTriggers();
        const linkedGroups = getLinkedGroups();

        const hasSimple = simpleTriggers.length > 0;
        const hasLinked = linkedGroups.length > 0;

        // Проверка наличия триггеров
        if (!hasSimple && !hasLinked) {
            showToast('error', '❌ Добавьте триггеры для конвертации');
            return;
        }

        let regex = '';
        let conversionType = '';

        // Конвертация в зависимости от типа триггеров
        if (hasSimple && !hasLinked) {
            // Только простые триггеры
            regex = convertSimpleTriggers(simpleTriggers);
            conversionType = 'simple';

        } else if (!hasSimple && hasLinked) {
            // Только связанные триггеры
            regex = convertLinkedGroups();
            conversionType = 'linked';

        } else {
            // Оба типа - объединить
            const simpleRegex = convertSimpleTriggers(simpleTriggers);
            const linkedRegex = convertLinkedGroups();
            regex = `(${simpleRegex})|(${linkedRegex})`;
            conversionType = 'mixed';
        }

        if (!regex) {
            showToast('error', '❌ Ошибка конвертации');
            return;
        }

        // Валидация длины
        if (!validateRegexLength(regex)) {
            return;
        }

        // Отображение результата
        renderRegexResult(regex);

        // Сохранение в историю
        saveConversionToHistory({
            regex,
            type: conversionType,
            timestamp: Date.now(),
            triggerCount: simpleTriggers.length + (linkedGroups.length > 0 ? 1 : 0)
        });

        showToast('success', '✅ Regex успешно создан!');

    } catch (error) {
        logError('handleConvert', error);
        showToast('error', '❌ Ошибка при конвертации');
    }
}

/**
 * Конвертация простых триггеров с применением оптимизаций
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {string} - Regex
 */
function convertSimpleTriggers(triggers) {
    if (!validateTriggers(triggers)) {
        return '';
    }

    // Применить оптимизации если включены
    const activeTypes = Object.keys(state.optimizationTypes)
        .filter(key => state.optimizationTypes[key])
        .map(key => parseInt(key.replace('type', '')));

    let regex;
    if (activeTypes.length > 0) {
        regex = applyOptimizations(triggers, activeTypes, state);
    } else {
        // Без оптимизаций - простая альтернация
        regex = triggers.map(t => escapeRegex(t)).join('|');
    }

    return regex;
}

/**
 * Отображение результата конвертации
 * @param {string} regex - Регулярное выражение
 */
function renderRegexResult(regex) {
    const textarea = document.getElementById('regexOutput');
    if (!textarea) return;

    textarea.value = regex;

    // Показать статистику
    showToast('info', `📊 Длина regex: ${regex.length} символов`);
}

/**
 * Обработчик кнопки "Копировать"
 */
async function handleCopyRegex() {
    const textarea = document.getElementById('regexOutput');
    if (!textarea) return;

    const regex = textarea.value.trim();
    if (!regex) {
        showToast('warning', '⚠️ Нет regex для копирования');
        return;
    }

    try {
        const success = await copyToClipboard(regex);
        if (success) {
            showToast('success', '✅ Regex скопирован в буфер обмена');

            // Визуальная обратная связь на кнопке
            const btnCopy = document.getElementById('btnCopy');
            if (btnCopy) {
                const originalHTML = btnCopy.innerHTML;
                btnCopy.innerHTML = '<span class="btn-icon-inline">✅</span> Скопировано!';
                btnCopy.disabled = true;

                setTimeout(() => {
                    btnCopy.innerHTML = originalHTML;
                    btnCopy.disabled = false;
                }, 2000);
            }
        } else {
            showToast('error', '❌ Не удалось скопировать');
        }
    } catch (error) {
        logError('handleCopyRegex', error);
        showToast('error', '❌ Ошибка копирования');
    }
}

/**
 * Обработчик кнопки "Очистить результат"
 */
function handleClearResult() {
    const textarea = document.getElementById('regexOutput');
    if (!textarea) return;

    if (textarea.value.trim()) {
        showConfirm(
            '⚠️ Очистить результат?',
            'Текущий regex будет удален.',
            () => {
                textarea.value = '';
                showToast('success', '✅ Результат очищен');
            }
        );
    }
}

/**
 * Обработчик кнопки "Сбросить всё"
 */
function handleResetAll() {
    showConfirm(
        '⚠️ Сбросить все данные?',
        'Все триггеры, настройки и результат будут очищены. История останется.',
        () => {
            // Очистить простые триггеры
            clearSimpleTriggers();

            // Очистить связанные триггеры
            // TODO: реализовать clearLinkedGroups()

            // Очистить результат
            const textarea = document.getElementById('regexOutput');
            if (textarea) textarea.value = '';

            // Сбросить оптимизации
            Object.keys(state.optimizationTypes).forEach(key => {
                state.optimizationTypes[key] = false;
                const checkbox = document.getElementById(`${key}Checkbox`);
                if (checkbox) checkbox.checked = false;
            });

            // Сбросить режим связи
            const modeIndividual = document.getElementById('modeIndividual');
            if (modeIndividual) modeIndividual.checked = true;
            state.currentConnectionMode = 'individual';

            showToast('success', '✅ Все данные очищены');
        }
    );
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Глобальные event listeners (shortcuts, error handling)
 */
function setupGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Global error handler
    window.addEventListener('error', (e) => {
        logError('window.error', e.error);
    });

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

/**
 * Обработчик клавиатурных сочетаний
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter - Конвертировать
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleConvert();
    }

    // Ctrl/Cmd + R - Сбросить (с подтверждением)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'r' || event.key === 'R')) {
        event.preventDefault();
        handleResetAll();
    }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Логирование информации о приложении
 */
function logAppInfo() {
    console.log(`📱 App: ${APP_CONFIG.APP_NAME}`);
    console.log(`🔢 Version: ${APP_CONFIG.VERSION}`);
    console.log(`📏 Max regex length: ${APP_CONFIG.MAX_REGEX_LENGTH}`);
    console.log(`⏱️ Debounce delay: ${APP_CONFIG.DEBOUNCE_DELAY}ms`);
}

// ═══════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initApp);

// Экспорт для тестирования
export { 
    initApp,
    handleConvert,
    handleCopyRegex,
    convertSimpleTriggers,
    state
};
