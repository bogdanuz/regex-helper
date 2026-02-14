/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - Notifications.js
 * Toast уведомления (success, error, warning, info)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class Notifications
 * @description Управляет toast уведомлениями
 */
export class Notifications {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 5; // Максимум одновременных toast

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        // Создать контейнер для toast
        this.createContainer();
    }

    /**
     * Создать контейнер для toast
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
    }

    // ═══════════════════════════════════════════════════════════════
    // ПОКАЗ TOAST
    // ═══════════════════════════════════════════════════════════════

    /**
     * Показать toast уведомление
     * @param {string} message - Сообщение
     * @param {string} type - Тип (success, error, warning, info)
     * @param {number} duration - Длительность отображения (мс), по умолчанию 3000
     * @param {string} position - Позиция (top-right, top-center, bottom-center)
     * 
     * @example
     * showToast('Скопировано!', 'success')
     * showToast('Ошибка валидации', 'error', 5000)
     */
    showToast(message, type = 'info', duration = 3000, position = 'bottom-right') {
        // Проверить лимит toast
        if (this.toasts.length >= this.maxToasts) {
            // Удалить самый старый toast
            this.removeToast(this.toasts[0]);
        }

        // Создать toast элемент
        const toast = this.createToastElement(message, type);

        // Добавить в контейнер
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Анимация появления
        setTimeout(() => toast.classList.add('show'), 10);

        // Автоудаление через duration
        setTimeout(() => this.removeToast(toast), duration);

        console.log(`Notifications: toast показан [${type}] "${message}"`);
    }

    /**
     * Создать toast элемент
     * @param {string} message - Сообщение
     * @param {string} type - Тип
     * @returns {HTMLElement} Toast элемент
     */
    createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Иконка
        const icon = this.getIcon(type);

        // Сообщение
        const messageEl = document.createElement('span');
        messageEl.className = 'toast-message';
        messageEl.textContent = message;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        // Собрать toast
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
        `;
        toast.appendChild(messageEl);
        toast.appendChild(closeBtn);

        return toast;
    }

    /**
     * Получить иконку по типу
     * @param {string} type - Тип toast
     * @returns {string} Иконка (emoji или символ)
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        return icons[type] || icons.info;
    }

    /**
     * Удалить toast
     * @param {HTMLElement} toast - Toast элемент
     */
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;

        // Анимация исчезновения
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            toast.remove();

            // Убрать из массива
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300); // Длительность анимации
    }

    // ═══════════════════════════════════════════════════════════════
    // СПЕЦИФИЧНЫЕ МЕТОДЫ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Показать success toast
     * @param {string} message - Сообщение
     * @param {number} duration - Длительность
     */
    success(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }

    /**
     * Показать error toast
     * @param {string} message - Сообщение
     * @param {number} duration - Длительность
     */
    error(message, duration = 5000) {
        this.showToast(message, 'error', duration);
    }

    /**
     * Показать warning toast
     * @param {string} message - Сообщение
     * @param {number} duration - Длительность
     */
    warning(message, duration = 5000) {
        this.showToast(message, 'warning', duration);
    }

    /**
     * Показать info toast
     * @param {string} message - Сообщение
     * @param {number} duration - Длительность
     */
    info(message, duration = 3000) {
        this.showToast(message, 'info', duration);
    }

    /**
     * Очистить все toast
     */
    clearAll() {
        this.toasts.forEach(toast => this.removeToast(toast));
        this.toasts = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР (SINGLETON)
// ═══════════════════════════════════════════════════════════════

let notificationsInstance = null;

/**
 * Получить глобальный экземпляр Notifications
 * @returns {Notifications}
 */
export function getNotifications() {
    if (!notificationsInstance) {
        notificationsInstance = new Notifications();
    }
    return notificationsInstance;
}

/**
 * Показать toast (глобальная функция)
 * @param {string} message - Сообщение
 * @param {string} type - Тип
 * @param {number} duration - Длительность
 */
export function showToast(message, type = 'info', duration = 3000) {
    const notifications = getNotifications();
    notifications.showToast(message, type, duration);
}
