/**
 * RegexHelper v4.0 - Features Simple Triggers
 * Обработка простых триггеров
 * @version 1.0
 * @date 12.02.2026
 */

import { parseSimpleTriggers, getTriggerStats, replaceYo } from '../converter/parser.js';
import { validateTriggers } from '../converter/validator.js';
import { pluralize, debounce } from '../core/utils.js';
import { showToast, clearInlineError, showInlineError } from '../core/errors.js';

/**
 * Инициализирует обработку простых триггеров
 * @example
 * initSimpleTriggers();
 */
export function initSimpleTriggers() {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) {
        console.warn('initSimpleTriggers: textarea #simpleTriggers не найден');
        return;
    }

    const debouncedUpdate = debounce(() => {
        updateSimpleTriggerCount();
    }, 300);

    textarea.addEventListener('input', debouncedUpdate);
    
    updateSimpleTriggerCount();
}

/**
 * Обработчик ввода триггеров
 * @example
 * handleSimpleTriggersInput();
 */
export function handleSimpleTriggersInput() {
    updateSimpleTriggerCount();
}

/**
 * Обновляет счётчик триггеров
 * @example
 * updateSimpleTriggerCount();
 */
export function updateSimpleTriggerCount() {
    const textarea = document.getElementById('simpleTriggers');
    const counter = document.getElementById('simpleTriggerCount');

    if (!textarea || !counter) {
        return;
    }

    const stats = getTriggerStats(textarea.value);

    counter.textContent = `${stats.count} ${pluralize(stats.count, ['триггер', 'триггера', 'триггеров'])}`;

    if (stats.hasLimit) {
        counter.classList.add('counter-error');
        counter.classList.remove('counter-warning');
        counter.title = 'Превышен лимит в 200 триггеров';
    } else if (stats.nearLimit) {
        counter.classList.add('counter-warning');
        counter.classList.remove('counter-error');
        counter.title = 'Приближаетесь к лимиту в 200 триггеров';
    } else {
        counter.classList.remove('counter-error', 'counter-warning');
        counter.title = '';
    }

    if (stats.duplicatesCount > 0) {
        const duplicateNote = document.getElementById('duplicateNote');
        if (duplicateNote) {
            duplicateNote.textContent = `${stats.duplicatesCount} ${pluralize(stats.duplicatesCount, ['дубликат', 'дубликата', 'дубликатов'])}`;
            duplicateNote.style.display = 'inline';
        }
    } else {
        const duplicateNote = document.getElementById('duplicateNote');
        if (duplicateNote) {
            duplicateNote.style.display = 'none';
        }
    }
}

/**
 * Получает массив простых триггеров из textarea
 * @returns {Array<string>} - Массив триггеров
 * @example
 * const triggers = getSimpleTriggers(); // => ['яблоко', 'груша']
 */
export function getSimpleTriggers() {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) {
        return [];
    }

    const text = textarea.value.trim();
    
    if (!text) {
        return [];
    }

    return parseSimpleTriggers(text);
}

/**
 * Очищает textarea простых триггеров
 * @example
 * clearSimpleTriggers();
 */
export function clearSimpleTriggers() {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) {
        return;
    }

    textarea.value = '';
    updateSimpleTriggerCount();
    clearInlineError('simpleTriggers');
}

/**
 * Валидирует ввод простых триггеров
 * @returns {boolean} - true если валидация пройдена
 * @example
 * if (validateSimpleTriggersInput()) { ... }
 */
export function validateSimpleTriggersInput() {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) {
        return false;
    }

    const text = textarea.value.trim();

    if (!text) {
        showInlineError('simpleTriggers', 'Введите хотя бы один триггер');
        return false;
    }

    const triggers = parseSimpleTriggers(text);

    if (!validateTriggers(triggers)) {
        return false;
    }

    clearInlineError('simpleTriggers');
    return true;
}

/**
 * Парсит и очищает триггеры (удаляет дубликаты, применяет replaceYo)
 * @param {string} text - Текст с триггерами
 * @returns {Array<string>} - Очищенный массив триггеров
 * @example
 * const triggers = parseAndCleanTriggers('яблоко\nгруша\nяблоко'); // => ['яблоко', 'груша']
 */
export function parseAndCleanTriggers(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    return parseSimpleTriggers(text);
}

/**
 * Отрисовывает превью триггеров (опционально)
 * @example
 * renderSimpleTriggersPreview();
 */
export function renderSimpleTriggersPreview() {
    const triggers = getSimpleTriggers();
    const previewEl = document.getElementById('simpleTriggersPreview');

    if (!previewEl) {
        return;
    }

    if (triggers.length === 0) {
        previewEl.innerHTML = '<p class="text-muted">Триггеры отсутствуют</p>';
        return;
    }

    const preview = triggers.slice(0, 10).map(t => `<span class="trigger-tag">${t}</span>`).join(' ');
    const more = triggers.length > 10 ? `<span class="text-muted">... и ещё ${triggers.length - 10}</span>` : '';

    previewEl.innerHTML = preview + more;
}
