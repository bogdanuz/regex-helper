/**
 * escape.js
 * Модуль экранирования спецсимволов regex для RegexHelper v4.0
 * Обрабатывает спецсимволы, чтобы они использовались как литералы
 */

/**
 * Спецсимволы regex, которые нужно экранировать
 * Порядок важен: \\ должен быть первым!
 */
const REGEX_SPECIAL_CHARS = [
  '\\',  // Обратный слэш (должен быть первым!)
  '.',    // Точка (любой символ)
  '+',    // Один или более
  '*',    // Ноль или более
  '?',    // Ноль или один
  '^',    // Начало строки
  '$',    // Конец строки
  '(',    // Открывающая скобка группы
  ')',    // Закрывающая скобка группы
  '[',    // Открывающая скобка класса
  ']',    // Закрывающая скобка класса
  '{',    // Открывающая фигурная скобка
  '}',    // Закрывающая фигурная скобка
  '|'     // Альтернация
];

/**
 * Экранирование спецсимволов regex
 * Преобразует спецсимволы в литералы
 * 
 * @param {string} text - Исходный текст
 * @returns {string} Текст с экранированными спецсимволами
 * 
 * @example
 * escapeRegex('text.+') // 'text\.\+'
 * escapeRegex('(test)') // '\(test\)'
 * escapeRegex('a|b') // 'a\|b'
 */
export function escapeRegex(text) {
  if (typeof text !== 'string') {
    throw new TypeError('escapeRegex: аргумент должен быть строкой');
  }

  // ВАЖНО: экранируем \\ ПЕРВЫМ, иначе будут двойные экранирования
  let result = text.replace(/\\/g, '\\\\');

  // Экранируем остальные спецсимволы
  const specialChars = ['.', '+', '*', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|'];

  specialChars.forEach(char => {
    const regex = new RegExp('\\' + char, 'g');
    result = result.replace(regex, '\\' + char);
  });

  return result;
}

/**
 * Проверка, содержит ли текст спецсимволы regex
 * 
 * @param {string} text - Текст для проверки
 * @returns {boolean} true, если есть спецсимволы
 * 
 * @example
 * hasSpecialChars('text.+') // true
 * hasSpecialChars('обычный текст') // false
 */
export function hasSpecialChars(text) {
  if (typeof text !== 'string') {
    return false;
  }

  const specialCharsRegex = /[\.\+\*\?\^\$\(\)\[\]\{\}\|]/;
  return specialCharsRegex.test(text);
}

/**
 * Получение списка найденных спецсимволов в тексте
 * 
 * @param {string} text - Текст для проверки
 * @returns {Array<Object>} Массив объектов {char, positions}
 * 
 * @example
 * getSpecialChars('text.+')
 * // [{char: '.', positions: [4]}, {char: '+', positions: [5]}]
 */
export function getSpecialChars(text) {
  if (typeof text !== 'string') {
    return [];
  }

  const result = [];
  const specialChars = ['\\', '.', '+', '*', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|'];

  specialChars.forEach(char => {
    const positions = [];
    let index = text.indexOf(char);

    while (index !== -1) {
      positions.push(index);
      index = text.indexOf(char, index + 1);
    }

    if (positions.length > 0) {
      result.push({
        char,
        positions,
        count: positions.length
      });
    }
  });

  return result;
}

/**
 * Экранирование спецсимволов ТОЛЬКО внутри character class [...] 
 * Внутри [...] экранируются только: \\ ] ^ -
 * 
 * @param {string} text - Текст внутри character class
 * @returns {string} Экранированный текст
 * 
 * @example
 * escapeCharClass('a-z]') // 'a\-z\]'
 */
export function escapeCharClass(text) {
  if (typeof text !== 'string') {
    throw new TypeError('escapeCharClass: аргумент должен быть строкой');
  }

  return text
    .replace(/\\/g, '\\\\')  // Экранируем \\
    .replace(/\]/g, '\\]')          // Экранируем ]
    .replace(/\^/g, '\\^')          // Экранируем ^ (только в начале не нужно)
    .replace(/-/g, '\\-');          // Экранируем -
}

/**
 * Безопасное создание regex из строки
 * Экранирует спецсимволы и создаёт RegExp объект
 * 
 * @param {string} pattern - Паттерн
 * @param {string} flags - Флаги regex (опционально)
 * @returns {RegExp|null} RegExp объект или null при ошибке
 * 
 * @example
 * safeRegex('text.+', 'gi') // /text\.\+/gi
 */
export function safeRegex(pattern, flags = '') {
  try {
    const escapedPattern = escapeRegex(pattern);
    return new RegExp(escapedPattern, flags);
  } catch (error) {
    console.error('safeRegex: ошибка создания RegExp', error);
    return null;
  }
}

/**
 * Проверка валидности regex паттерна
 * 
 * @param {string} pattern - Regex паттерн
 * @returns {Object} {valid: boolean, error: string|null}
 * 
 * @example
 * validateRegex('(?:test|demo)') // {valid: true, error: null}
 * validateRegex('(?:unclosed') // {valid: false, error: '...'}
 */
export function validateRegex(pattern) {
  if (typeof pattern !== 'string') {
    return {
      valid: false,
      error: 'Паттерн должен быть строкой'
    };
  }

  try {
    new RegExp(pattern);
    return { valid: true, error: null };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Экспорт списка спецсимволов для использования в других модулях
 */
export { REGEX_SPECIAL_CHARS };
