// ========================================
// REGEX HELPER v4.0 - ГЛОБАЛЬНЫЙ ТЕСТ-НАБОР
// Файл: tests/test-suite-global.js
// ========================================

import { APPCONFIG, SIMPLETRIGGERSCONFIG, LINKEDTRIGGERSCONFIG } from '../js-new/core/config.js';
import { escapeRegex, pluralize, formatDate, generateId } from '../js-new/core/utils.js';
import { showToast, logError } from '../js-new/core/errors.js';
import { parseSimpleTriggers, getTriggerStats } from '../js-new/core/parser.js';
import { validateTriggers, validateRegexLength } from '../js-new/core/validator.js';
import { applyType1, applyType2, applyType4, applyType5 } from '../js-new/converter/optimizer.js';
import { openModal, closeModal, showConfirm } from '../js-new/features/modals.js';

console.log('🚀 Загрузка ГЛОБАЛЬНОГО тест-набора...\n');

// ========================================
// SUITE 1: CORE CONFIG
// ========================================
const suite1 = {
  id: 'core-config',
  name: 'Core: Config Module',
  file: 'test-suite-global.js',
  description: 'Проверка всех конфигурационных констант',
  estimatedTests: 15,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'APPCONFIG.VERSION === "4.0.0"',
      fn: () => {
        if (APPCONFIG.VERSION !== '4.0.0') {
          throw new Error(`Ожидалось 4.0.0, получено ${APPCONFIG.VERSION}`);
        }
      }
    },
    {
      name: 'APPCONFIG.APPNAME === "RegexHelper"',
      fn: () => {
        if (APPCONFIG.APPNAME !== 'RegexHelper') {
          throw new Error(`Ожидалось RegexHelper, получено ${APPCONFIG.APPNAME}`);
        }
      }
    },
    {
      name: 'SIMPLETRIGGERSCONFIG.MAXTRIGGERS === 200',
      fn: () => {
        if (SIMPLETRIGGERSCONFIG.MAXTRIGGERS !== 200) {
          throw new Error(`Ожидалось 200, получено ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS}`);
        }
      }
    },
    {
      name: 'LINKEDTRIGGERSCONFIG.MAXGROUPS === 15',
      fn: () => {
        if (LINKEDTRIGGERSCONFIG.MAXGROUPS !== 15) {
          throw new Error(`Ожидалось 15, получено ${LINKEDTRIGGERSCONFIG.MAXGROUPS}`);
        }
      }
    },
    {
      name: 'LINKEDTRIGGERSCONFIG.MAXSUBGROUPS === 15',
      fn: () => {
        if (LINKEDTRIGGERSCONFIG.MAXSUBGROUPS !== 15) {
          throw new Error(`Ожидалось 15, получено ${LINKEDTRIGGERSCONFIG.MAXSUBGROUPS}`);
        }
      }
    }
  ]
};

