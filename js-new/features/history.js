/**
 * RegexHelper v4.0 - History Manager
 * 
 * Модуль для управления историей regex.
 * Поддерживает сохранение, загрузку, фильтрацию, поиск, пагинацию,
 * избранное и экспорт истории.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { setLocalStorage, getLocalStorage, formatDate, truncateText, generateId } from '../core/utils.js';
import { HISTORYCONFIG } from '../core/config.js';
import { openModal, closeModal, showConfirmWithSkip } from './modals.js';
import { exportHistory } from './export.js';

/**
 * Состояние истории
 */
let historyState = {
  items: [],
  currentPage: 1,
  itemsPerPage: 20,
  filter: 'all', // 'all', 'favorites', 'recent'
  searchQuery: ''
};

/**
 * Инициализирует модуль истории
 * @returns {void}
 * @example
 * initHistory(); // вызывается в main.js
 */
export function initHistory() {
  // Загружаем историю из localStorage
  loadHistoryFromStorage();

  // Обработчик кнопки "История"
  const historyBtn = document.getElementById('btnHistory');
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      openModal('historyModal');
      renderHistory();
    });
  }

  // Обработчик поиска в истории
  const searchInput = document.getElementById('historySearch');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        historyState.searchQuery = e.target.value;
        historyState.currentPage = 1;
        renderHistory();
      }, 300);
    });
  }

  // Обработчики фильтров
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      historyState.filter = btn.dataset.filter;
      historyState.currentPage = 1;
      updateFilterButtons();
      renderHistory();
    });
  });

  // Обработчик кнопки "Очистить историю"
  const clearHistoryBtn = document.getElementById('btnClearHistory');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', handleClearHistory);
  }

  // Обработчик кнопки "Экспорт истории"
  const exportHistoryBtn = document.getElementById('btnExportHistory');
  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', () => {
      exportHistory(historyState.items, 'json');
    });
  }

  console.log('[History] Initialized');
}

/**
 * Добавляет запись в историю
 * @param {string} regex - Regex
 * @param {Object} [metadata] - Дополнительные данные
 * @returns {void}
 * @example
 * addToHistory('test|hello', { source: 'simple', triggerCount: 2 });
 */
export function addToHistory(regex, metadata = {}) {
  if (!regex || typeof regex !== 'string') return;

  // Проверяем, не дубликат ли (последняя запись)
  if (historyState.items.length > 0) {
    const lastItem = historyState.items[0];
    if (lastItem.regex === regex) {
      // Обновляем timestamp последней записи
      lastItem.date = new Date().toISOString();
      saveHistoryToStorage();
      return;
    }
  }

  const historyItem = {
    id: generateId('history'),
    regex: regex,
    date: new Date().toISOString(),
    favorite: false,
    ...metadata
  };

  // Добавляем в начало массива
  historyState.items.unshift(historyItem);

  // Ограничиваем размер истории
  if (historyState.items.length > HISTORYCONFIG.MAXITEMS) {
    historyState.items = historyState.items.slice(0, HISTORYCONFIG.MAXITEMS);
  }

  saveHistoryToStorage();
}

/**
 * Удаляет запись из истории
 * @param {string} itemId - ID записи
 * @returns {void}
 * @example
 * removeFromHistory('history-123');
 */
export function removeFromHistory(itemId) {
  const index = historyState.items.findIndex(item => item.id === itemId);
  if (index === -1) return;

  historyState.items.splice(index, 1);
  saveHistoryToStorage();
  renderHistory();
}

/**
 * Очищает всю историю
 * @returns {void}
 * @example
 * clearHistory();
 */
export function clearHistory() {
  historyState.items = [];
  historyState.currentPage = 1;
  saveHistoryToStorage();
  renderHistory();
}

/**
 * Переключает статус "избранное" для записи
 * @param {string} itemId - ID записи
 * @returns {void}
 * @example
 * toggleFavorite('history-123');
 */
export function toggleFavorite(itemId) {
  const item = historyState.items.find(i => i.id === itemId);
  if (!item) return;

  item.favorite = !item.favorite;
  saveHistoryToStorage();
  renderHistory();
}

/**
 * Загружает regex из истории в приложение
 * @param {string} itemId - ID записи
 * @returns {void}
 * @example
 * loadFromHistory('history-123');
 */
export function loadFromHistory(itemId) {
  const item = historyState.items.find(i => i.id === itemId);
  if (!item) return;

  // Вставляем regex в output
  const output = document.getElementById('resultOutput');
  if (output) {
    output.value = item.regex;
  }

  closeModal('historyModal');
  
  // Вызываем custom event для синхронизации
  const event = new CustomEvent('historyLoaded', {
    detail: { item },
    bubbles: true
  });
  document.dispatchEvent(event);

  showToast('success', 'Regex загружен из истории');
}

/**
 * Возвращает все записи истории
 * @returns {Array} - Массив записей
 * @example
 * const items = getAllHistoryItems();
 */
