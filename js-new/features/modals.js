/**
 * RegexHelper v4.0 - Modal Windows
 * 
 * Модуль для управления модальными окнами.
 * Поддерживает открытие/закрытие, confirm-диалоги, keyboard navigation,
 * backdrop, блокировку скролла body.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { setLocalStorage, getLocalStorage } from '../core/utils.js';

/**
 * Стек открытых модальных окон (для поддержки вложенных)
 */
let modalStack = [];

/**
 * Состояние "не спрашивать 5 минут" для confirm
 */
let skipConfirmUntil = {};

/**
 * Инициализирует модуль модальных окон
 * @returns {void}
 * @example
 * initModals(); // вызывается в main.js
 */
export function initModals() {
  // Находим все модальные окна
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modal => {
    // Обработчик кнопок закрытия
    const closeBtns = modal.querySelectorAll('.btn-close, [data-action="close"]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal.id));
    });
    
    // Закрытие по клику на backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Глобальный обработчик Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStack.length > 0) {
      const topModal = modalStack[modalStack.length - 1];
      closeModal(topModal);
    }
  });

  // Загружаем состояние "не спрашивать"
  loadSkipConfirmState();

  console.log('[Modals] Initialized');
}

/**
 * Открывает модальное окно
 * @param {string} modalId - ID модального окна
 * @returns {void}
 * @example
 * openModal('exportModal');
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.warn('openModal: modal not found', modalId);
    return;
  }

  // Добавляем в стек
  if (!modalStack.includes(modalId)) {
    modalStack.push(modalId);
  }

  // Показываем модальное окно
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');

  // Блокируем скролл body
  if (modalStack.length === 1) {
    document.body.classList.add('modal-open');
  }

  // Анимация появления
  requestAnimationFrame(() => {
    modal.classList.add('modal-show');
  });

  // Фокус на первый интерактивный элемент
  focusFirstElement(modal);

  // Trap focus внутри модального окна
  trapFocus(modal);
}

/**
 * Закрывает модальное окно
 * @param {string} modalId - ID модального окна
 * @returns {void}
 * @example
 * closeModal('exportModal');
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Удаляем из стека
  const index = modalStack.indexOf(modalId);
  if (index > -1) {
    modalStack.splice(index, 1);
  }

  // Анимация скрытия
  modal.classList.remove('modal-show');

  setTimeout(() => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // Разблокируем скролл body, если это последнее модальное окно
    if (modalStack.length === 0) {
      document.body.classList.remove('modal-open');
    }
  }, 300);
}

/**
 * Закрывает все модальные окна
 * @returns {void}
 * @example
 * closeAllModals();
 */
export function closeAllModals() {
  const modals = [...modalStack];
  modals.forEach(modalId => closeModal(modalId));
}

/**
 * Проверяет, открыто ли модальное окно
 * @param {string} modalId - ID модального окна
 * @returns {boolean} - true, если открыто
 * @example
 * if (isModalOpen('exportModal')) { ... }
 */
export function isModalOpen(modalId) {
  return modalStack.includes(modalId);
}

/**
 * Показывает confirm-диалог
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} [onCancel] - Callback при отмене
 * @returns {void}
 * @example
 * showConfirm('Удалить?', 'Вы уверены?', () => {
 *   console.log('Deleted');
 * });
 */
