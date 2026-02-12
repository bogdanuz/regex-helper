/**
 * RegexHelper v4.0 - UI Notifications
 * 
 * Модуль для расширенных функций уведомлений (toast).
 * Дополняет core/errors.js функциями управления очередью,
 * позиционированием и специальными типами уведомлений.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { TOASTCONFIG } from '../core/config.js';
import { showToast } from '../core/errors.js';

/**
 * Очередь уведомлений (для показа по одному)
 */
let notificationQueue = [];
let isShowingNotification = false;

/**
 * Инициализирует модуль уведомлений
 * @returns {void}
 * @example
 * initNotifications(); // вызывается в main.js
 */
export function initNotifications() {
  // Создаем контейнер для уведомлений, если его нет
  ensureToastContainer();
  
  console.log('[Notifications] Initialized');
}

/**
 * Создает контейнер для toast, если его нет
 * @returns {void}
 * @private
 */
function ensureToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

/**
 * Показывает уведомление об успехе
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа (мс)
 * @returns {void}
 * @example
 * notifySuccess('Regex скопирован!');
 */
export function notifySuccess(message, duration) {
  showToast('success', message, duration);
}

/**
 * Показывает уведомление об ошибке
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа (мс)
 * @returns {void}
 * @example
 * notifyError('Превышен лимит триггеров');
 */
export function notifyError(message, duration) {
  showToast('error', message, duration);
}

/**
 * Показывает предупреждение
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа (мс)
 * @returns {void}
 * @example
 * notifyWarning('Близко к лимиту триггеров');
 */
export function notifyWarning(message, duration) {
  showToast('warning', message, duration);
}

/**
 * Показывает информационное уведомление
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа (мс)
 * @returns {void}
 * @example
 * notifyInfo('Применена автозамена: ё → [её]');
 */
export function notifyInfo(message, duration) {
  showToast('info', message, duration);
}

/**
 * Добавляет уведомление в очередь (показывается по одному)
 * @param {string} type - Тип уведомления
 * @param {string} message - Текст сообщения
 * @param {number} [duration] - Длительность показа (мс)
 * @returns {void}
 * @example
 * queueNotification('success', 'Первое уведомление');
 * queueNotification('info', 'Второе уведомление');
 */
export function queueNotification(type, message, duration) {
  notificationQueue.push({ type, message, duration });
  
  if (!isShowingNotification) {
    processNotificationQueue();
  }
}

/**
 * Обрабатывает очередь уведомлений
 * @returns {void}
 * @private
 */
function processNotificationQueue() {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }

  isShowingNotification = true;
  const notification = notificationQueue.shift();
  
  showToast(notification.type, notification.message, notification.duration);
  
  const config = TOASTCONFIG[notification.type.toUpperCase()] || TOASTCONFIG.INFO;
  const finalDuration = notification.duration || config.duration || 3000;
  
  // Показываем следующее уведомление через duration + 500ms
  setTimeout(() => {
    processNotificationQueue();
  }, finalDuration + 500);
}

/**
 * Очищает очередь уведомлений
 * @returns {void}
 * @example
 * clearNotificationQueue();
 */
export function clearNotificationQueue() {
  notificationQueue = [];
  isShowingNotification = false;
}

/**
 * Удаляет все активные уведомления с экрана
 * @returns {void}
 * @example
 * clearAllNotifications();
 */
export function clearAllNotifications() {
  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) {
    toastContainer.innerHTML = '';
  }
}

/**
 * Показывает уведомление с progress bar
 * @param {string} message - Текст сообщения
 * @param {number} duration - Длительность (мс)
 * @returns {Object} - Объект с методами update и close
 * @example
 * const progress = notifyProgress('Загрузка...', 5000);
 * setTimeout(() => progress.update('Почти готово...'), 2500);
 * setTimeout(() => progress.close(), 5000);
 */