export function getAllHistoryItems() {
  return [...historyState.items];
}

/**
 * Возвращает избранные записи
 * @returns {Array} - Массив избранных записей
 * @example
 * const favorites = getFavoriteItems();
 */
export function getFavoriteItems() {
  return historyState.items.filter(item => item.favorite);
}

/**
 * Возвращает последние N записей
 * @param {number} count - Количество записей
 * @returns {Array} - Массив записей
 * @example
 * const recent = getRecentItems(10);
 */
export function getRecentItems(count = 10) {
  return historyState.items.slice(0, count);
}

/**
 * Ищет в истории по запросу
 * @param {string} query - Поисковый запрос
 * @returns {Array} - Массив найденных записей
 * @example
 * const results = searchHistory('test');
 */
export function searchHistory(query) {
  if (!query || typeof query !== 'string') return historyState.items;

  const lowerQuery = query.toLowerCase();
  return historyState.items.filter(item => 
    item.regex.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Возвращает отфильтрованные записи (по текущему фильтру и поиску)
 * @returns {Array} - Массив записей
 * @private
 */
function getFilteredItems() {
  let items = [...historyState.items];

  // Применяем фильтр
  if (historyState.filter === 'favorites') {
    items = items.filter(item => item.favorite);
  } else if (historyState.filter === 'recent') {
    items = items.slice(0, 20);
  }

  // Применяем поиск
  if (historyState.searchQuery) {
    const query = historyState.searchQuery.toLowerCase();
    items = items.filter(item => item.regex.toLowerCase().includes(query));
  }

  return items;
}

/**
 * Возвращает записи для текущей страницы
 * @returns {Array} - Массив записей
 * @private
 */
function getPaginatedItems() {
  const filtered = getFilteredItems();
  const start = (historyState.currentPage - 1) * historyState.itemsPerPage;
  const end = start + historyState.itemsPerPage;
  return filtered.slice(start, end);
}

/**
 * Возвращает количество страниц
 * @returns {number} - Количество страниц
 * @private
 */
function getTotalPages() {
  const filtered = getFilteredItems();
  return Math.ceil(filtered.length / historyState.itemsPerPage);
}

/**
 * Рендерит историю в модальном окне
 * @returns {void}
 * @private
 */
function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;

  const items = getPaginatedItems();
  const totalPages = getTotalPages();
  const filteredCount = getFilteredItems().length;

  // Если нет записей
  if (items.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <p>История пуста</p>
      </div>
    `;
    renderPagination(0, 0);
    return;
  }

  // Генерируем HTML для записей
  const itemsHTML = items.map(item => createHistoryItemHTML(item)).join('');
  container.innerHTML = itemsHTML;

  // Добавляем event listeners
  attachHistoryItemListeners();

  // Рендерим пагинацию
  renderPagination(historyState.currentPage, totalPages);

  // Обновляем счетчик
  updateHistoryCounter(filteredCount);
}

/**
 * Создает HTML для одной записи истории
 * @param {Object} item - Запись истории
 * @returns {string} - HTML-строка
 * @private
 */
function createHistoryItemHTML(item) {
  const date = new Date(item.date);
  const formattedDate = formatDate(date);
  const truncatedRegex = truncateText(item.regex, 100);
  const favoriteClass = item.favorite ? 'favorite-active' : '';

  return `
    <div class="history-item" data-item-id="${item.id}">
      <div class="history-item-header">
        <span class="history-item-date">${formattedDate}</span>
        <div class="history-item-actions">
          <button 
            class="btn-icon btn-favorite ${favoriteClass}" 
            data-action="toggle-favorite" 
            data-item-id="${item.id}"
            title="${item.favorite ? 'Убрать из избранного' : 'Добавить в избранное'}"
          >
            ${item.favorite ? '★' : '☆'}
          </button>
          <button 
            class="btn-icon btn-load" 
            data-action="load" 
            data-item-id="${item.id}"
            title="Загрузить"
          >
            ↻
          </button>
          <button 
            class="btn-icon btn-icon-danger" 
            data-action="remove" 
            data-item-id="${item.id}"
            title="Удалить"
          >
            ×
          </button>
        </div>
      </div>
      <div class="history-item-body">
        <code class="history-item-regex">${truncatedRegex}</code>
        <span class="history-item-length">${item.regex.length} символов</span>
      </div>
    </div>
  `;
}

/**
 * Добавляет event listeners к элементам истории
 * @returns {void}
 * @private
 */
function attachHistoryItemListeners() {
  const favoriteButtons = document.querySelectorAll('[data-action="toggle-favorite"]');
  const loadButtons = document.querySelectorAll('[data-action="load"]');
  const removeButtons = document.querySelectorAll('[data-action="remove"]');

  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleFavorite(btn.dataset.itemId);
    });
  });

  loadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      loadFromHistory(btn.dataset.itemId);
    });
  });

  removeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromHistory(btn.dataset.itemId);
    });
  });
}

/**
 * Рендерит пагинацию
 * @param {number} currentPage - Текущая страница
 * @param {number} totalPages - Всего страниц
 * @returns {void}
 * @private
 */
function renderPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('historyPagination');
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '<div class="pagination">';

  // Кнопка "Назад"
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-btn" data-page="${currentPage - 1}">←</button>`;
  }

  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      const activeClass = i === currentPage ? 'pagination-btn-active' : '';
      paginationHTML += `<button class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  // Кнопка "Вперед"
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-btn" data-page="${currentPage + 1}">→</button>`;
  }

  paginationHTML += '</div>';
  paginationContainer.innerHTML = paginationHTML;

  // Добавляем event listeners
  const pageButtons = paginationContainer.querySelectorAll('.pagination-btn');
  pageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      if (page) {
        historyState.currentPage = page;
        renderHistory();
      }
    });
  });
}