export function showConfirm(title, message, onConfirm, onCancel) {
  const modal = document.getElementById('confirmModal');
  if (!modal) {
    console.warn('showConfirm: confirmModal not found');
    return;
  }

  // Устанавливаем содержимое
  const titleEl = modal.querySelector('.modal-title, h3');
  const messageEl = modal.querySelector('#confirmMessage, p');

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;

  // Обработчики кнопок
  const yesBtn = modal.querySelector('#btnConfirmYes');
  const noBtn = modal.querySelector('#btnConfirmNo');

  if (yesBtn) {
    yesBtn.onclick = () => {
      closeModal('confirmModal');
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }

  if (noBtn) {
    noBtn.onclick = () => {
      closeModal('confirmModal');
      if (typeof onCancel === 'function') {
        onCancel();
      }
    };
  }

  openModal('confirmModal');
}

/**
 * Показывает confirm с опцией "Не спрашивать 5 минут"
 * @param {string} confirmId - ID confirm-диалога (для отслеживания состояния)
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} [onCancel] - Callback при отмене
 * @returns {void}
 * @example
 * showConfirmWithSkip('clearAll', 'Очистить всё?', 'Это действие нельзя отменить', () => {
 *   clearAll();
 * });
 */
export function showConfirmWithSkip(confirmId, title, message, onConfirm, onCancel) {
  // Проверяем, не нажата ли опция "не спрашивать"
  if (shouldSkipConfirm(confirmId)) {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    return;
  }

  const modal = document.getElementById('confirmModal');
  if (!modal) return;

  // Устанавливаем содержимое
  const titleEl = modal.querySelector('.modal-title, h3');
  const messageEl = modal.querySelector('#confirmMessage, p');

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;

  // Показываем кнопку "Не спрашивать 5 минут"
  const skipBtn = modal.querySelector('#btnConfirmSkip');
  if (skipBtn) {
    skipBtn.style.display = 'inline-block';
    skipBtn.onclick = () => {
      setSkipConfirm(confirmId, 5);
      closeModal('confirmModal');
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }

  // Обработчики кнопок
  const yesBtn = modal.querySelector('#btnConfirmYes');
  const noBtn = modal.querySelector('#btnConfirmNo');

  if (yesBtn) {
    yesBtn.onclick = () => {
      closeModal('confirmModal');
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }

  if (noBtn) {
    noBtn.onclick = () => {
      closeModal('confirmModal');
      if (typeof onCancel === 'function') {
        onCancel();
      }
    };
  }

  openModal('confirmModal');
}

/**
 * Устанавливает состояние "не спрашивать" на N минут
 * @param {string} confirmId - ID confirm-диалога
 * @param {number} minutes - Количество минут
 * @returns {void}
 * @private
 */
function setSkipConfirm(confirmId, minutes) {
  const expiresAt = Date.now() + (minutes * 60 * 1000);
  skipConfirmUntil[confirmId] = expiresAt;
  saveSkipConfirmState();
}

/**
 * Проверяет, нужно ли пропустить confirm
 * @param {string} confirmId - ID confirm-диалога
 * @returns {boolean} - true, если нужно пропустить
 * @private
 */
function shouldSkipConfirm(confirmId) {
  const expiresAt = skipConfirmUntil[confirmId];
  if (!expiresAt) return false;

  const now = Date.now();
  if (now < expiresAt) {
    return true;
  } else {
    // Истек срок - удаляем
    delete skipConfirmUntil[confirmId];
    saveSkipConfirmState();
    return false;
  }
}

/**
 * Сохраняет состояние "не спрашивать" в localStorage
 * @returns {void}
 * @private
 */
function saveSkipConfirmState() {
  setLocalStorage('regexhelper-skip-confirm', skipConfirmUntil);
}

/**
 * Загружает состояние "не спрашивать" из localStorage
 * @returns {void}
 * @private
 */
function loadSkipConfirmState() {
  const saved = getLocalStorage('regexhelper-skip-confirm', {});
  skipConfirmUntil = saved;

  // Очищаем истекшие
  const now = Date.now();
  Object.keys(skipConfirmUntil).forEach(key => {
    if (skipConfirmUntil[key] < now) {
      delete skipConfirmUntil[key];
    }
  });

  saveSkipConfirmState();
}

/**
 * Очищает все состояния "не спрашивать"
 * @returns {void}
 * @example
 * clearAllSkipConfirm();
 */
export function clearAllSkipConfirm() {
  skipConfirmUntil = {};
  saveSkipConfirmState();
}

/**
 * Устанавливает содержимое модального окна
 * @param {string} modalId - ID модального окна
 * @param {string} content - HTML-содержимое
 * @returns {void}
 * @example
 * setModalContent('wikiModal', '<h2>Wiki</h2><p>Content...</p>');
 */
export function setModalContent(modalId, content) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const body = modal.querySelector('.modal-body');
  if (body) {
    body.innerHTML = content;
  }
}

/**
 * Устанавливает заголовок модального окна
 * @param {string} modalId - ID модального окна
 * @param {string} title - Заголовок
 * @returns {void}
 * @example
 * setModalTitle('wikiModal', 'Wiki - Новый раздел');
 */
export function setModalTitle(modalId, title) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const titleEl = modal.querySelector('.modal-title, h3');
  if (titleEl) {
    titleEl.textContent = title;
  }
}

/**
 * Фокусирует первый интерактивный элемент в модальном окне
 * @param {HTMLElement} modal - DOM-элемент модального окна
 * @returns {void}
 * @private
 */
function focusFirstElement(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

/**
 * Ограничивает фокус внутри модального окна (trap focus)
 * @param {HTMLElement} modal - DOM-элемент модального окна
 * @returns {void}
 * @private
 */
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

/**
 * Возвращает количество открытых модальных окон
 * @returns {number} - Количество модальных окон
 * @example
 * const count = getOpenModalsCount();
 */
export function getOpenModalsCount() {
  return modalStack.length;
}

/**
 * Возвращает ID верхнего модального окна в стеке
 * @returns {string|null} - ID модального окна или null
 * @example
 * const topModal = getTopModal();
 */
export function getTopModal() {
  return modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
}

/**
 * Показывает alert (упрощенный confirm с одной кнопкой)
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} [onClose] - Callback при закрытии
 * @returns {void}
 * @example
 * showAlert('Готово!', 'Regex успешно скопирован');
 */
export function showAlert(title, message, onClose) {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;

  const titleEl = modal.querySelector('.modal-title, h3');
  const messageEl = modal.querySelector('#confirmMessage, p');

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;

  // Скрываем кнопку "Нет" и "Не спрашивать"
  const noBtn = modal.querySelector('#btnConfirmNo');
  const skipBtn = modal.querySelector('#btnConfirmSkip');

  if (noBtn) noBtn.style.display = 'none';
  if (skipBtn) skipBtn.style.display = 'none';

  // Меняем текст кнопки "Да" на "ОК"
  const yesBtn = modal.querySelector('#btnConfirmYes');
  if (yesBtn) {
    yesBtn.textContent = 'ОК';
    yesBtn.onclick = () => {
      closeModal('confirmModal');
      if (typeof onClose === 'function') {
        onClose();
      }
      // Восстанавливаем кнопки
      if (noBtn) noBtn.style.display = '';
      if (skipBtn) skipBtn.style.display = '';
      yesBtn.textContent = 'Да';
    };
  }

  openModal('confirmModal');
}

/**
 * Блокирует закрытие модального окна (для процессов)
 * @param {string} modalId - ID модального окна
 * @param {boolean} locked - true = заблокировать, false = разблокировать
 * @returns {void}
 * @example
 * lockModal('exportModal', true); // процесс экспорта
 * lockModal('exportModal', false); // завершено
 */
export function lockModal(modalId, locked) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (locked) {
    modal.classList.add('modal-locked');
    modal.dataset.locked = 'true';
  } else {
    modal.classList.remove('modal-locked');
    delete modal.dataset.locked;
  }
}

/**
 * Проверяет, заблокировано ли модальное окно
 * @param {string} modalId - ID модального окна
 * @returns {boolean} - true, если заблокировано
 * @example
 * if (isModalLocked('exportModal')) { ... }
 */
export function isModalLocked(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return false;
  return modal.dataset.locked === 'true';
}