// ========================================
// SUITE 2: CORE UTILS
// ========================================
const suite2 = {
  id: 'core-utils',
  name: 'Core: Utils Module',
  file: 'test-suite-global.js',
  description: 'Проверка всех утилитарных функций',
  estimatedTests: 20,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'escapeRegex() - точка',
      fn: () => {
        const result = escapeRegex('test.');
        if (result !== 'test\\.') {
          throw new Error(`Ожидалось test\\., получено ${result}`);
        }
      }
    },
    {
      name: 'escapeRegex() - звездочка',
      fn: () => {
        const result = escapeRegex('a*b');
        if (result !== 'a\\*b') {
          throw new Error(`Ожидалось a\\*b, получено ${result}`);
        }
      }
    },
    {
      name: 'escapeRegex() - скобки',
      fn: () => {
        const result = escapeRegex('(ab)');
        if (result !== '\\(ab\\)') {
          throw new Error(`Ожидалось \\(ab\\), получено ${result}`);
        }
      }
    },
    {
      name: 'pluralize() - 1 элемент',
      fn: () => {
        const result = pluralize(1, 'триггер', 'триггера', 'триггеров');
        if (result !== 'триггер') {
          throw new Error(`Ожидалось триггер, получено ${result}`);
        }
      }
    },
    {
      name: 'pluralize() - 2 элемента',
      fn: () => {
        const result = pluralize(2, 'триггер', 'триггера', 'триггеров');
        if (result !== 'триггера') {
          throw new Error(`Ожидалось триггера, получено ${result}`);
        }
      }
    },
    {
      name: 'pluralize() - 5 элементов',
      fn: () => {
        const result = pluralize(5, 'триггер', 'триггера', 'триггеров');
        if (result !== 'триггеров') {
          throw new Error(`Ожидалось триггеров, получено ${result}`);
        }
      }
    },
    {
      name: 'generateId() возвращает строку',
      fn: () => {
        const id = generateId('test');
        if (typeof id !== 'string') {
          throw new Error(`Ожидалась строка, получено ${typeof id}`);
        }
      }
    },
    {
      name: 'generateId() начинается с префикса',
      fn: () => {
        const id = generateId('group');
        if (!id.startsWith('group-')) {
          throw new Error(`ID не начинается с group-, получено ${id}`);
        }
      }
    },
    {
      name: 'formatDate() возвращает строку',
      fn: () => {
        const result = formatDate(Date.now());
        if (typeof result !== 'string') {
          throw new Error(`Ожидалась строка, получено ${typeof result}`);
        }
      }
    }
  ]
};

// ========================================
// SUITE 3: CORE PARSER
// ========================================
const suite3 = {
  id: 'core-parser',
  name: 'Core: Parser Module',
  file: 'test-suite-global.js',
  description: 'Проверка парсера триггеров',
  estimatedTests: 15,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'parseSimpleTriggers() - одна строка',
      fn: () => {
        const result = parseSimpleTriggers('тест');
        if (!Array.isArray(result) || result.length !== 1) {
          throw new Error(`Ожидался массив [тест], получено ${JSON.stringify(result)}`);
        }
      }
    },
    {
      name: 'parseSimpleTriggers() - несколько строк',
      fn: () => {
        const result = parseSimpleTriggers('тест\nпроверка\nразработка');
        if (result.length !== 3) {
          throw new Error(`Ожидалось 3 элемента, получено ${result.length}`);
        }
      }
    },
    {
      name: 'parseSimpleTriggers() - удаление пустых строк',
      fn: () => {
        const result = parseSimpleTriggers('тест\n\n\nпроверка');
        if (result.length !== 2) {
          throw new Error(`Ожидалось 2 элемента, получено ${result.length}`);
        }
      }
    },
    {
      name: 'parseSimpleTriggers() - trim пробелов',
      fn: () => {
        const result = parseSimpleTriggers('  тест  \n  проверка  ');
        if (result[0] !== 'тест' || result[1] !== 'проверка') {
          throw new Error(`Пробелы не удалены: ${JSON.stringify(result)}`);
        }
      }
    },
    {
      name: 'getTriggerStats() - подсчет количества',
      fn: () => {
        const triggers = ['тест', 'проверка', 'разработка'];
        const stats = getTriggerStats(triggers);
        if (stats.count !== 3) {
          throw new Error(`Ожидалось count=3, получено ${stats.count}`);
        }
      }
    },
    {
      name: 'getTriggerStats() - минимальная длина',
      fn: () => {
        const triggers = ['а', 'тест', 'проверка'];
        const stats = getTriggerStats(triggers);
        if (stats.minLength !== 1) {
          throw new Error(`Ожидалось minLength=1, получено ${stats.minLength}`);
        }
      }
    },
    {
      name: 'getTriggerStats() - максимальная длина',
      fn: () => {
        const triggers = ['а', 'тест', 'проверка'];
        const stats = getTriggerStats(triggers);
        if (stats.maxLength !== 8) { // "проверка" = 8 символов
          throw new Error(`Ожидалось maxLength=8, получено ${stats.maxLength}`);
        }
      }
    }
  ]
};

