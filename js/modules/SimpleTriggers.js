/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - SimpleTriggers.js
 * Обработка textarea простых триггеров (макс 1000)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class SimpleTriggers
 * @description Управляет простыми триггерами из textarea
 */
export class SimpleTriggers {
    constructor() {
        this.triggers = [];
        this.MAX_TRIGGERS = 1000;

        // DOM элементы
        this.textarea = document.querySelector('.simple-triggers-textarea');
        this.counter = document.querySelector('.trigger-counter');

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        if (!this.textarea) {
            console.warn('SimpleTriggers: textarea не найден');
            return;
        }

        // Обработчик ввода
        this.textarea.addEventListener('input', () => this.handleInput());

        // Обработчик вставки (paste)
        this.textarea.addEventListener('paste', (e) => this.handlePaste(e));

        // Начальное обновление
        this.updateTriggers();
    }

    /**
     * Обработчик ввода
     */
    handleInput() {
        this.updateTriggers();
        this.updateCounter();
    }

    /**
     * Обработчик вставки текста
     * @param {ClipboardEvent} e - Событие вставки
     */
    handlePaste(e) {
        // Даём браузеру вставить текст, затем обрабатываем
        setTimeout(() => {
            this.updateTriggers();
            this.updateCounter();
        }, 10);
    }

    /**
     * Обновить триггеры из textarea
     */
    updateTriggers() {
        const text = this.textarea.value;

        // Парсинг: разделить по переносу строки, trim, фильтровать пустые
        this.triggers = this.parseText(text);

        // Проверить лимит
        if (this.triggers.length > this.MAX_TRIGGERS) {
            this.showWarning(`Максимум ${this.MAX_TRIGGERS} триггеров. Лишние будут проигнорированы.`);
            this.triggers = this.triggers.slice(0, this.MAX_TRIGGERS);
        }
    }

    /**
     * Парсинг текста из textarea
     * @param {string} text - Текст из textarea
     * @returns {Array<string>} Массив триггеров
     */
    parseText(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        // Разделить по переносу строки
        const lines = text.split('\n');

        // Обработать каждую строку
        const triggers = lines
            .map(line => line.trim())           // Убрать пробелы
            .filter(line => line.length > 0);   // Убрать пустые строки

        return triggers;
    }

    /**
     * Получить все триггеры
     * @returns {Array<string>} Массив триггеров
     */
    getTriggers() {
        return this.triggers;
    }

    /**
     * Установить триггеры (программно)
     * @param {Array<string>} triggers - Массив триггеров
     */
    setTriggers(triggers) {
        if (!Array.isArray(triggers)) {
            console.error('SimpleTriggers: triggers должен быть массивом');
            return;
        }

        this.triggers = triggers.slice(0, this.MAX_TRIGGERS);

        // Обновить textarea
        if (this.textarea) {
            this.textarea.value = this.triggers.join('\n');
        }

        this.updateCounter();
    }

    /**
     * Очистить textarea
     */
    clear() {
        this.triggers = [];

        if (this.textarea) {
            this.textarea.value = '';
        }

        this.updateCounter();
    }

    /**
     * Обновить счётчик триггеров
     */
    updateCounter() {
        if (!this.counter) return;

        const count = this.triggers.length;
        const max = this.MAX_TRIGGERS;

        this.counter.textContent = `${count} / ${max}`;

        // Изменить цвет при приближении к лимиту
        if (count >= max) {
            this.counter.style.color = '#FF4444'; // Красный
        } else if (count >= max * 0.9) {
            this.counter.style.color = '#FFD700'; // Жёлтый
        } else {
            this.counter.style.color = '#A0AEC0'; // Серый
        }
    }

    /**
     * Показать предупреждение
     * @param {string} message - Сообщение
     */
    showWarning(message) {
        // TODO: Интеграция с системой уведомлений (ЧАТ 5)
        console.warn(`SimpleTriggers: ${message}`);
    }

    /**
     * Валидация триггеров
     * @returns {Object} {valid: boolean, errors: Array<string>}
     */
    validate() {
        const errors = [];

        if (this.triggers.length === 0) {
            errors.push('Добавьте хотя бы один триггер');
        }

        if (this.triggers.length > this.MAX_TRIGGERS) {
            errors.push(`Максимум ${this.MAX_TRIGGERS} триггеров`);
        }

        // Проверить, есть ли дубликаты
        const uniqueTriggers = new Set(this.triggers);
        if (uniqueTriggers.size < this.triggers.length) {
            errors.push(`Найдены дубликаты триггеров (${this.triggers.length - uniqueTriggers.size} шт.)`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Получить количество триггеров
     * @returns {number}
     */
    getCount() {
        return this.triggers.length;
    }

    /**
     * Получить уникальные триггеры (без дубликатов)
     * @returns {Array<string>}
     */
    getUniqueTriggers() {
        return [...new Set(this.triggers)];
    }

    /**
     * Экспортировать триггеры в строку
     * @returns {string} Строка с триггерами через \n
     */
    exportToString() {
        return this.triggers.join('\n');
    }

    /**
     * Импортировать триггеры из строки
     * @param {string} text - Строка с триггерами
     */
    importFromString(text) {
        const triggers = this.parseText(text);
        this.setTriggers(triggers);
    }
}
