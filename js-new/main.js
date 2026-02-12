/**
 * RegexHelper v4.0 - Main Entry Point
 * Главный файл приложения, инициализация всех модулей, event listeners
 * 
 * @version 4.0.0
 * @date 12.02.2026
 * @description Главная точка входа приложения
 */

// ========================================
// IMPORTS - Core Modules
// ========================================
import { APPCONFIG } from './core/config.js';
import { escapeRegex, pluralize, copyToClipboard, formatDate } from './core/utils.js';
import { showToast, clearAllInlineErrors, logError, initErrorHandling } from './core/errors.js';

// ========================================
// IMPORTS - Features (пока заглушки)
// ========================================
// TODO: Раскомментировать когда создадим модули
// import { initHistory } from './features/history.js';
// import { initExport } from './features/export.js';
// import { initModals, openModal, closeModal, showConfirm } from './features/modals.js';

// ========================================
// IMPORTS - UI (пока заглушки)
// ========================================
// TODO: Раскомментировать когда создадим модули
// import { initAccordion } from './ui/accordion.js';
// import { initClearButtons } from './ui/clearButtons.js';

// ========================================
// GLOBAL STATE
// ========================================
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

// ========================================
// INITIALIZATION
// ========================================

/**
 * Инициализация приложения - главная точка входа
 * Вызывается автоматически после загрузки DOM
 * @returns {void}
 */
function initApp() {
  console.log('='.repeat(50));
  console.log(`🚀 RegexHelper v${APPCONFIG.VERSION} - Initializing...`);
  console.log('='.repeat(50));

  try {
    // 1. Инициализировать обработчик ошибок
    initErrorHandling();

    // 2. Инициализировать все модули
    initAllModules();

    // 3. Настроить event listeners
    setupEventListeners();

    // 4. Вывести информацию о приложении
    logAppInfo();

    console.log('✅ Application initialized successfully!');
    console.log('='.repeat(50));

    // 5. Показать приветственное сообщение
    showToast('success', `${APPCONFIG.APPNAME} v${APPCONFIG.VERSION} готов к работе!`);

  } catch (error) {
    logError('initApp', error);
    showToast('error', 'Ошибка инициализации приложения');
  }
}

/**
 * Инициализировать все модули приложения
 * @returns {void}
 */
function initAllModules() {
  console.log('📦 Initializing modules...');

  // TODO: Раскомментировать когда создадим модули
  // initAccordion();
  // initClearButtons();
  // initHistory();
  // initExport();
  // initModals();

  console.log('✅ All modules initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Настроить все event listeners
 * @returns {void}
 */
function setupEventListeners() {
  console.log('🎯 Setting up event listeners...');

  // 1. Connection Mode Listeners
  setupConnectionModeListeners();

  // 2. Optimization Checkboxes (Type 1-6)
  setupOptimizationCheckboxes();

  // 3. Main Buttons
  setupMainButtons();

  // 4. Header Buttons
  setupHeaderButtons();

  console.log('✅ Event listeners set up');
}

/**
 * Настроить listeners для Connection Mode
 * @returns {void}
 */
function setupConnectionModeListeners() {
  const modeRadios = document.querySelectorAll('input[name="connectionMode"]');
  const commonDistanceSelect = document.getElementById('commonDistance');

  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.currentConnectionMode = e.target.value;

      // Enable/disable dropdown для Common Distance
      if (commonDistanceSelect) {
        commonDistanceSelect.disabled = e.target.value !== 'common';
      }

      console.log(`Connection mode changed: ${e.target.value}`);
    });
  });

  if (commonDistanceSelect) {
    commonDistanceSelect.addEventListener('change', (e) => {
      state.commonDistance = e.target.value;
      console.log(`Common distance changed: ${e.target.value}`);
    });
  }
}

/**
 * Настроить checkboxes для Type 1-6 оптимизаций
 * @returns {void}
 */
