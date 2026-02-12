/**
 * RegexHelper v4.0 - Core Utilities
 * 
 * Библиотека утилитарных функций общего назначения.
 * Этот модуль не имеет зависимостей и используется всеми остальными модулями.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Экранирует HTML-символы для безопасного вывода
 * @param {string} str - Строка для экранирования
 * @returns {string} - Экранированная строка
 * @example
 * escapeHTML('<script>alert("XSS")</script>') // '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHTML(str) {
  if (!str || typeof str !== 'string') return '';
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return str.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

/**
 * Экранирует спецсимволы regex (важнейшая функция v4.0!)
 * @param {string} str - Строка для экранирования
 * @returns {string} - Экранированная строка
 * @example
 * escapeRegex('test.com') // 'test\\.com'
 * escapeRegex('a(b)') // 'a\\(b\\)'
 * escapeRegex('a|b') // 'a\\|b'
 */
export function escapeRegex(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Копирует текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} - true при успехе, false при ошибке
 * @example
 * const success = await copyToClipboard('test');
 * if (success) showToast('success', 'Скопировано!');
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      textarea.remove();
      return success;
    }
  } catch (error) {
    console.error('copyToClipboard error:', error);
    return false;
  }
}

/**
 * Debounce функции (задержка выполнения)
 * @param {Function} func - Функция для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Debounced функция
 * @example
 * const debouncedSearch = debounce(() => console.log('search'), 300);
 * input.addEventListener('input', debouncedSearch);
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle функции (ограничение частоты вызова)
 * @param {Function} func - Функция для throttle
 * @param {number} delay - Минимальный интервал между вызовами (мс)
 * @returns {Function} - Throttled функция
 * @example
 * const throttledScroll = throttle(() => console.log('scroll'), 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/**
 * Скачивает файл с заданным содержимым
 * @param {string} content - Содержимое файла
 * @param {string} filename - Имя файла
 * @param {string} mimeType - MIME-тип (по умолчанию 'text/plain')
 * @returns {void}
 * @example
 * downloadFile('test regex', 'regex.txt', 'text/plain');
 * downloadFile(JSON.stringify(data), 'data.json', 'application/json');
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Убирает HTML-экранирование из строки
 * @param {string} str - Экранированная строка
 * @returns {string} - Оригинальная строка
 * @example
 * unescapeHTML('&lt;div&gt;') // '<div>'
 */
