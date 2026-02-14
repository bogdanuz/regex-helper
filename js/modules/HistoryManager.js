/**
 * HistoryManager.js
 * Менеджер истории конвертаций для RegexHelper v4.0
 * Добавление, рендеринг, удаление записей истории
 */

import { 
  saveToHistory, 
  getHistory, 
  getRecentHistory,
  deleteFromHistory, 
  clearHistory,
  getHistoryCount,
  searchHistory
} from '../utils/storage.js';

/**
 * Менеджер истории конвертаций
 */
class HistoryManager {
  constructor() {
    this.historyContainer = document.getElementById('history-grid');
    this.emptyState = document.getElementById('history-empty');
    this.historyCount = document.getElementById('history-count');

    // Инициализация
    this.init();
  }

  /**
   * Инициализация менеджера
   */
  init() {
    // Рендерим последние 10 записей
    this.renderHistory();

    // Навешиваем обработчики
    this.attachEventListeners();

    // Обновляем счётчик
    this.updateCounter();
  }

  /**
   * Добавление записи в историю
   * @param {Object} conversionData - Данные конвертации
   * @param {Array<string>} conversionData.triggers - Триггеры
   * @param {Object} conversionData.params - Параметры
   * @param {string} conversionData.result - Результат
   * @param {string} conversionData.type - Тип ('simple' или 'linked')
   */
  addToHistory(conversionData) {
    const item = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      triggers: conversionData.triggers.slice(0, 10), // Первые 10 триггеров
      params: conversionData.params || {},
      result: conversionData.result,
      type: conversionData.type || 'simple'
    };

    // Сохраняем в localStorage
    const saved = saveToHistory(item);