export function notifyProgress(message, duration = 5000) {
  ensureToastContainer();
  
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast-progress';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  
  const icon = document.createElement('span');
  icon.className = 'toast-icon spinner';
  icon.innerHTML = '⏳';
  
  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;
  
  const progressBar = document.createElement('div');
  progressBar.className = 'toast-progress-bar';
  
  const progressFill = document.createElement('div');
  progressFill.className = 'toast-progress-fill';
  progressBar.appendChild(progressFill);
  
  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(progressBar);
  
  toastContainer.appendChild(toast);
  
  // Анимация появления
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
    progressFill.style.width = '100%';
    progressFill.style.transition = `width ${duration}ms linear`;
  });
  
  // Методы управления
  return {
    update: (newMessage) => {
      text.textContent = newMessage;
    },
    close: () => {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    },
    element: toast
  };
}

/**
 * Показывает уведомление с действием (кнопка)
 * @param {string} message - Текст сообщения
 * @param {string} actionText - Текст кнопки действия
 * @param {Function} onAction - Callback при клике на кнопку
 * @param {number} [duration] - Длительность показа (мс)
 * @returns {void}
 * @example
 * notifyWithAction('Файл удален', 'Отменить', () => {
 *   console.log('Undo delete');
 * });
 */
export function notifyWithAction(message, actionText, onAction, duration = 5000) {
  ensureToastContainer();
  
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast-action';
  
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = 'ℹ️';
  
  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;
  
  const actionBtn = document.createElement('button');
  actionBtn.className = 'toast-action-btn';
  actionBtn.textContent = actionText;
  actionBtn.onclick = () => {
    if (typeof onAction === 'function') {
      onAction();
    }
    removeToast(toast);
  };
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => removeToast(toast);
  
  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(actionBtn);
  toast.appendChild(closeBtn);
  
  toastContainer.appendChild(toast);
  
  // Анимация появления
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });
  
  // Автоматическое удаление
  setTimeout(() => removeToast(toast), duration);
}

/**
 * Удаляет toast с анимацией
 * @param {HTMLElement} toast - Элемент toast
 * @returns {void}
 * @private
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Показывает постоянное уведомление (не закрывается автоматически)
 * @param {string} type - Тип уведомления
 * @param {string} message - Текст сообщения
 * @returns {Object} - Объект с методом close
 * @example
 * const persistent = notifyPersistent('info', 'Идет обработка...');
 * setTimeout(() => persistent.close(), 10000);
 */
export function notifyPersistent(type, message) {
  ensureToastContainer();
  
  const toastContainer = document.getElementById('toast-container');
  const config = TOASTCONFIG[type.toUpperCase()] || TOASTCONFIG.INFO;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-persistent`;
  
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = config.icon;
  
  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => removeToast(toast);
  
  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);
  
  toastContainer.appendChild(toast);
  
  // Анимация появления
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });
  
  return {
    close: () => removeToast(toast),
    element: toast
  };
}

/**
 * Изменяет позицию контейнера уведомлений
 * @param {string} position - Позиция: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
 * @returns {void}
 * @example
 * setNotificationPosition('bottom-right');
 */
export function setNotificationPosition(position) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  // Убираем все классы позиций
  toastContainer.classList.remove(
    'toast-top-right',
    'toast-top-left',
    'toast-bottom-right',
    'toast-bottom-left',
    'toast-top-center',
    'toast-bottom-center'
  );
  
  // Добавляем новый класс
  toastContainer.classList.add(`toast-${position}`);
}

/**
 * Возвращает количество активных уведомлений
 * @returns {number} - Количество уведомлений
 * @example
 * const count = getActiveNotificationsCount();
 */
export function getActiveNotificationsCount() {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return 0;
  
  return toastContainer.querySelectorAll('.toast').length;
}

/**
 * Проверяет, есть ли активные уведомления
 * @returns {boolean} - true, если есть уведомления
 * @example
 * if (hasActiveNotifications()) { ... }
 */
export function hasActiveNotifications() {
  return getActiveNotificationsCount() > 0;
}

/**
 * Показывает группу уведомлений
 * @param {Array<Object>} notifications - Массив объектов уведомлений
 * @returns {void}
 * @example
 * notifyBatch([
 *   { type: 'success', message: 'Файл 1 загружен' },
 *   { type: 'success', message: 'Файл 2 загружен' }
 * ]);
 */
export function notifyBatch(notifications) {
  if (!Array.isArray(notifications)) return;
  
  notifications.forEach((notification, index) => {
    setTimeout(() => {
      showToast(notification.type, notification.message, notification.duration);
    }, index * 500);
  });
}
