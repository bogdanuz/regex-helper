/**
 * RegexHelper v4.0 - Error Handling & Toast Notifications
 * Обработка ошибок, toast-уведомления, inline-ошибки.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { TOASTCONFIG, APPCONFIG } from './config.js';

/**
 * Показать toast-уведомление
 * @param {string} type - Тип: success, error, warning, info
 * @param {string} message - Сообщение
 * @param {number} [duration] - Длительность, если не указано - берется из TOASTCONFIG
 * @returns {void}
 * 
 * @example
 * showToast('success', 'Regex успешно скопирован!');
 * showToast('error', 'Ошибка валидации', 5000);
 */
export function showToast(type, message, duration) {
  if (!message || typeof message !== 'string') {
    console.warn('[showToast] message is required');
    return;
  }

  const config = TOASTCONFIG[type.toUpperCase()] || TOASTCONFIG.INFO;
  const finalDuration = duration || config.duration || APPCONFIG.TOASTDURATION;

  // Создать toast-контейнер, если не существует
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Создать toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = config.icon;

  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Закрыть');
  closeBtn.onclick = () => removeToast(toast);

  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, finalDuration);

  // Сохранить ID таймаута
  toast.dataset.timeoutId = timeoutId;
}

/**
 * Удалить toast
 * @param {HTMLElement} toast - toast элемент
 * @returns {void}
 * @private
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;

  if (toast.dataset.timeoutId) {
    clearTimeout(Number(toast.dataset.timeoutId));
  }

  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');

  // Удалить из DOM после анимации
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }

    // Удалить контейнер если пустой
    const container = document.getElementById('toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

/**
 * Логирование ошибки
 * @param {string} context - Контекст ошибки
 * @param {Error|string} error - Ошибка
 * @returns {void}
 * 
 * @example
 * try {
 *   // code
 * } catch (error) {
 *   logError('parseSimpleTriggers', error);
 * }
 */
export function logError(context, error) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;

  console.error(`[${timestamp}] [${APPCONFIG.APPNAME}] [${context}]`, errorMessage);
  if (stackTrace) {
    console.error('Stack trace:', stackTrace);
  }
}

/**
 * Показать inline-ошибку под полем
 * @param {string} fieldId - ID поля
 * @param {string} message - Сообщение
 * @returns {void}
 * 
 * @example
 * showInlineError('simpleTriggers', 'Триггер слишком длинный');
 */
export function showInlineError(fieldId, message) {
  if (!fieldId || !message) return;

  const field = document.getElementById(fieldId);
  if (!field) {
    console.warn(`[showInlineError] field with id "${fieldId}" not found`);
    return;
  }

  // Удалить старую ошибку, если есть
  clearInlineError(fieldId);

  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

  const errorElement = document.createElement('div');
  errorElement.className = 'inline-error';
  errorElement.id = `${fieldId}-error`;
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  errorElement.setAttribute('aria-live', 'polite');

  field.parentNode.insertBefore(errorElement, field.nextSibling);
  field.focus();
}

/**
 * Удалить inline-ошибку
 * @param {string} fieldId - ID поля
 * @returns {void}
 * 
 * @example
 * clearInlineError('simpleTriggers');
 */
export function clearInlineError(fieldId) {
  if (!fieldId) return;

  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  }

  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Удалить все inline-ошибки
 * @returns {void}
 * 
 * @example
 * clearAllInlineErrors();
 */
export function clearAllInlineErrors() {
  // Удалить класс error
  const errorFields = document.querySelectorAll('.error');
  errorFields.forEach(field => {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  });

  // Удалить все inline-ошибки
  const errorElements = document.querySelectorAll('.inline-error');
  errorElements.forEach(element => element.remove());
}

/**
 * Инициализировать обработчик ошибок
 * @returns {void}
 * 
 * @example
 * initErrorHandling(); // в main.js
 */
export function initErrorHandling() {
  // Глобальный обработчик ошибок
  window.addEventListener('error', (event) => {
    logError('Global Error Handler', event.error || event.message);
    
    // Показать toast для SyntaxError
    if (event.error && event.error.name !== 'SyntaxError') {
      showToast('error', 'Произошла ошибка. Проверьте консоль.');
    }
  });

  // Обработка необработанных Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled Promise Rejection', event.reason);
    showToast('error', 'Произошла ошибка.');
    event.preventDefault();
  });

  console.log(`[${APPCONFIG.APPNAME}] Error handling initialized`);
}

/**
 * Показать confirm-диалог через toast
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} [onCancel] - Callback при отмене
 * @returns {void}
 * 
 * @example
 * confirmAction('Удалить все триггеры?', () => clearTriggers());
 */
export function confirmAction(message, onConfirm, onCancel) {
  if (!message || typeof onConfirm !== 'function') {
    console.warn('[confirmAction] message and onConfirm are required');
    return;
  }

  // Создать confirm overlay
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'confirm-message');

  const confirmBox = document.createElement('div');
  confirmBox.className = 'confirm-box';

  const messageEl = document.createElement('p');
  messageEl.id = 'confirm-message';
  messageEl.className = 'confirm-message';
  messageEl.textContent = message;

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'confirm-buttons';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn-primary';
  confirmBtn.textContent = 'Подтвердить';
  confirmBtn.onclick = () => {
    overlay.remove();
    onConfirm();
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-secondary';
  cancelBtn.textContent = 'Отмена';
  cancelBtn.onclick = () => {
    overlay.remove();
    if (onCancel) onCancel();
  };

  buttonsContainer.appendChild(confirmBtn);
  buttonsContainer.appendChild(cancelBtn);

  confirmBox.appendChild(messageEl);
  confirmBox.appendChild(buttonsContainer);

  overlay.appendChild(confirmBox);
  document.body.appendChild(overlay);

  confirmBtn.focus();

  // Обработка Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Клик вне overlay
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  };
}
