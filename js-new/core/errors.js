/**
 * RegexHelper v4.0 - Error Handling & Toast Notifications
 * 
 * Модуль для обработки ошибок, показа toast-уведомлений и inline-ошибок в полях ввода.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { TOASTCONFIG, APPCONFIG } from './config.js';

/**
 * Показывает toast-уведомление
 * @param {string} type - Тип уведомления: 'success', 'error', 'warning', 'info'
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа (мс), если не указана - берется из TOASTCONFIG
 * @returns {void}
 * @example
 * showToast('success', 'Regex скопирован!');
 * showToast('error', 'Превышен лимит триггеров', 5000);
 */
export function showToast(type, message, duration) {
  if (!message || typeof message !== 'string') {
    console.warn('showToast: message is required');
    return;
  }

  // Получаем конфигурацию для типа уведомления
  const config = TOASTCONFIG[type.toUpperCase()] || TOASTCONFIG.INFO;
  const finalDuration = duration || config.duration || APPCONFIG.TOASTDURATION;

  // Создаем контейнер для toast, если его еще нет
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Создаем элемент toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  // Иконка + сообщение
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = config.icon;

  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;

  // Кнопка закрытия
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Закрыть уведомление');
  closeBtn.onclick = () => removeToast(toast);

  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);

  // Добавляем в контейнер
  toastContainer.appendChild(toast);

  // Анимация появления
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  // Автоматическое удаление
  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, finalDuration);

  // Сохраняем ID таймера для возможной отмены
  toast.dataset.timeoutId = timeoutId;
}

/**
 * Удаляет toast с анимацией
 * @param {HTMLElement} toast - Элемент toast
 * @returns {void}
 * @private
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;

  // Отменяем таймер автоудаления
  if (toast.dataset.timeoutId) {
    clearTimeout(Number(toast.dataset.timeoutId));
  }

  // Анимация скрытия
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');

  // Удаление из DOM после анимации
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }

    // Удаляем контейнер, если он пустой
    const container = document.getElementById('toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

/**
 * Логирует ошибку в консоль с контекстом
 * @param {string} context - Контекст ошибки (название функции/модуля)
 * @param {Error|string} error - Ошибка или сообщение об ошибке
 * @returns {void}
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
  const stackTrace = error instanceof Error ? error.stack : '';

  console.error(`[${timestamp}] [${APPCONFIG.APPNAME}] [${context}]`, errorMessage);
  
  if (stackTrace) {
    console.error('Stack trace:', stackTrace);
  }
}

/**
 * Показывает inline-ошибку под полем ввода
 * @param {string} fieldId - ID поля ввода
 * @param {string} message - Текст ошибки
 * @returns {void}
 * @example
 * showInlineError('simpleTriggers', 'Добавьте хотя бы один триггер');
 */
export function showInlineError(fieldId, message) {
  if (!fieldId || !message) return;

  const field = document.getElementById(fieldId);
  if (!field) {
    console.warn(`showInlineError: field with id "${fieldId}" not found`);
    return;
  }

  // Удаляем предыдущую ошибку, если есть
  clearInlineError(fieldId);

  // Добавляем класс ошибки к полю
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

  // Создаем элемент ошибки
  const errorElement = document.createElement('div');
  errorElement.className = 'inline-error';
  errorElement.id = `${fieldId}-error`;
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  errorElement.setAttribute('aria-live', 'polite');

  // Вставляем после поля
  field.parentNode.insertBefore(errorElement, field.nextSibling);

  // Фокус на поле с ошибкой
  field.focus();
}

/**
 * Убирает inline-ошибку с поля ввода
 * @param {string} fieldId - ID поля ввода
 * @returns {void}
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
 * Убирает все inline-ошибки на странице
 * @returns {void}
 * @example
 * clearAllInlineErrors();
 */
export function clearAllInlineErrors() {
  // Убираем класс error со всех полей
  const errorFields = document.querySelectorAll('.error');
  errorFields.forEach((field) => {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
  });

  // Удаляем все элементы inline-ошибок
  const errorElements = document.querySelectorAll('.inline-error');
  errorElements.forEach((element) => {
    element.remove();
  });
}

/**
 * Инициализирует глобальный обработчик ошибок
 * @returns {void}
 * @example
 * initErrorHandling(); // вызывается в main.js
 */
export function initErrorHandling() {
  // Обработчик необработанных ошибок
  window.addEventListener('error', (event) => {
    logError('Global Error Handler', event.error || event.message);
    
    // Показываем toast только для критических ошибок
    if (event.error && event.error.name !== 'SyntaxError') {
      showToast('error', 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.');
    }
  });

  // Обработчик необработанных Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled Promise Rejection', event.reason);
    showToast('error', 'Произошла ошибка при выполнении операции.');
    event.preventDefault(); // Предотвращаем вывод в консоль
  });

  console.log(`[${APPCONFIG.APPNAME}] Error handling initialized`);
}

/**
 * Показывает confirm-диалог с кастомным стилем (через toast)
 * @param {string} message - Текст вопроса
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} [onCancel] - Callback при отмене
 * @returns {void}
 * @example
 * confirmAction('Очистить все триггеры?', () => clearTriggers());
 */
export function confirmAction(message, onConfirm, onCancel) {
  if (!message || typeof onConfirm !== 'function') {
    console.warn('confirmAction: message and onConfirm are required');
    return;
  }

  // Создаем контейнер для confirm
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
  confirmBtn.textContent = 'Да';
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

  // Фокус на кнопку "Да"
  confirmBtn.focus();

  // Закрытие по Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Закрытие по клику на overlay
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  };
}
