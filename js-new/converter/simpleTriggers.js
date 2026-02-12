/**
 * RegexHelper v4.0 - Simple Triggers Converter
 * 
 * Модуль для обработки и конвертации простых триггеров в regex.
 * Поддерживает оптимизации Type 1-6 и автозамену ё → [её].
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { parseSimpleTriggers, getTriggerStats, replaceYo } from '../core/parser.js';
import { validateTriggers } from '../core/validator.js';
import { showToast, clearInlineError, showInlineError } from '../core/errors.js';
import { applyOptimizations } from './optimizer.js';
import { escapeRegex, pluralize } from '../core/utils.js';
import { SIMPLETRIGGERSCONFIG } from '../core/config.js';

/**
 * Конвертирует простые триггеры в regex
 * @param {string} text - Текст с триггерами (textarea)
 * @param {number[]} optimizationTypes - Массив типов оптимизаций (1-6)
 * @returns {string} - Итоговый regex
 * @example
 * convertSimpleTriggersToRegex('привет\nмир', []) // 'привет|мир'
 * convertSimpleTriggersToRegex('dog\ndogged', [1]) // 'dog(ged)?'
 */
export function convertSimpleTriggersToRegex(text, optimizationTypes = []) {
  if (!text || typeof text !== 'string') return '';

  // Парсим триггеры (с автозаменой ё → [её])
  const triggers = parseSimpleTriggers(text);

  if (triggers.length === 0) return '';

  // Валидация
  if (!validateTriggers(triggers)) {
    return '';
  }

  // Применяем оптимизации
  if (optimizationTypes.length > 0) {
    return applyOptimizations(triggers, optimizationTypes);
  }

  // Без оптимизаций - просто экранируем и объединяем
  return triggers.map(t => escapeRegex(t)).join('|');
}

/**
 * Инициализирует обработчики для простых триггеров
 * @returns {void}
 * @example
 * initSimpleTriggers(); // вызывается в main.js
 */
export function initSimpleTriggers() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) {
    console.warn('initSimpleTriggers: textarea #simpleTriggersInput not found');
    return;
  }

  // Обновление счетчика при вводе (с debounce)
  let debounceTimer;
  textarea.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateSimpleTriggerCount();
    }, 300);
  });

  // Начальное обновление счетчика
  updateSimpleTriggerCount();

  console.log('[SimpleTriggers] Initialized');
}

/**
 * Обрабатывает событие input в textarea простых триггеров
 * @returns {void}
 * @example
 * handleSimpleTriggersInput();
 */
export function handleSimpleTriggersInput() {
  updateSimpleTriggerCount();
}

/**
 * Обновляет счетчик триггеров и показывает статистику
 * @returns {void}
 * @example
 * updateSimpleTriggerCount();
 */
export function updateSimpleTriggerCount() {
  const textarea = document.getElementById('simpleTriggersInput');
  const counter = document.getElementById('simpleTriggerCount');
  
  if (!textarea || !counter) return;

  const stats = getTriggerStats(textarea.value);
  
  // Обновляем текст счетчика
  counter.textContent = `${stats.uniqueCount} ${pluralize(stats.uniqueCount, ['триггер', 'триггера', 'триггеров'])}`;

  // Добавляем классы для визуального отображения
  if (stats.hasLimit) {
    counter.classList.add('counter-error');
    counter.classList.remove('counter-warning');
    counter.title = `Превышен лимит в ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS} триггеров`;
  } else if (stats.nearLimit) {
    counter.classList.add('counter-warning');
    counter.classList.remove('counter-error');
    counter.title = `Близко к лимиту (${SIMPLETRIGGERSCONFIG.MAXTRIGGERS} триггеров)`;
  } else {
    counter.classList.remove('counter-error', 'counter-warning');
    counter.title = '';
  }

  // Показываем информацию о дубликатах
  const duplicateNote = document.getElementById('duplicateNote');
  if (duplicateNote) {
    if (stats.duplicatesCount > 0) {
      duplicateNote.textContent = `${stats.duplicatesCount} ${pluralize(stats.duplicatesCount, ['дубликат', 'дубликата', 'дубликатов'])}`;
      duplicateNote.style.display = 'inline';
    } else {
      duplicateNote.style.display = 'none';
    }
  }
}

/**
 * Возвращает массив простых триггеров из textarea
 * @returns {string[]} - Массив триггеров
 * @example
 * const triggers = getSimpleTriggers(); // ['привет', 'мир']
 */
export function getSimpleTriggers() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return [];

  const text = textarea.value.trim();
  if (!text) return [];

  return parseSimpleTriggers(text);
}

/**
 * Очищает textarea с простыми триггерами
 * @returns {void}
 * @example
 * clearSimpleTriggers();
 */
export function clearSimpleTriggers() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return;

  textarea.value = '';
  updateSimpleTriggerCount();
  clearInlineError('simpleTriggersInput');
}

/**
 * Валидирует ввод в textarea простых триггеров
 * @returns {boolean} - true, если валидация прошла успешно
 * @example
 * if (validateSimpleTriggersInput()) {
 *   // convert
 * }
 */