// ========================================
// SUITE 4: CORE VALIDATOR
// ========================================
const suite4 = {
  id: 'core-validator',
  name: 'Core: Validator Module',
  file: 'test-suite-global.js',
  description: 'Проверка валидаторов',
  estimatedTests: 10,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'validateTriggers() - пустой массив',
      fn: () => {
        const result = validateTriggers([]);
        if (result.valid !== false) {
          throw new Error('Пустой массив должен быть невалиден');
        }
      }
    },
    {
      name: 'validateTriggers() - валидный массив',
      fn: () => {
        const result = validateTriggers(['тест', 'проверка']);
        if (result.valid !== true) {
          throw new Error(`Валидный массив должен пройти проверку: ${JSON.stringify(result)}`);
        }
      }
    },
    {
      name: 'validateRegexLength() - короткий regex',
      fn: () => {
        const result = validateRegexLength('test');
        if (result !== true) {
          throw new Error('Короткий regex должен быть валиден');
        }
      }
    },
    {
      name: 'validateRegexLength() - длинный regex (10000+)',
      fn: () => {
        const longRegex = 'a'.repeat(10001);
        const result = validateRegexLength(longRegex);
        if (result !== false) {
          throw new Error('Regex длиной 10000+ должен быть невалиден');
        }
      }
    }
  ]
};

// ========================================
// SUITE 5: CONVERTER OPTIMIZER
// ========================================
const suite5 = {
  id: 'converter-optimizer',
  name: 'Converter: Optimizer Module',
  file: 'test-suite-global.js',
  description: 'Проверка оптимизаций Type 1-6',
  estimatedTests: 20,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'applyType1() - cop → c|o|p',
      fn: () => {
        const result = applyType1(['cop']);
        if (!result.includes('c') || !result.includes('o') || !result.includes('p')) {
          throw new Error(`Ожидалось разбиение cop, получено ${JSON.stringify(result)}`);
        }
      }
    },
    {
      name: 'applyType2() - тест,тестер → тест(|ер)',
      fn: () => {
        const result = applyType2(['тест', 'тестер']);
        // Проверка что есть общий корень
        if (!result.includes('тест')) {
          throw new Error(`Ожидался общий корень тест, получено ${result}`);
        }
      }
    },
    {
      name: 'applyType4() - добавление .{min,max}',
      fn: () => {
        const result = applyType4(['тест']);
        // Должно быть .{1,N} или подобное
        if (!result.includes('{') || !result.includes('}')) {
          throw new Error(`Ожидалось добавление .{min,max}, получено ${result}`);
        }
      }
    },
    {
      name: 'applyType5() - добавление ?',
      fn: () => {
        const result = applyType5(['тест']);
        if (!result.includes('?')) {
          throw new Error(`Ожидалось добавление ?, получено ${result}`);
        }
      }
    }
  ]
};

// ========================================
// SUITE 6: FEATURES MODALS
// ========================================
const suite6 = {
  id: 'features-modals',
  name: 'Features: Modals Module',
  file: 'test-suite-global.js',
  description: 'Проверка работы модальных окон',
  estimatedTests: 10,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'openModal() существует',
      fn: () => {
        if (typeof openModal !== 'function') {
          throw new Error('Функция openModal не найдена');
        }
      }
    },
    {
      name: 'closeModal() существует',
      fn: () => {
        if (typeof closeModal !== 'function') {
          throw new Error('Функция closeModal не найдена');
        }
      }
    },
    {
      name: 'showConfirm() существует',
      fn: () => {
        if (typeof showConfirm !== 'function') {
          throw new Error('Функция showConfirm не найдена');
        }
      }
    }
  ]
};