/**
 * Обновляет счетчик записей в истории
 * @param {number} count - Количество записей
 * @returns {void}
 * @private
 */
function updateHistoryCounter(count) {
  const counter = document.getElementById('historyCounter');
  if (!counter) return;

  counter.textContent = `${count} ${pluralize(count, ['запись', 'записи', 'записей'])}`;
}

/**
 * Обновляет состояние кнопок фильтров
 * @returns {void}
 * @private
 */
function updateFilterButtons() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => {
    if (btn.dataset.filter === historyState.filter) {
      btn.classList.add('filter-active');
    } else {
      btn.classList.remove('filter-active');
    }
  });
}

/**
 * Обработчик кнопки "Очистить историю"
 * @returns {void}
 * @private
 */
function handleClearHistory() {
  showConfirmWithSkip(
    'clearHistory',
    'Очистить историю?',
    'Все записи будут удалены. Это действие нельзя отменить.',
    () => {
      clearHistory();
      showToast('success', 'История очищена');
    }
  );
}

/**
 * Сохраняет историю в localStorage
 * @returns {void}
 * @private
 */
function saveHistoryToStorage() {
  try {
    setLocalStorage(HISTORYCONFIG.STORAGEKEY, historyState.items);
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * Загружает историю из localStorage
 * @returns {void}
 * @private
 */
function loadHistoryFromStorage() {
  try {
    const saved = getLocalStorage(HISTORYCONFIG.STORAGEKEY, []);
    historyState.items = Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    historyState.items = [];
  }
}

/**
 * Экспортирует историю
 * @param {string} format - Формат: 'txt', 'csv', 'json'
 * @returns {void}
 * @example
 * exportHistoryData('json');
 */
export function exportHistoryData(format = 'json') {
  exportHistory(historyState.items, format);
}

/**
 * Импортирует историю из данных
 * @param {Array} data - Массив записей истории
 * @param {boolean} [append=false] - Добавить к существующей (true) или заменить (false)
 * @returns {void}
 * @example
 * importHistoryData(importedData, true);
 */
export function importHistoryData(data, append = false) {
  if (!Array.isArray(data)) {
    showToast('error', 'Некорректный формат данных');
    return;
  }

  if (append) {
    historyState.items = [...data, ...historyState.items];
  } else {
    historyState.items = data;
  }

  // Ограничиваем размер
  if (historyState.items.length > HISTORYCONFIG.MAXITEMS) {
    historyState.items = historyState.items.slice(0, HISTORYCONFIG.MAXITEMS);
  }

  saveHistoryToStorage();
  renderHistory();

  showToast('success', `Импортировано ${data.length} записей`);
}

/**
 * Возвращает размер истории
 * @returns {number} - Количество записей
 * @example
 * const size = getHistorySize();
 */
export function getHistorySize() {
  return historyState.items.length;
}

/**
 * Проверяет, заполнена ли история
 * @returns {boolean} - true, если достигнут лимит
 * @example
 * if (isHistoryFull()) { ... }
 */
export function isHistoryFull() {
  return historyState.items.length >= HISTORYCONFIG.MAXITEMS;
}

/**
 * Показывает toast-уведомление (временная функция)
 * @param {string} type - Тип уведомления
 * @param {string} message - Сообщение
 * @returns {void}
 * @private
 */
function showToast(type, message) {
  // TODO: Заменить на import { showToast } from '../core/errors.js';
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  if (typeof window.showToast === 'function') {
    window.showToast(type, message);
  }
}

/**
 * Склонение слов (временная функция)
 * @param {number} count - Количество
 * @param {string[]} forms - Формы слова [1, 2, 5]
 * @returns {string} - Правильная форма слова
 * @private
 */
function pluralize(count, forms) {
  // TODO: Заменить на import { pluralize } from '../core/utils.js';
  if (count % 10 === 1 && count % 100 !== 11) return forms[0];
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return forms[1];
  return forms[2];
}