function setupOptimizationCheckboxes() {
  // Type 1-5
  const types = [1, 2, 4, 5];
  types.forEach(type => {
    const checkbox = document.getElementById(`type${type}Checkbox`);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        state.optimizationTypes[`type${type}`] = e.target.checked;
        console.log(`Type ${type}: ${e.target.checked ? 'ON' : 'OFF'}`);
      });
    }
  });

  // Type 6 (специальный)
  setupType6Listeners();
}

/**
 * Настроить listeners для Type 6
 * @returns {void}
 */
function setupType6Listeners() {
  const type6Checkbox = document.getElementById('type6Checkbox');
  const type6Modes = document.getElementById('type6Modes');
  const wildcardOptions = document.getElementById('wildcardOptions');

  // Toggle Type 6 modes
  if (type6Checkbox && type6Modes) {
    type6Checkbox.addEventListener('change', (e) => {
      state.optimizationTypes.type6 = e.target.checked;
      type6Modes.style.display = e.target.checked ? 'block' : 'none';
      console.log(`Type 6: ${e.target.checked ? 'ON' : 'OFF'}`);
    });
  }

  // Type 6 Mode (Wildcard / Exact)
  const type6ModeRadios = document.querySelectorAll('input[name="type6Mode"]');
  type6ModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.type6Mode = e.target.value;

      if (wildcardOptions) {
        wildcardOptions.style.display = e.target.value === 'wildcard' ? 'block' : 'none';
      }

      console.log(`Type 6 mode: ${e.target.value}`);
    });
  });

  // Wildcard options checkboxes
  const wildcardCheckboxes = ['wildcardCyrillic', 'wildcardLatin', 'wildcardDigits', 'wildcardAny'];
  wildcardCheckboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        const key = id.replace('wildcard', '').toLowerCase();
        state.type6WildcardOptions[key] = e.target.checked;
        console.log(`Type 6 wildcard ${key}: ${e.target.checked ? 'ON' : 'OFF'}`);
      });
    }
  });
}

/**
 * Настроить главные кнопки (Convert, Copy, Export, Clear)
 * @returns {void}
 */
function setupMainButtons() {
  const btnConvert = document.getElementById('btnConvert');
  const btnCopy = document.getElementById('btnCopy');
  const btnExport = document.getElementById('btnExport');
  const btnClearResult = document.getElementById('btnClearResult');
  const btnClearSimple = document.getElementById('btnClearSimple');
  const btnClearHistory = document.getElementById('btnClearHistory');

  if (btnConvert) {
    btnConvert.addEventListener('click', handleConvert);
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', handleCopyRegex);
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      // TODO: openModal('exportModal');
      showToast('info', 'Export пока не реализован');
    });
  }

  if (btnClearResult) {
    btnClearResult.addEventListener('click', handleClearResult);
  }

  if (btnClearSimple) {
    btnClearSimple.addEventListener('click', () => {
      // TODO: showConfirm с модальным окном
      handleClearSimpleTriggers();
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      showToast('info', 'Clear History пока не реализован');
    });
  }
}

/**
 * Настроить кнопки в header (Regulations, Wiki, Reset All)
 * @returns {void}
 */
function setupHeaderButtons() {
  const btnRegulations = document.getElementById('btnRegulations');
  const btnWiki = document.getElementById('btnWiki');
  const btnResetAll = document.getElementById('btnResetAll');

  if (btnRegulations) {
    btnRegulations.addEventListener('click', () => {
      // TODO: openModal('regulationsModal');
      showToast('info', 'Regulations пока не реализован');
    });
  }

  if (btnWiki) {
    btnWiki.addEventListener('click', () => {
      // TODO: openModal('wikiModal');
      showToast('info', 'Wiki пока не реализован');
    });
  }

  if (btnResetAll) {
    btnResetAll.addEventListener('click', handleResetAll);
  }
}

// ========================================
// HANDLERS
// ========================================

/**
 * Обработчик кнопки Convert
 * @returns {void}
 */