export function unescapeHTML(str) {
  if (!str || typeof str !== 'string') return '';
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Обрезает текст до заданной длины с добавлением "..."
 * @param {string} text - Текст для обрезки
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанный текст
 * @example
 * truncateText('Long text here', 10) // 'Long text...'
 */
export function truncateText(text, maxLength) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Форматирует дату в читаемый формат (DD.MM.YYYY HH:MM)
 * @param {Date|string|number} date - Дата для форматирования
 * @returns {string} - Отформатированная дата
 * @example
 * formatDate(new Date()) // '12.02.2026 20:15'
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Экранирует текст для CSV формата
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 * @example
 * escapeCSV('test, "hello"') // '"test, ""hello"""'
 */
export function escapeCSV(text) {
  if (text == null) return '';
  
  const str = String(text);
  
  // Если содержит запятую, кавычки или перенос строки - оборачиваем в кавычки
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Экранируем двойные кавычки удвоением
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Возвращает текущий timestamp в миллисекундах
 * @returns {number} - Timestamp
 * @example
 * const timestamp = getCurrentTimestamp(); // 1707764400000
 */
export function getCurrentTimestamp() {
  return Date.now();
}

/**
 * Склоняет слово в зависимости от числа (русский язык)
 * @param {number} count - Число
 * @param {string[]} forms - Массив из 3 форм: [1, 2, 5]
 * @returns {string} - Склоненное слово
 * @example
 * pluralize(1, ['триггер', 'триггера', 'триггеров']) // 'триггер'
 * pluralize(2, ['триггер', 'триггера', 'триггеров']) // 'триггера'
 * pluralize(5, ['триггер', 'триггера', 'триггеров']) // 'триггеров'
 */
export function pluralize(count, forms) {
  if (!Array.isArray(forms) || forms.length !== 3) return '';
  
  const cases = [2, 0, 1, 1, 1, 2];
  const index = (count % 100 > 4 && count % 100 < 20)
    ? 2
    : cases[Math.min(count % 10, 5)];
  
  return forms[index];
}

/**
 * Генерирует уникальный ID
 * @param {string} prefix - Префикс для ID (опционально)
 * @returns {string} - Уникальный ID
 * @example
 * generateId() // 'id-1707764400000-abc123'
 * generateId('group') // 'group-1707764400000-abc123'
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Создает глубокую копию объекта
 * @param {*} obj - Объект для клонирования
 * @returns {*} - Глубокая копия
 * @example
 * const copy = deepClone({ a: 1, b: { c: 2 } });
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Сравнивает два объекта на глубокое равенство
 * @param {*} obj1 - Первый объект
 * @param {*} obj2 - Второй объект
 * @returns {boolean} - true, если объекты равны
 * @example
 * objectEquals({ a: 1 }, { a: 1 }) // true
 * objectEquals({ a: 1 }, { a: 2 }) // false
 */
export function objectEquals(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!objectEquals(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * Проверяет, является ли значение пустым
 * @param {*} value - Значение для проверки
 * @returns {boolean} - true, если значение пустое
 * @example
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty(null) // true
 * isEmpty('text') // false
 */
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Проверяет корректность email
 * @param {string} email - Email для проверки
 * @returns {boolean} - true, если email корректный
 * @example
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверяет корректность URL
 * @param {string} url - URL для проверки
 * @returns {boolean} - true, если URL корректный
 * @example
 * isValidUrl('https://example.com') // true
 * isValidUrl('invalid-url') // false
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Генерирует случайное целое число в диапазоне [min, max]
 * @param {number} min - Минимальное значение
 * @param {number} max - Максимальное значение
 * @returns {number} - Случайное число
 * @example
 * randomInt(1, 10) // 7
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Перемешивает массив (алгоритм Фишера-Йетса)
 * @param {Array} array - Массив для перемешивания
 * @returns {Array} - Перемешанный массив
 * @example
 * shuffleArray([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4]
 */
export function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Сохраняет данные в localStorage
 * @param {string} key - Ключ
 * @param {*} value - Значение (будет сериализовано в JSON)
 * @returns {boolean} - true при успехе
 * @example
 * setLocalStorage('settings', { theme: 'dark' });
 */
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('setLocalStorage error:', error);
    return false;
  }
}

/**
 * Получает данные из localStorage
 * @param {string} key - Ключ
 * @param {*} defaultValue - Значение по умолчанию
 * @returns {*} - Значение из localStorage или defaultValue
 * @example
 * const settings = getLocalStorage('settings', { theme: 'light' });
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('getLocalStorage error:', error);
    return defaultValue;
  }
}

/**
 * Удаляет данные из localStorage
 * @param {string} key - Ключ
 * @returns {void}
 * @example
 * removeLocalStorage('settings');
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('removeLocalStorage error:', error);
  }
}

/**
 * Очищает весь localStorage
 * @returns {void}
 * @example
 * clearLocalStorage();
 */
export function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('clearLocalStorage error:', error);
  }
}

/**
 * Устанавливает cookie
 * @param {string} name - Имя cookie
 * @param {string} value - Значение
 * @param {number} days - Срок действия (дней)
 * @returns {void}
 * @example
 * setCookie('token', 'abc123', 7);
 */
export function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

/**
 * Получает значение cookie по имени
 * @param {string} name - Имя cookie
 * @returns {string|null} - Значение cookie или null
 * @example
 * const token = getCookie('token');
 */
export function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Удаляет cookie по имени
 * @param {string} name - Имя cookie
 * @returns {void}
 * @example
 * deleteCookie('token');
 */
export function deleteCookie(name) {
  setCookie(name, '', -1);
}