export function validateSimpleTriggersInput() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return false;

  const text = textarea.value.trim();
  
  // Проверка на пустоту
  if (!text) {
    showInlineError('simpleTriggersInput', 'Добавьте хотя бы один триггер');
    return false;
  }

  // Парсим триггеры
  const triggers = parseSimpleTriggers(text);

  // Валидация массива триггеров
  if (!validateTriggers(triggers, 'simpleTriggersInput')) {
    return false;
  }

  // Все ок - убираем ошибку
  clearInlineError('simpleTriggersInput');
  return true;
}

/**
 * Устанавливает триггеры в textarea (для загрузки из истории)
 * @param {string[]} triggers - Массив триггеров
 * @returns {void}
 * @example
 * setSimpleTriggers(['привет', 'мир']);
 */
export function setSimpleTriggers(triggers) {
  if (!Array.isArray(triggers)) return;

  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return;

  textarea.value = triggers.join('\n');
  updateSimpleTriggerCount();
}

/**
 * Добавляет триггеры к существующим
 * @param {string[]} newTriggers - Массив новых триггеров
 * @returns {void}
 * @example
 * appendSimpleTriggers(['новый', 'триггер']);
 */
export function appendSimpleTriggers(newTriggers) {
  if (!Array.isArray(newTriggers) || newTriggers.length === 0) return;

  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return;

  const currentText = textarea.value.trim();
  const newText = newTriggers.join('\n');

  if (currentText) {
    textarea.value = currentText + '\n' + newText;
  } else {
    textarea.value = newText;
  }

  updateSimpleTriggerCount();
}

/**
 * Возвращает статистику по простым триггерам
 * @returns {Object} - Объект со статистикой
 * @example
 * const stats = getSimpleTriggersStats();
 * // { count: 5, uniqueCount: 4, duplicatesCount: 1 }
 */
export function getSimpleTriggersStats() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) {
    return { count: 0, uniqueCount: 0, duplicatesCount: 0, hasLimit: false, nearLimit: false };
  }

  return getTriggerStats(textarea.value);
}

/**
 * Проверяет, есть ли триггеры в textarea
 * @returns {boolean} - true, если есть хотя бы один триггер
 * @example
 * if (hasSimpleTriggers()) {
 *   // convert
 * }
 */
export function hasSimpleTriggers() {
  const triggers = getSimpleTriggers();
  return triggers.length > 0;
}

/**
 * Применяет автозамену ё → [её] к содержимому textarea
 * @returns {void}
 * @example
 * applyYoReplacement(); // ёлка → [её]лка
 */
export function applyYoReplacement() {
  const textarea = document.getElementById('simpleTriggersInput');
  if (!textarea) return;

  const originalText = textarea.value;
  const replacedText = replaceYo(originalText);

  if (originalText !== replacedText) {
    textarea.value = replacedText;
    updateSimpleTriggerCount();
    showToast('info', 'Применена автозамена: ё → [её]');
  }
}

/**
 * Экспортирует простые триггеры в массив строк
 * @returns {string[]} - Массив триггеров
 * @example
 * const exported = exportSimpleTriggers();
 */
export function exportSimpleTriggers() {
  return getSimpleTriggers();
}

/**
 * Импортирует простые триггеры из массива строк
 * @param {string[]} triggers - Массив триггеров
 * @param {boolean} [append=false] - Добавить к существующим (true) или заменить (false)
 * @returns {void}
 * @example
 * importSimpleTriggers(['привет', 'мир'], false);
 */
export function importSimpleTriggers(triggers, append = false) {
  if (!Array.isArray(triggers)) return;

  if (append) {
    appendSimpleTriggers(triggers);
  } else {
    setSimpleTriggers(triggers);
  }

  showToast('success', `Импортировано ${triggers.length} ${pluralize(triggers.length, ['триггер', 'триггера', 'триггеров'])}`);
}

/**
 * Сортирует триггеры в textarea (по алфавиту)
 * @param {boolean} [ascending=true] - По возрастанию (true) или убыванию (false)
 * @returns {void}
 * @example
 * sortSimpleTriggers(true); // A-Z
 * sortSimpleTriggers(false); // Z-A
 */
export function sortSimpleTriggers(ascending = true) {
  const triggers = getSimpleTriggers();
  if (triggers.length === 0) return;

  const sorted = [...triggers].sort((a, b) => {
    const compareResult = a.localeCompare(b, 'ru');
    return ascending ? compareResult : -compareResult;
  });

  setSimpleTriggers(sorted);
  showToast('success', 'Триггеры отсортированы');
}

/**
 * Удаляет дубликаты из textarea
 * @returns {void}
 * @example
 * removeDuplicatesFromTextarea();
 */
export function removeDuplicatesFromTextarea() {
  const triggers = getSimpleTriggers();
  if (triggers.length === 0) return;

  const stats = getSimpleTriggersStats();
  
  if (stats.duplicatesCount === 0) {
    showToast('info', 'Дубликатов не найдено');
    return;
  }

  setSimpleTriggers(triggers); // parseSimpleTriggers уже удаляет дубликаты
  showToast('success', `Удалено ${stats.duplicatesCount} ${pluralize(stats.duplicatesCount, ['дубликат', 'дубликата', 'дубликатов'])}`);
}
