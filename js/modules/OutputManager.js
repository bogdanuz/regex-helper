/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - OutputManager.js
 * Управление textarea вывода, копирование результата
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class OutputManager
 * @description Управляет отображением результата конвертации
 */
export class OutputManager {
    constructor() {
        // DOM элементы
        this.outputTextarea = document.querySelector('.output-textarea');
        this.copyBtn = document.querySelector('.btn-copy');
        this.clearOutputBtn = document.querySelector('.btn-clear-output');
        this.charCounter = document.querySelector('.output-char-counter');

        this.currentResult = '';

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        if (!this.outputTextarea) {
            console.warn('OutputManager: output textarea не найден');
            return;
        }

        // Обработчик кнопки "Копировать"
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        // Обработчик кнопки "Очистить"
        if (this.clearOutputBtn) {
            this.clearOutputBtn.addEventListener('click', () => this.clear());
        }

        // Обновление счётчика при изменении
        this.outputTextarea.addEventListener('input', () => this.updateCharCounter());
    }

    /**
     * Обновить вывод результата
     * @param {string} result - Regex паттерн
     */
    updateOutput(result) {
        if (!this.outputTextarea) {
            console.error('OutputManager: output textarea не найден');
            return;
        }

        this.currentResult = result;
        this.outputTextarea.value = result;

        // Обновить счётчик символов
        this.updateCharCounter();

        // Подсветить textarea (анимация)
        this.highlightOutput();
    }

    /**
     * Копировать результат в буфер обмена
     */
    async copyToClipboard() {
        if (!this.currentResult || this.currentResult.trim().length === 0) {
            this.showNotification('Нечего копировать', 'warning');
            return;
        }

        try {
            // Современный API (Clipboard API)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(this.currentResult);
                this.showNotification('Скопировано!', 'success');
                this.animateCopyButton();
            } else {
                // Fallback для старых браузеров
                this.fallbackCopyToClipboard(this.currentResult);
            }
        } catch (error) {
            console.error('OutputManager: ошибка копирования:', error);
            this.showNotification('Ошибка копирования', 'error');
        }
    }

    /**
     * Fallback копирование (для старых браузеров)
     * @param {string} text - Текст для копирования
     */
    fallbackCopyToClipboard(text) {
        // Создать временный textarea
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);

        // Выделить и скопировать
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, text.length);

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showNotification('Скопировано!', 'success');
                this.animateCopyButton();
            } else {
                this.showNotification('Ошибка копирования', 'error');
            }
        } catch (error) {
            console.error('OutputManager: fallback copy error:', error);
            this.showNotification('Ошибка копирования', 'error');
        }

        // Удалить временный textarea
        document.body.removeChild(tempTextarea);
    }

    /**
     * Очистить вывод
     */
    clear() {
        this.currentResult = '';
        if (this.outputTextarea) {
            this.outputTextarea.value = '';
        }
        this.updateCharCounter();
    }

    /**
     * Получить текущий результат
     * @returns {string} Regex паттерн
     */
    getResult() {
        return this.currentResult;
    }

    /**
     * Обновить счётчик символов
     */
    updateCharCounter() {
        if (!this.charCounter) return;

        const length = this.currentResult.length;
        this.charCounter.textContent = `${length} символов`;

        // Изменить цвет при большой длине
        if (length > 1000) {
            this.charCounter.style.color = '#FF4444'; // Красный
        } else if (length > 500) {
            this.charCounter.style.color = '#FFD700'; // Жёлтый
        } else {
            this.charCounter.style.color = '#A0AEC0'; // Серый
        }
    }

    /**
     * Подсветить textarea (анимация)
     */
    highlightOutput() {
        if (!this.outputTextarea) return;

        // Добавить класс анимации
        this.outputTextarea.classList.add('highlight');

        // Удалить через 300ms
        setTimeout(() => {
            this.outputTextarea.classList.remove('highlight');
        }, 300);
    }

    /**
     * Анимировать кнопку "Копировать"
     */
    animateCopyButton() {
        if (!this.copyBtn) return;

        // Сохранить оригинальный текст
        const originalText = this.copyBtn.textContent;
        const originalIcon = this.copyBtn.querySelector('.icon');

        // Изменить текст/иконку
        this.copyBtn.textContent = '✓ Скопировано';
        this.copyBtn.classList.add('copied');

        // Вернуть через 2 секунды
        setTimeout(() => {
            this.copyBtn.textContent = originalText;
            if (originalIcon) {
                this.copyBtn.prepend(originalIcon);
            }
            this.copyBtn.classList.remove('copied');
        }, 2000);
    }

    /**
     * Показать уведомление (toast)
     * @param {string} message - Сообщение
     * @param {string} type - Тип (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // TODO: Интеграция с системой уведомлений (ЧАТ 5)
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Простое временное уведомление
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${this.getToastColor(type)};
            color: #FFFFFF;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // Удалить через 3 секунды
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Получить цвет toast по типу
     * @param {string} type - Тип уведомления
     * @returns {string} Цвет (hex)
     */
    getToastColor(type) {
        const colors = {
            success: '#00FF88',
            error: '#FF4444',
            warning: '#FFD700',
            info: '#00D4FF'
        };

        return colors[type] || colors.info;
    }

    /**
     * Валидация результата
     * @param {string} result - Regex паттерн
     * @returns {Object} {valid: boolean, error: string|null}
     */
    validateResult(result) {
        if (!result || typeof result !== 'string') {
            return {
                valid: false,
                error: 'Результат должен быть строкой'
            };
        }

        if (result.trim().length === 0) {
            return {
                valid: false,
                error: 'Результат не может быть пустым'
            };
        }

        // Проверить валидность regex
        try {
            new RegExp(result);
            return {
                valid: true,
                error: null
            };
        } catch (error) {
            return {
                valid: false,
                error: `Невалидный regex: ${error.message}`
            };
        }
    }

    /**
     * Экспортировать результат в файл
     * @param {string} format - Формат (txt, json, csv)
     */
    exportResult(format = 'txt') {
        if (!this.currentResult || this.currentResult.trim().length === 0) {
            this.showNotification('Нечего экспортировать', 'warning');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `regex_export_${timestamp}.${format}`;

        let content = this.currentResult;
        let mimeType = 'text/plain';

        if (format === 'json') {
            content = JSON.stringify({ regex: this.currentResult }, null, 2);
            mimeType = 'application/json';
        }

        // Создать Blob и скачать
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);

        this.showNotification(`Экспортировано: ${filename}`, 'success');
    }
}