    if (saved) {
      // Перерисовываем историю
      this.renderHistory();

      // Обновляем счётчик
      this.updateCounter();

      // Показываем уведомление
      if (window.NotificationManager) {
        window.NotificationManager.success('Добавлено в историю');
      }
    }
  }

  /**
   * Рендеринг секции истории (последние 10 записей)
   */
  renderHistory() {
    const recentHistory = getRecentHistory(10);

    // Если история пуста
    if (recentHistory.length === 0) {
      this.historyContainer.style.display = 'none';
      this.emptyState.style.display = 'flex';
      return;
    }

    // Скрываем empty state
    this.emptyState.style.display = 'none';
    this.historyContainer.style.display = 'grid';

    // Очищаем контейнер
    this.historyContainer.innerHTML = '';

    // Рендерим карточки
    recentHistory.forEach(item => {
      const card = this.createHistoryCard(item);
      this.historyContainer.appendChild(card);
    });
  }

  /**
   * Создание карточки истории
   * @param {Object} item - Запись истории
   * @returns {HTMLElement} Карточка
   */
  createHistoryCard(item) {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.dataset.id = item.id;

    // Форматирование даты
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Триггеры (первые 3 + "ещё N")
    let triggersText = '';
    if (item.triggers.length <= 3) {
      triggersText = item.triggers.join(', ');
    } else {
      triggersText = item.triggers.slice(0, 3).join(', ') + 
                     ` <span class="more-triggers">ещё ${item.triggers.length - 3}</span>`;
    }

    // Параметры (badge)
    const paramsHTML = this.renderParamsBadges(item.params);

    // Результат (первые 50 символов)
    let resultText = item.result;
    if (resultText.length > 50) {
      resultText = resultText.substring(0, 50) + '...';
    }

    // Тип
    const typeText = item.type === 'simple' ? 'Простые' : 'Связанные';
    const typeClass = item.type === 'simple' ? 'type-simple' : 'type-linked';

    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-date">${dateStr} ${timeStr}</span>
        <span class="history-type ${typeClass}">${typeText}</span>
      </div>

      <div class="history-card-body">
        <div class="history-triggers">
          <strong>Триггеры:</strong> ${triggersText}
        </div>

        ${paramsHTML ? `
          <div class="history-params">
            <strong>Параметры:</strong>
            <div class="history-params-badges">
              ${paramsHTML}
            </div>
          </div>
        ` : ''}

        <div class="history-result">
          <strong>Результат:</strong>
          <code>${resultText}</code>
        </div>
      </div>

      <div class="history-card-footer">
        <button class="btn-small btn-primary" data-action="copy-history">
          📋 Копировать
        </button>
        <button class="btn-small btn-secondary" data-action="view-history">
          👁️ Подробнее
        </button>
        <button class="btn-small btn-danger" data-action="delete-history">
          🗑️ Удалить
        </button>
      </div>
    `;

    return card;
  }

  /**
   * Рендеринг badge параметров
   * @param {Object} params - Объект параметров
   * @returns {string} HTML с badge
   */
  renderParamsBadges(params) {
    const badges = [];

    if (params.latinCyrillic) {
      badges.push('<span class="param-badge latin-cyrillic">🔤 Лат/Кир</span>');
    }
    if (params.declensions) {
      badges.push('<span class="param-badge declensions">📖 Склонения</span>');
    }
    if (params.commonRoot) {
      badges.push('<span class="param-badge common-root">🌿 Корень</span>');
    }
    if (params.optionalChars) {
      badges.push('<span class="param-badge optional">❓ Опц. символы</span>');
    }
    if (params.prefix) {
      badges.push('<span class="param-badge prefix">🎯 Префикс</span>');
    }

    return badges.join('');
  }

  /**
   * Обновление счётчика истории
   */
  updateCounter() {
    const count = getHistoryCount();

    if (this.historyCount) {
      this.historyCount.textContent = count;
    }
  }

  /**
   * Обработчики событий
   */
  attachEventListeners() {
    // Делегирование событий на контейнере истории
    this.historyContainer.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const card = e.target.closest('.history-card');

      if (!card) return;

      const id = card.dataset.id;

      switch (action) {
        case 'copy-history':
          this.copyHistoryItem(id);
          break;
        case 'view-history':
          this.viewHistoryItem(id);
          break;
        case 'delete-history':
          this.deleteHistoryItem(id);
          break;
      }
    });

    // Кнопка "Очистить историю"
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllHistory());
    }

    // Кнопка "Показать всю историю" (открывает модал)
    const showAllBtn = document.getElementById('show-all-history-btn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => this.openHistoryModal());
    }
  }

  /**
   * Копирование результата из истории
   * @param {string} id - ID записи
   */
  copyHistoryItem(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);

    if (!item) {
      console.error('Запись не найдена:', id);
      return;
    }

    // Копируем результат в буфер обмена
    navigator.clipboard.writeText(item.result)
      .then(() => {
        if (window.NotificationManager) {
          window.NotificationManager.success('Результат скопирован');
        }
      })
      .catch(err => {
        console.error('Ошибка копирования:', err);
        if (window.NotificationManager) {
          window.NotificationManager.error('Ошибка копирования');
        }
      });
  }

  /**
   * Просмотр полной записи истории
   * @param {string} id - ID записи
   */
  viewHistoryItem(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);

    if (!item) {
      console.error('Запись не найдена:', id);
      return;
    }

    // Открываем модал с подробной информацией
    if (window.ModalManager) {
      window.ModalManager.openHistoryDetailModal(item);
    }
  }

  /**
   * Удаление записи из истории
   * @param {string} id - ID записи
   */
  deleteHistoryItem(id) {
    // Подтверждение удаления
    const confirmed = confirm('Удалить эту запись из истории?');

    if (!confirmed) return;

    // Удаляем из localStorage
    const deleted = deleteFromHistory(id);

    if (deleted) {
      // Перерисовываем историю
      this.renderHistory();

      // Обновляем счётчик
      this.updateCounter();

      if (window.NotificationManager) {
        window.NotificationManager.success('Запись удалена');
      }
    } else {
      if (window.NotificationManager) {
        window.NotificationManager.error('Ошибка удаления');
      }
    }
  }

  /**
   * Очистка всей истории
   */
  clearAllHistory() {
    // Подтверждение
    const confirmed = confirm('Удалить ВСЮ историю? Это действие нельзя отменить.');

    if (!confirmed) return;

    const cleared = clearHistory();

    if (cleared) {
      // Перерисовываем (покажется empty state)
      this.renderHistory();

      // Обновляем счётчик
      this.updateCounter();

      if (window.NotificationManager) {
        window.NotificationManager.success('История очищена');
      }
    } else {
      if (window.NotificationManager) {
        window.NotificationManager.error('Ошибка очистки');
      }
    }
  }

  /**
   * Открытие модального окна со всей историей
   */
  openHistoryModal() {
    if (window.ModalManager) {
      window.ModalManager.openModal('history');
    }
  }

  /**
   * Поиск в истории
   * @param {string} query - Поисковый запрос
   */
  search(query) {
    if (!query || query.trim().length === 0) {
      // Если запрос пустой, показываем последние 10
      this.renderHistory();
      return;
    }

    const results = searchHistory(query);

    // Рендерим результаты поиска
    if (results.length === 0) {
      this.historyContainer.innerHTML = '<p class="no-results">Ничего не найдено</p>';
      return;
    }

    this.historyContainer.innerHTML = '';
    results.slice(0, 10).forEach(item => {
      const card = this.createHistoryCard(item);
      this.historyContainer.appendChild(card);
    });
  }

  /**
   * Получение статистики истории
   * @returns {Object} Статистика
   */
  getStats() {
    const history = getHistory();

    const stats = {
      total: history.length,
      simple: history.filter(h => h.type === 'simple').length,
      linked: history.filter(h => h.type === 'linked').length,
      withParams: history.filter(h => Object.keys(h.params).length > 0).length
    };

    return stats;
  }
}

// Singleton
let instance = null;

/**
 * Получение экземпляра менеджера
 */
export function getHistoryManager() {
  if (!instance) {
    instance = new HistoryManager();
  }
  return instance;
}

export default HistoryManager;
