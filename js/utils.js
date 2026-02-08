/* ============================================
   REGEXHELPER - UTILITY FUNCTIONS
   Вспомогательные функции для всего приложения
   ============================================ */

/**
 * Экранирование HTML символов для защиты от XSS
 * @param {string} str - Строка для экранирования
 * @returns {string} - Безопасная строка
 */
function escapeHTML(str) {
    if (!str) return '';
    
    const htmlEscapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    
    return String(str).replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
}

/**
 * Экранирование спецсимволов regex
 * @param {string} str - Строка для экранирования
 * @returns {string} - Строка с экранированными спецсимволами
 */
function escapeRegex(str) {
    if (!str) return '';
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Вычисление факториала числа
 * Используется для расчета количества перестановок
 * @param {number} n - Число
 * @returns {number} - Факториал
 */
function factorial(n) {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/**
 * Задержка выполнения функции (debounce)
 * Используется для оптимизации при вводе текста
 * @param {Function} fn - Функция для выполнения
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Обернутая функция
 */
function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Копирование текста в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} - true если успешно, false если ошибка
 */
async function copyToClipboard(text) {
    try {
        // Современный API (поддерживается в большинстве браузеров)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        return success;
    } catch (error) {
        console.error('Ошибка копирования:', error);
        return false;
    }
}

/**
 * Скачивание файла
 * @param {string} content - Содержимое файла
 * @param {string} filename - Имя файла
 * @param {string} type - MIME тип (по умолчанию text/plain)
 */
function downloadFile(content, filename, type = 'text/plain') {
    try {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Очистка
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Ошибка скачивания файла:', error);
        return false;
    }
}

/**
 * Форматирование даты
 * @param {Date} date - Объект Date
 * @param {boolean} withTime - Включать время (по умолчанию true)
 * @returns {string} - Отформатированная дата (DD.MM.YYYY HH:MM)
 */
function formatDate(date, withTime = true) {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let formatted = `${day}.${month}.${year}`;
    
    if (withTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        formatted += ` ${hours}:${minutes}`;
    }
    
    return formatted;
}

/**
 * Генерация уникального ID
 * @returns {string} - Уникальный ID на основе timestamp + random
 */
function generateID() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Проверка корректности regex
 * @param {string} pattern - Строка regex
 * @returns {boolean} - true если regex корректный
 */
function isValidRegex(pattern) {
    if (!pattern || typeof pattern !== 'string') {
        return false;
    }
    
    try {
        new RegExp(pattern);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Генерация всех перестановок массива
 * Используется для связанных триггеров
 * @param {Array} array - Исходный массив
 * @returns {Array} - Массив всех перестановок
 */
function getPermutations(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return [];
    }
    
    if (array.length === 1) {
        return [array];
    }
    
    const result = [];
    
    for (let i = 0; i < array.length; i++) {
        const current = array[i];
        const remaining = array.slice(0, i).concat(array.slice(i + 1));
        const remainingPermutations = getPermutations(remaining);
        
        for (let perm of remainingPermutations) {
            result.push([current].concat(perm));
        }
    }
    
    return result;
}

/**
 * Удаление дубликатов из массива
 * @param {Array} array - Исходный массив
 * @returns {Object} - { cleaned: массив без дубликатов, duplicates: количество дубликатов }
 */
function removeDuplicates(array) {
    if (!Array.isArray(array)) {
        return { cleaned: [], duplicates: 0 };
    }
    
    const originalLength = array.length;
    const cleaned = [...new Set(array)];
    const duplicates = originalLength - cleaned.length;
    
    return { cleaned, duplicates };
}

/**
 * Подсчет символов в строке (для проверки лимитов)
 * @param {string} str - Строка
 * @returns {number} - Количество символов
 */
function countChars(str) {
    return str ? String(str).length : 0;
}

/**
 * Проверка, является ли строка пустой (или только пробелы)
 * @param {string} str - Строка
 * @returns {boolean} - true если пустая
 */
function isEmpty(str) {
    return !str || String(str).trim().length === 0;
}

/**
 * Очистка строки (trim + lowercase)
 * @param {string} str - Строка
 * @returns {string} - Очищенная строка
 */
function cleanString(str) {
    if (!str) return '';
    return String(str).trim().toLowerCase();
}

/**
 * Разбиение текста по строкам и очистка
 * @param {string} text - Текст
 * @returns {Array} - Массив строк (без пустых)
 */
function splitLines(text) {
    if (!text) return [];
    
    return String(text)
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/**
 * Проверка лимита массива
 * @param {Array} array - Массив
 * @param {number} limit - Лимит
 * @returns {Object} - { valid: boolean, count: number, limit: number }
 */
function checkArrayLimit(array, limit) {
    const count = Array.isArray(array) ? array.length : 0;
    return {
        valid: count <= limit,
        count: count,
        limit: limit,
        exceeded: count - limit
    };
}

/**
 * Проверка лимита длины строки
 * @param {string} str - Строка
 * @param {number} limit - Лимит
 * @returns {Object} - { valid: boolean, length: number, limit: number }
 */
function checkLengthLimit(str, limit) {
    const length = countChars(str);
    return {
        valid: length <= limit,
        length: length,
        limit: limit,
        exceeded: length - limit
    };
}

/**
 * Склонение числительных (1 триггер, 2 триггера, 5 триггеров)
 * @param {number} number - Число
 * @param {Array} forms - Формы слова [1 триггер, 2 триггера, 5 триггеров]
 * @returns {string} - Правильная форма
 */
function pluralize(number, forms) {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    
    if (n > 10 && n < 20) {
        return forms[2]; // триггеров
    }
    if (n1 > 1 && n1 < 5) {
        return forms[1]; // триггера
    }
    if (n1 === 1) {
        return forms[0]; // триггер
    }
    return forms[2]; // триггеров
}

/**
 * Обрезка строки с добавлением троеточия
 * @param {string} str - Строка
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанная строка
 */
function truncate(str, maxLength) {
    if (!str) return '';
    const text = String(str);
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Получение текущей даты и времени в формате ISO
 * @returns {string} - ISO строка
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * Парсинг ISO даты в объект Date
 * @param {string} isoString - ISO строка
 * @returns {Date|null} - Date объект или null
 */
function parseISODate(isoString) {
    try {
        const date = new Date(isoString);
        return isNaN(date) ? null : date;
    } catch (error) {
        return null;
    }
}

// Экспортируем функции для использования в других модулях
// (В браузере они станут глобальными)
if (typeof module !== 'undefined' && module.exports) {
    // Node.js окружение (для тестов)
    module.exports = {
        escapeHTML,
        escapeRegex,
        factorial,
        debounce,
        copyToClipboard,
        downloadFile,
        formatDate,
        generateID,
        isValidRegex,
        getPermutations,
        removeDuplicates,
        countChars,
        isEmpty,
        cleanString,
        splitLines,
        checkArrayLimit,
        checkLengthLimit,
        pluralize,
        truncate,
        getCurrentTimestamp,
        parseISODate
    };
}