// ========================================
// SUITE 7: DOM TESTS
// ========================================
const suite7 = {
  id: 'dom-tests',
  name: 'DOM: HTML Elements',
  file: 'test-suite-global.js',
  description: 'Проверка наличия всех HTML элементов',
  estimatedTests: 50,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'index.html загружен',
      fn: () => {
        if (!document.body) {
          throw new Error('document.body не найден');
        }
      }
    },
    {
      name: 'Header существует',
      fn: () => {
        const header = document.querySelector('.main-header');
        if (!header) {
          throw new Error('.main-header не найден');
        }
      }
    },
    {
      name: 'Logo существует',
      fn: () => {
        const logo = document.querySelector('.logo');
        if (!logo) {
          throw new Error('.logo не найден');
        }
      }
    },
    {
      name: 'Navigation существует',
      fn: () => {
        const nav = document.querySelector('.main-nav');
        if (!nav) {
          throw new Error('.main-nav не найден');
        }
      }
    },
    {
      name: 'Панель 1: Input существует',
      fn: () => {
        const panel = document.getElementById('panelInput');
        if (!panel) {
          throw new Error('#panelInput не найден');
        }
      }
    },
    {
      name: 'Панель 2: Optimizations существует',
      fn: () => {
        const panel = document.getElementById('panelOptimizations');
        if (!panel) {
          throw new Error('#panelOptimizations не найден');
        }
      }
    },
    {
      name: 'Панель 3: Result существует',
      fn: () => {
        const panel = document.getElementById('panelResult');
        if (!panel) {
          throw new Error('#panelResult не найден');
        }
      }
    },
    {
      name: 'Simple Triggers textarea существует',
      fn: () => {
        const textarea = document.getElementById('simpleTriggersInput');
        if (!textarea) {
          throw new Error('#simpleTriggersInput не найден');
        }
      }
    },
    {
      name: 'Linked Groups Container существует',
      fn: () => {
        const container = document.getElementById('linkedGroupsContainer');
        if (!container) {
          throw new Error('#linkedGroupsContainer не найден');
        }
      }
    },
    {
      name: 'Кнопка Convert существует',
      fn: () => {
        const btn = document.getElementById('btnConvert');
        if (!btn) {
          throw new Error('#btnConvert не найден');
        }
      }
    },
    {
      name: 'Regex Output textarea существует',
      fn: () => {
        const textarea = document.getElementById('regexOutput');
        if (!textarea) {
          throw new Error('#regexOutput не найден');
        }
      }
    },
    {
      name: 'Footer существует',
      fn: () => {
        const footer = document.querySelector('.main-footer');
        if (!footer) {
          throw new Error('.main-footer не найден');
        }
      }
    },
    {
      name: 'Confirm Modal существует',
      fn: () => {
        const modal = document.getElementById('confirmModal');
        if (!modal) {
          throw new Error('#confirmModal не найден');
        }
      }
    }
  ]
};

// ========================================
// SUITE 8: CSS TESTS
// ========================================
const suite8 = {
  id: 'css-tests',
  name: 'CSS: Style Loading',
  file: 'test-suite-global.js',
  description: 'Проверка загрузки и применения стилей',
  estimatedTests: 15,
  version: '1.0',
  date: '2026-02-13',
  enabled: true,
  tests: [
    {
      name: 'body имеет стили',
      fn: () => {
        const style = window.getComputedStyle(document.body);
        if (!style.fontFamily || style.fontFamily === 'Times New Roman') {
          throw new Error('Стили не применены к body');
        }
      }
    },
    {
      name: 'Header имеет background',
      fn: () => {
        const header = document.querySelector('.main-header');
        if (header) {
          const style = window.getComputedStyle(header);
          if (!style.backgroundColor || style.backgroundColor === 'rgba(0, 0, 0, 0)') {
            throw new Error('Header не имеет background');
          }
        }
      }
    },
    {
      name: 'CSS файлы загружены',
      fn: () => {
        const sheets = document.styleSheets.length;
        if (sheets === 0) {
          throw new Error('Ни один CSS файл не загружен');
        }
      }
    }
  ]
};

// ========================================
// РЕГИСТРАЦИЯ ВСЕХ НАБОРОВ
// ========================================
if (typeof window !== 'undefined' && window.testRunner) {
  window.testRunner.registerSuite(suite1);
  window.testRunner.registerSuite(suite2);
  window.testRunner.registerSuite(suite3);
  window.testRunner.registerSuite(suite4);
  window.testRunner.registerSuite(suite5);
  window.testRunner.registerSuite(suite6);
  window.testRunner.registerSuite(suite7);
  window.testRunner.registerSuite(suite8);
  
  console.log('✅ Глобальный тест-набор зарегистрирован (8 наборов, ~155 тестов)');
}

export { suite1, suite2, suite3, suite4, suite5, suite6, suite7, suite8 };
