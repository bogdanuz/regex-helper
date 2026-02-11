/**
 * RegexHelper v4.0 - Error Handling
 * Обработка ошибок и toast-уведомлений
 * @version 1.0
 * @date 11.02.2026
 */

import { TOASTCONFIG, ERRORMESSAGES } from './config.js';

/**
 * Показывает toast-уведомление
 * @param {string} type - Тип уведомления: success, error, warning, info
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа в мс (по умолчанию из TOASTCONFIG)
 * @example
 * showToast('success', 'Regex скопирован!');
 * showToast('error', 'Ошибка валидации', 5000);
 */
export function showToast(type, message, duration) {
    let container = document.getElementById('toastContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 15000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#4CAF50', icon: '✓', emoji: '✅' },
        error: { bg: '#F44336', icon: '✕', emoji: '❌' },
        warning: { bg: '#FF9800', icon: '⚠', emoji: '⚠️' },
        info: { bg: '#24a7ef', icon: 'ℹ', emoji: 'ℹ️' }
    };

    const color = colors[type] || colors.info;
    const toastDuration = duration || TOASTCONFIG[type.toUpperCase()]?.duration || 3000;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${color.bg};
        color: white;
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        font-size: 14px;
        pointer-events: auto;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;

    toast.innerHTML = `
        <span style="font-size: 20px; font-weight: bold; flex-shrink: 0;">${color.emoji}</span>
        <span style="flex: 1; line-height: 1.4;">${escapeHTML(message)}</span>
        <span style="font-size: 18px; opacity: 0.7; flex-shrink: 0;">×</span>
    `;

    toast.onmouseenter = () => {
        toast.style.transform = 'translateX(-5px)';
        toast.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
    };

    toast.onmouseleave = () => {
        toast.style.transform = 'translateX(0)';
        toast.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    };

    toast.onclick = () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    };

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, toastDuration);
}

/**
 * Логирует ошибку в консоль
 * @param {string} context - Контекст ошибки (название функции/модуля)
 * @param {Error} error - Объект ошибки
 * @example
 * logError('parseSimpleTriggers', error);
 */
export function logError(context, error) {
    console.error(`❌ [${context}]`, error);
}

/**
 * Показывает inline-ошибку под полем ввода
 * @param {string} fieldId - ID поля ввода
 * @param {string} message - Текст ошибки
 * @example
 * showInlineError('simpleTriggers', 'Поле не может быть пустым');
 */
export function showInlineError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) {
        console.error('showInlineError: поле не найдено', fieldId);
        return;
    }

    clearInlineError(fieldId);

    field.classList.add('input-error', 'error');

    const errorEl = document.createElement('div');
    errorEl.className = 'inline-error error-message';
    errorEl.id = `${fieldId}-error`;
    errorEl.textContent = message;
    errorEl.style.cssText = `
        color: #F44336;
        font-size: 13px;
        margin-top: 6px;
        padding: 8px 12px;
        background: #FFEBEE;
        border-left: 3px solid #F44336;
        border-radius: 4px;
        animation: slideDown 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
    `;

    field.parentElement.insertBefore(errorEl, field.nextSibling);
}

/**
 * Убирает inline-ошибку у поля
 * @param {string} fieldId - ID поля ввода
 * @example
 * clearInlineError('simpleTriggers');
 */
export function clearInlineError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (field) {
        field.classList.remove('input-error', 'error');
    }

    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Убирает все inline-ошибки на странице
 * @example
 * clearAllInlineErrors();
 */
export function clearAllInlineErrors() {
    const errorEls = document.querySelectorAll('.inline-error');
    const errorFields = document.querySelectorAll('.input-error');

    errorEls.forEach(el => el.remove());
    errorFields.forEach(field => field.classList.remove('input-error', 'error'));
}

/**
 * Инициализирует глобальную обработку ошибок
 * @example
 * initErrorHandling();
 */
export function initErrorHandling() {
    window.addEventListener('error', (event) => {
        logError('Global', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        logError('Promise', event.reason);
    });
}

/**
 * Вспомогательная функция для экранирования HTML
 * @private
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
