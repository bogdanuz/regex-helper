/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - InlinePopup.js
 * Inline Popup для Optional Chars (Type 5) и Prefix (Type 6)
 * ═══════════════════════════════════════════════════════════════════
 */

import { applyOptionalChars, createPreview as createOptionalPreview } from '../params/OptionalChars.js';
import { applyPrefixWildcard, applyPrefixExact, createPrefixPreview } from '../params/Prefix.js';

/**
 * @class InlinePopup
 * @description Управляет inline popup для дополнительных параметров
 */
export class InlinePopup {
    constructor() {
        this.popup = null;
        this.currentTriggerId = null;
        this.currentParamType = null; // 'optional' или 'prefix'

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        // Слушать событие открытия popup (от DragDrop)
        document.addEventListener('openInlinePopup', (e) => {
            const { triggerId, paramType } = e.detail;
            this.showPopup(triggerId, paramType);
        });

        // Слушать двойной клик на триггере (альтернативный способ открытия)
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('trigger-input')) {
                const triggerId = e.target.dataset.triggerId;
                const rect = e.target.getBoundingClientRect();
                this.showPopupAtPosition(triggerId, 'optional', rect);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ПОКАЗ POPUP
    // ═══════════════════════════════════════════════════════════════

    /**
     * Показать popup
     * @param {string} triggerId - ID триггера
     * @param {string} paramType - Тип параметра ('optional' или 'prefix')
     */
    showPopup(triggerId, paramType) {
        this.currentTriggerId = triggerId;
        this.currentParamType = paramType;

        // Получить триггер
        const trigger = this.findTriggerById(triggerId);

        if (!trigger) {
            console.error(`InlinePopup: триггер "${triggerId}" не найден`);
            return;
        }

        // Создать или обновить popup
        if (paramType === 'optional') {
            this.renderOptionalPopup(trigger);
        } else if (paramType === 'prefix') {
            this.renderPrefixPopup(trigger);
        } else {
            console.error(`InlinePopup: неизвестный тип параметра "${paramType}"`);
        }
    }

    /**
     * Показать popup в определённой позиции
     * @param {string} triggerId - ID триггера
     * @param {string} paramType - Тип параметра
     * @param {DOMRect} rect - Позиция элемента
     */
    showPopupAtPosition(triggerId, paramType, rect) {
        this.showPopup(triggerId, paramType);

        if (this.popup) {
            this.popup.style.position = 'absolute';
            this.popup.style.top = `${rect.bottom + 8}px`;
            this.popup.style.left = `${rect.left}px`;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // OPTIONAL CHARS POPUP (TYPE 5)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Рендеринг popup для Optional Chars
     * @param {Object} trigger - Триггер
     */
    renderOptionalPopup(trigger) {
        const text = trigger.text;

        if (!text || text.length === 0) {
            console.warn('InlinePopup: текст триггера пустой');
            return;
        }

        // Создать popup контейнер
        this.popup = document.createElement('div');
        this.popup.className = 'inline-popup';
        this.popup.id = 'inline-popup-optional';

        // Header
        const header = document.createElement('div');
        header.className = 'popup-header';
        header.innerHTML = `
            <h3>Опциональные символы</h3>
            <button class="btn-close" title="Закрыть">×</button>
        `;
        header.querySelector('.btn-close').addEventListener('click', () => this.closePopup());

        // Body
        const body = document.createElement('div');
        body.className = 'popup-body';

        const hint = document.createElement('p');
        hint.textContent = 'Выберите символы, которые будут опциональными (символ?):';
        body.appendChild(hint);

        // Char selector (checkboxes для каждого символа)
        const charSelector = document.createElement('div');
        charSelector.className = 'char-selector';

        for (let i = 0; i < text.length; i++) {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${i}">
                <span>${text[i]}</span>
            `;
            charSelector.appendChild(label);
        }

        body.appendChild(charSelector);

        // Preview
        const preview = document.createElement('div');
        preview.className = 'popup-preview';
        preview.innerHTML = `
            <span class="preview-label">Preview:</span>
            <span class="preview-result">${text}</span>
        `;
        body.appendChild(preview);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'popup-footer';
        footer.innerHTML = `
            <button class="btn-secondary">Отмена</button>
            <button class="btn-primary">Применить</button>
        `;
        footer.querySelector('.btn-secondary').addEventListener('click', () => this.closePopup());
        footer.querySelector('.btn-primary').addEventListener('click', () => this.applyOptionalChars());

        // Собрать popup
        this.popup.appendChild(header);
        this.popup.appendChild(body);
        this.popup.appendChild(footer);

        // Добавить в DOM
        document.body.appendChild(this.popup);

        // Обновление preview при изменении checkboxes
        charSelector.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateOptionalPreview(text));
        });
    }

    /**
     * Обновить preview для optional chars
     * @param {string} text - Текст триггера
     */
    updateOptionalPreview(text) {
        const checkboxes = this.popup.querySelectorAll('input[type="checkbox"]:checked');
        const indices = Array.from(checkboxes).map(cb => parseInt(cb.value));

        const previewResult = this.popup.querySelector('.preview-result');

        if (indices.length === 0) {
            previewResult.textContent = text;
        } else {
            const preview = createOptionalPreview(text, indices);
            previewResult.textContent = preview;
        }
    }

    /**
     * Применить optional chars
     */
    applyOptionalChars() {
        const checkboxes = this.popup.querySelectorAll('input[type="checkbox"]:checked');
        const indices = Array.from(checkboxes).map(cb => parseInt(cb.value));

        if (indices.length === 0) {
            this.showNotification('Выберите хотя бы один символ', 'warning');
            return;
        }

        // Найти триггер и применить параметр
        const trigger = this.findTriggerById(this.currentTriggerId);

        if (trigger) {
            trigger.params.optionalChars = {
                enabled: true,
                indices: indices
            };

            console.log(`InlinePopup: optional chars применены к триггеру "${this.currentTriggerId}"`, indices);
            this.showNotification('Опциональные символы применены', 'success');
        }

        this.closePopup();
    }

    // ═══════════════════════════════════════════════════════════════
    // PREFIX POPUP (TYPE 6)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Рендеринг popup для Prefix
     * @param {Object} trigger - Триггер
     */
    renderPrefixPopup(trigger) {
        // Создать popup контейнер
        this.popup = document.createElement('div');
        this.popup.className = 'inline-popup';
        this.popup.id = 'inline-popup-prefix';

        // Header
        const header = document.createElement('div');
        header.className = 'popup-header';
        header.innerHTML = `
            <h3>Префикс</h3>
            <button class="btn-close" title="Закрыть">×</button>
        `;
        header.querySelector('.btn-close').addEventListener('click', () => this.closePopup());

        // Body
        const body = document.createElement('div');
        body.className = 'popup-body';

        const hint = document.createElement('p');
        hint.textContent = 'Выберите режим префикса:';
        body.appendChild(hint);

        // Radio buttons (Wildcard / Exact)
        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-group';
        radioGroup.innerHTML = `
            <label>
                <input type="radio" name="prefix-mode" value="wildcard" checked>
                Wildcard (префикс-.*)
            </label>
            <label>
                <input type="radio" name="prefix-mode" value="exact">
                Exact ((?:префикс1|префикс2|...))
            </label>
        `;
        body.appendChild(radioGroup);

        // Input для Wildcard
        const wildcardInput = document.createElement('div');
        wildcardInput.className = 'prefix-input wildcard-input';
        wildcardInput.innerHTML = `
            <label>Префикс:</label>
            <input type="text" placeholder="мега" class="prefix-wildcard">
        `;
        body.appendChild(wildcardInput);

        // Textarea для Exact
        const exactInput = document.createElement('div');
        exactInput.className = 'prefix-input exact-input';
        exactInput.style.display = 'none';
        exactInput.innerHTML = `
            <label>Префиксы (каждая строка — один префикс):</label>
            <textarea rows="4" placeholder="мега\nсупер\nультра" class="prefix-exact"></textarea>
        `;
        body.appendChild(exactInput);

        // Preview
        const preview = document.createElement('div');
        preview.className = 'popup-preview';
        preview.innerHTML = `
            <span class="preview-label">Preview:</span>
            <span class="preview-result">мега-.*триггер</span>
        `;
        body.appendChild(preview);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'popup-footer';
        footer.innerHTML = `
            <button class="btn-secondary">Отмена</button>
            <button class="btn-primary">Применить</button>
        `;
        footer.querySelector('.btn-secondary').addEventListener('click', () => this.closePopup());
        footer.querySelector('.btn-primary').addEventListener('click', () => this.applyPrefix());

        // Собрать popup
        this.popup.appendChild(header);
        this.popup.appendChild(body);
        this.popup.appendChild(footer);

        // Добавить в DOM
        document.body.appendChild(this.popup);

        // Переключение между Wildcard и Exact
        radioGroup.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => this.togglePrefixMode());
        });

        // Обновление preview
        wildcardInput.querySelector('input').addEventListener('input', () => this.updatePrefixPreview());
        exactInput.querySelector('textarea').addEventListener('input', () => this.updatePrefixPreview());
    }

    /**
     * Переключение между режимами Wildcard и Exact
     */
    togglePrefixMode() {
        const mode = this.popup.querySelector('input[name="prefix-mode"]:checked').value;

        const wildcardInput = this.popup.querySelector('.wildcard-input');
        const exactInput = this.popup.querySelector('.exact-input');

        if (mode === 'wildcard') {
            wildcardInput.style.display = 'block';
            exactInput.style.display = 'none';
        } else {
            wildcardInput.style.display = 'none';
            exactInput.style.display = 'block';
        }

        this.updatePrefixPreview();
    }

    /**
     * Обновить preview для prefix
     */
    updatePrefixPreview() {
        const mode = this.popup.querySelector('input[name="prefix-mode"]:checked').value;
        const previewResult = this.popup.querySelector('.preview-result');

        const sampleTrigger = 'триггер';

        if (mode === 'wildcard') {
            const prefix = this.popup.querySelector('.prefix-wildcard').value || 'префикс';
            const preview = createPrefixPreview(prefix, 'wildcard', '-', sampleTrigger);
            previewResult.textContent = preview;
        } else {
            const prefixesText = this.popup.querySelector('.prefix-exact').value || 'мега\nсупер';
            const prefixes = prefixesText.split('\n').filter(p => p.trim().length > 0);
            const preview = createPrefixPreview(prefixes, 'exact', '-', sampleTrigger);
            previewResult.textContent = preview;
        }
    }

    /**
     * Применить prefix
     */
    applyPrefix() {
        const mode = this.popup.querySelector('input[name="prefix-mode"]:checked').value;

        let prefixData;

        if (mode === 'wildcard') {
            const prefix = this.popup.querySelector('.prefix-wildcard').value.trim();

            if (!prefix) {
                this.showNotification('Введите префикс', 'warning');
                return;
            }

            prefixData = {
                mode: 'wildcard',
                value: prefix,
                separator: '-'
            };
        } else {
            const prefixesText = this.popup.querySelector('.prefix-exact').value.trim();

            if (!prefixesText) {
                this.showNotification('Введите хотя бы один префикс', 'warning');
                return;
            }

            const prefixes = prefixesText.split('\n').filter(p => p.trim().length > 0);

            if (prefixes.length === 0) {
                this.showNotification('Введите хотя бы один префикс', 'warning');
                return;
            }

            prefixData = {
                mode: 'exact',
                value: prefixes,
                separator: '-'
            };
        }

        // Найти триггер и применить параметр
        const trigger = this.findTriggerById(this.currentTriggerId);

        if (trigger) {
            trigger.params.prefix = prefixData;

            console.log(`InlinePopup: prefix применён к триггеру "${this.currentTriggerId}"`, prefixData);
            this.showNotification('Префикс применён', 'success');
        }

        this.closePopup();
    }

    // ═══════════════════════════════════════════════════════════════
    // УТИЛИТЫ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Закрыть popup
     */
    closePopup() {
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }

        this.currentTriggerId = null;
        this.currentParamType = null;
    }

    /**
     * Найти триггер по ID
     * @param {string} triggerId - ID триггера
     * @returns {Object|null} Триггер или null
     */
    findTriggerById(triggerId) {
        // TODO: Интеграция с LinkedTriggersManager или SimpleTriggers
        console.warn(`InlinePopup: findTriggerById не реализован. Требуется интеграция.`);
        return null;
    }

    /**
     * Показать уведомление
     * @param {string} message - Сообщение
     * @param {string} type - Тип (success, warning, error)
     */
    showNotification(message, type) {
        // TODO: Интеграция с Notifications модулем
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