function handleConvert() {
  try {
    clearAllInlineErrors();

    // Получить Simple Triggers
    const textarea = document.getElementById('simpleTriggersInput');
    if (!textarea) {
      showToast('error', 'Textarea не найдена');
      return;
    }

    const text = textarea.value.trim();
    if (!text) {
      showToast('warning', 'Добавьте триггеры');
      return;
    }

    // Простой split по переносам строк
    const triggers = text.split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (triggers.length === 0) {
      showToast('warning', 'Нет валидных триггеров');
      return;
    }

    // Создать regex (пока без оптимизаций)
    const regex = triggers.map(t => escapeRegex(t)).join('|');

    // Вывести результат
    renderRegexResult(regex);

    showToast('success', `Regex создан! (${regex.length} символов)`);

  } catch (error) {
    logError('handleConvert', error);
    showToast('error', 'Ошибка при конвертации');
  }
}

/**
 * Вывести regex в textarea результата
 * @param {string} regex - Regex
 * @returns {void}
 */
function renderRegexResult(regex) {
  const textarea = document.getElementById('regexOutput');
  if (!textarea) return;

  textarea.value = regex;
}

/**
 * Обработчик кнопки Copy
 * @returns {Promise<void>}
 */
async function handleCopyRegex() {
  const textarea = document.getElementById('regexOutput');
  if (!textarea) return;

  const regex = textarea.value.trim();
  if (!regex) {
    showToast('warning', 'Нет regex для копирования');
    return;
  }

  try {
    const success = await copyToClipboard(regex);

    if (success) {
      showToast('success', 'Regex скопирован в буфер обмена!');

      // Анимация кнопки
      const btnCopy = document.getElementById('btnCopy');
      if (btnCopy) {
        const originalHTML = btnCopy.innerHTML;
        btnCopy.innerHTML = '<span class="btn-icon-inline">✓</span> Скопировано!';
        btnCopy.disabled = true;

        setTimeout(() => {
          btnCopy.innerHTML = originalHTML;
          btnCopy.disabled = false;
        }, 2000);
      }
    } else {
      showToast('error', 'Не удалось скопировать');
    }
  } catch (error) {
    logError('handleCopyRegex', error);
    showToast('error', 'Ошибка при копировании');
  }
}

/**
 * Обработчик кнопки Clear Result
 * @returns {void}
 */
function handleClearResult() {
  const textarea = document.getElementById('regexOutput');
  if (!textarea) return;

  if (textarea.value.trim()) {
    textarea.value = '';
    showToast('success', 'Результат очищен');
  }
}

/**
 * Обработчик кнопки Clear Simple Triggers
 * @returns {void}
 */
function handleClearSimpleTriggers() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return;

  if (textarea.value.trim()) {
    textarea.value = '';
    showToast('success', 'Триггеры очищены');
  }
}

/**
 * Обработчик кнопки Reset All
 * @returns {void}
 */
function handleResetAll() {
  // Очистить Simple Triggers
  const simpleInput = document.getElementById('simpleTriggersInput');
  if (simpleInput) {
    simpleInput.value = '';
  }

  // Очистить Result
  const resultOutput = document.getElementById('regexOutput');
  if (resultOutput) {
    resultOutput.value = '';
  }

  // TODO: Очистить Linked Triggers

  showToast('success', 'Всё сброшено');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Вывести информацию о приложении
 * @returns {void}
 */
function logAppInfo() {
  console.log(`
📋 App Info:
   Name: ${APPCONFIG.APPNAME}
   Version: ${APPCONFIG.VERSION}
   Max Regex Length: ${APPCONFIG.MAXREGEXLENGTH}
   Debounce Delay: ${APPCONFIG.DEBOUNCEDELAY}ms
  `);
}

// ========================================
// AUTO-INIT ON DOM LOADED
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM уже загружен
  initApp();
}

// Экспорты для тестов
export { initApp, handleConvert, state };
