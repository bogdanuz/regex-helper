/**
 * RegexHelper v4.0 - Core Utilities
 * Утилитарные функции для работы приложения
 * @version 1.0
 * @date 11.02.2026
 */

/**
 * Экранирует HTML-символы для безопасного отображения
 * @param {string} str - Строка для экранирования
 * @returns {string} - Экранированная строка
 * @example
 * escapeHTML('<script>alert("XSS")</script>') // => '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Экранирует специальные символы для использования в regex
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: правильное экранирование обратного слэша
 * @param {string} str - Строка для экранирования
 * @returns {string} - Экранированная строка для regex
 * @example
 * escapeRegex('test.') // => 'test\\.'
 * escapeRegex('a+b') // => 'a\\+b'
 * escapeRegex('a?b') // => 'a\\?b'
 */
export function escapeRegex(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Убирает HTML-экранирование
 * @param {string} str - Экранированная строка
 * @returns {string} - Обычная строка
 */
export function unescapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
}

/**
 * Обрезает текст до указанной длины
 * @param {string} text - Текст для обрезки
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанный текст с многоточием
 * @example
 * truncateText('Длинный текст', 10) // => 'Длинный...'
 */
export function truncateText(text, maxLength) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Копирует текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} - true если успешно, false если ошибка
 * @example
 * const success = await copyToClipboard('Hello');
 */
export async function copyToClipboard(text) {
    if (!text || typeof text !== 'string') return false;
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Форматирует дату в читаемый вид
 * @param {Date|string|number} date - Дата для форматирования
 * @returns {string} - Отформатированная дата
 * @example
 * formatDate(new Date()) // => '11.02.2026, 23:02'
 */
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Возвращает текущий timestamp
 * @returns {number} - Timestamp в миллисекундах
 * @example
 * getCurrentTimestamp() // => 1739308920000
 */
export function getCurrentTimestamp() {
    return Date.now();
}

/**
 * Debounce функция (задержка выполнения)
 * @param {Function} func - Функция для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Debounced функция
 * @example
 * const debouncedSearch = debounce(() => console.log('Search'), 300);
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle функция (ограничение частоты выполнения)
 * @param {Function} func - Функция для throttle
 * @param {number} delay - Минимальная задержка между вызовами
 * @returns {Function} - Throttled функция
 * @example
 * const throttledScroll = throttle(() => console.log('Scroll'), 100);
 */
export function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

/**
 * Склонение слов (1 яблоко, 2 яблока, 5 яблок)
 * @param {number} count - Количество
 * @param {Array<string>} forms - Формы слова [1, 2, 5]
 * @returns {string} - Правильная форма слова
 * @example
 * pluralize(1, ['триггер', 'триггера', 'триггеров']) // => 'триггер'
 * pluralize(5, ['триггер', 'триггера', 'триггеров']) // => 'триггеров'
 */
export function pluralize(count, forms) {
    if (!Array.isArray(forms) || forms.length !== 3) return forms[0] || '';
    const n = Math.abs(count) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}

/**
 * Генерирует уникальный ID
 * @returns {string} - Уникальный ID
 * @example
 * generateId() // => 'id-1739308920000-abc123'
 */
export function generateId() {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Глубокое клонирование объекта
 * @param {Object} obj - Объект для клонирования
 * @returns {Object} - Клонированный объект
 * @example
 * const copy = deepClone({ a: 1, b: { c: 2 } });
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Сравнение двух объектов
 * @param {Object} obj1 - Первый объект
 * @param {Object} obj2 - Второй объект
 * @returns {boolean} - true если объекты равны
 * @example
 * objectEquals({ a: 1 }, { a: 1 }) // => true
 */
export function objectEquals(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Проверка на пустое значение
 * @param {any} value - Значение для проверки
 * @returns {boolean} - true если пустое
 * @example
 * isEmpty('') // => true
 * isEmpty(null) // => true
 * isEmpty([]) // => true
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Проверка валидности email
 * @param {string} email - Email для проверки
 * @returns {boolean} - true если валидный
 * @example
 * isValidEmail('test@example.com') // => true
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Проверка валидности URL
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если валидный
 * @example
 * isValidUrl('https://example.com') // => true
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
 * Случайное целое число в диапазоне
 * @param {number} min - Минимум
 * @param {number} max - Максимум
 * @returns {number} - Случайное число
 * @example
 * randomInt(1, 10) // => 7
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Перемешивание массива
 * @param {Array} array - Массив для перемешивания
 * @returns {Array} - Перемешанный массив
 * @example
 * shuffleArray([1, 2, 3]) // => [3, 1, 2]
 */
export function shuffleArray(array) {
    if (!Array.isArray(array)) return [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Сохранение в localStorage
 * @param {string} key - Ключ
 * @param {any} value - Значение
 * @returns {boolean} - true если успешно
 * @example
 * setLocalStorage('key', { data: 'value' });
 */
export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Получение из localStorage
 * @param {string} key - Ключ
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any} - Значение или defaultValue
 * @example
 * getLocalStorage('key', {});
 */
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Удаление из localStorage
 * @param {string} key - Ключ
 * @returns {boolean} - true если успешно
 * @example
 * removeLocalStorage('key');
 */
export function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * Очистка localStorage
 * @returns {boolean} - true если успешно
 * @example
 * clearLocalStorage();
 */
export function clearLocalStorage() {
    try {
        localStorage.clear();
        return true;
    } catch {
        return false;
    }
}

/**
 * Скачивание файла
 * @param {string} content - Содержимое файла
 * @param {string} filename - Имя файла
 * @param {string} mimeType - MIME-тип
 * @example
 * downloadFile('Hello', 'file.txt', 'text/plain');
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
