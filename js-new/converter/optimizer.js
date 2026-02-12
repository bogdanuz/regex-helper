/**
 * RegexHelper v4.0 - Regex Optimizer (Type 1-6)
 * 
 * Модуль для применения оптимизаций regex:
 * - Type 1: Префиксы/суффиксы (dog|dogged|doggy → dog(|ged|gy))
 * - Type 2: Общий корень (test|testing|tester → test(|ing|er))
 * - Type 3: Расстояние .{min,max} (только для linked triggers!)
 * - Type 4: Склонения (стол → стол(|а|у|ом|е|ы|ами|ах))
 * - Type 5: Опциональные символы (ё → [её])
 * - Type 6: Вариации (test → t.e.s.t или точные окончания)
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { escapeRegex } from '../core/utils.js';
import { OPTIMIZERCONFIG } from '../core/config.js';

/**
 * Применяет все выбранные оптимизации к массиву триггеров
 * @param {string[]} triggers - Массив триггеров
 * @param {number[]} types - Массив номеров типов оптимизаций (1-6)
 * @returns {string} - Оптимизированный regex
 * @example
 * applyOptimizations(['dog', 'dogged'], [1]) // 'dog(ged)?'
 */
export function applyOptimizations(triggers, types) {
  if (!Array.isArray(triggers) || triggers.length === 0) return '';
  if (!Array.isArray(types) || types.length === 0) {
    // Без оптимизаций - просто экранируем и объединяем через |
    return triggers.map(t => escapeRegex(t)).join('|');
  }

  let result = [...triggers];

  // Применяем оптимизации по порядку
  if (types.includes(5)) {
    result = result.map(t => applyType5(t));
  }

  if (types.includes(1)) {
    result = [applyType1(result)];
  } else if (types.includes(2)) {
    result = [applyType2(result)];
  } else {
    result = result.map(t => escapeRegex(t));
  }

  if (types.includes(4)) {
    result = result.map(t => applyType4(t));
  }

  if (types.includes(6)) {
    result = result.map(t => applyType6(t));
  }

  return result.join('|');
}

/**
 * Type 1: Оптимизация префиксов/суффиксов
 * Находит общий префикс и выносит различия в группу
 * @param {string[]} triggers - Массив триггеров
 * @returns {string} - Оптимизированный regex
 * @example
 * applyType1(['dog', 'dogged', 'doggy']) // 'dog(|ged|gy)'
 * applyType1(['test', 'testing']) // 'test(|ing)'
 */
export function applyType1(triggers) {
  if (!Array.isArray(triggers) || triggers.length === 0) return '';
  if (triggers.length === 1) return escapeRegex(triggers[0]);

  const commonPrefix = findCommonPrefix(triggers);
  
  if (!commonPrefix || commonPrefix.length === 0) {
    // Нет общего префикса - возвращаем как есть
    return triggers.map(t => escapeRegex(t)).join('|');
  }

  // Получаем суффиксы (то, что после общего префикса)
  const suffixes = triggers.map(t => t.substring(commonPrefix.length));
  
  // Экранируем
  const escapedPrefix = escapeRegex(commonPrefix);
  const escapedSuffixes = suffixes.map(s => escapeRegex(s));

  // Формируем результат: prefix(suffix1|suffix2|...)
  if (escapedSuffixes.length === 1) {
    return escapedPrefix + escapedSuffixes[0];
  }

  return `${escapedPrefix}(${escapedSuffixes.join('|')})`;
}

/**
 * Type 2: Оптимизация общего корня (алиас для Type 1)
 * @param {string[]} triggers - Массив триггеров
 * @returns {string} - Оптимизированный regex
 * @example
 * applyType2(['test', 'testing', 'tester']) // 'test(|ing|er)'
 */
export function applyType2(triggers) {
  return applyType1(triggers);
}

/**
 * Type 3: Расстояние .{min,max} (ТОЛЬКО для linked triggers!)
 * Эта функция НЕ используется в простых триггерах
 * @param {string[]} triggers - Массив триггеров
 * @param {Object} distance - Объект с min и max
 * @returns {string} - Regex с расстоянием
 * @example
 * applyType3(['hello', 'world'], { min: 1, max: 7 }) // 'hello.{1,7}world'
 */
export function applyType3(triggers, distance = { min: 1, max: 7 }) {
  if (!Array.isArray(triggers) || triggers.length < 2) {
    return triggers.map(t => escapeRegex(t)).join('|');
  }

  const { min, max } = distance;
  const escapedTriggers = triggers.map(t => escapeRegex(t));
  
  return escapedTriggers.join(`.{${min},${max}}`);
}

/**
 * Type 4: Склонения (добавляет окончания)
 * @param {string} trigger - Триггер
 * @returns {string} - Regex с окончаниями
 * @example
 * applyType4('стол') // 'стол(|а|у|ом|е|ы|ами|ах)'
 */
export function applyType4(trigger) {
  if (!trigger || typeof trigger !== 'string') return '';

  // Если триггер уже содержит regex-символы - не применяем Type 4
  if (/[.*+?^${}()|[\]\\]/.test(trigger)) {
    return escapeRegex(trigger);
  }

  const endings = OPTIMIZERCONFIG.DECLENSIONENDINGS;
  const escapedTrigger = escapeRegex(trigger);
  const escapedEndings = endings.map(e => escapeRegex(e));

  return `${escapedTrigger}(|${escapedEndings.join('|')})`;
}

/**
 * Type 5: Опциональные символы (ё → [её])
 * Заменяет ё на [её], е на е? (опционально)
 * @param {string} trigger - Триггер
 * @returns {string} - Regex с опциональными символами
 * @example
 * applyType5('ёлка') // '[её]лка'
 * applyType5('всё') // 'вс[её]'
 */
export function applyType5(trigger) {
  if (!trigger || typeof trigger !== 'string') return '';

  let result = '';
  let i = 0;

  while (i < trigger.length) {
    const char = trigger[i];
    const nextChar = trigger[i + 1];

    // Обрабатываем сдвоенные буквы (aa, бб и т.д.)
    if (char === nextChar && /[a-zа-я]/i.test(char)) {
      result += escapeRegex(char) + escapeRegex(char) + '?';
      i += 2;
    } else {
      result += escapeRegex(char);
      i += 1;
    }
  }

  return result;
}

/**
 * Type 6: Вариации (test → t.e.s.t)
 * Разделяет буквы точками (любой символ между буквами)
 * @param {string} trigger - Триггер
 * @returns {string} - Regex с разделением
 * @example
 * applyType6('test') // 't.e.s.t'
 * applyType6('hello') // 'h.e.l.l.o'
 */
export function applyType6(trigger) {
  if (!trigger || typeof trigger !== 'string') return '';

  const chars = trigger.split('').map(c => escapeRegex(c));
  return chars.join('.');
}

/**
 * Type 6 (Wildcard mode): Вариации с опциями (кириллица, латиница, цифры, любой)
 * @param {string} trigger - Триггер
 * @param {Object} options - Опции: { cyrillic, latin, digits, any }
 * @returns {string} - Regex с вариациями
 * @example
 * applyType6Wildcard('test', { latin: true, digits: true }) 
 * // 't[a-z0-9]e[a-z0-9]s[a-z0-9]t'
 */
export function applyType6Wildcard(trigger, options = {}) {
  if (!trigger || typeof trigger !== 'string') return '';

  const { cyrillic = false, latin = false, digits = false, any = false } = options;

  // Если выбран "any" - используем точку
  if (any) {
    return applyType6(trigger);
  }

  // Формируем character class
  let charClass = '';
  if (cyrillic) charClass += 'а-яА-ЯёЁ';
  if (latin) charClass += 'a-zA-Z';
  if (digits) charClass += '0-9';

  if (!charClass) {
    // Если ничего не выбрано - используем точку
    return applyType6(trigger);
  }

  const chars = trigger.split('');
  const result = chars.map((char, index) => {
    // Первый символ оставляем как есть
    if (index === 0) return escapeRegex(char);
    
    // Остальные заменяем на character class
    return `[${charClass}]`;
  });

  return result.join('');
}

/**
 * Type 6 (Exact mode): Точные окончания
 * @param {string} prefix - Префикс (основа слова)
 * @param {string[]} endings - Массив окончаний
 * @returns {string} - Regex с окончаниями
 * @example
 * applyType6Exact('test', ['', 'ing', 'ed', 'er']) 
 * // 'test(|ing|ed|er)'
 */
export function applyType6Exact(prefix, endings) {
  if (!prefix || typeof prefix !== 'string') return '';
  if (!Array.isArray(endings) || endings.length === 0) return escapeRegex(prefix);

  const escapedPrefix = escapeRegex(prefix);
  const escapedEndings = endings.map(e => escapeRegex(e));

  if (escapedEndings.length === 1) {
    return escapedPrefix + escapedEndings[0];
  }

  return `${escapedPrefix}(${escapedEndings.join('|')})`;
}

/**
 * Находит общий префикс у массива строк
 * @param {string[]} strings - Массив строк
 * @returns {string} - Общий префикс
 * @example
 * findCommonPrefix(['test', 'testing', 'tester']) // 'test'
 * findCommonPrefix(['hello', 'world']) // ''
 */
export function findCommonPrefix(strings) {
  if (!Array.isArray(strings) || strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  const sorted = [...strings].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  let i = 0;
  while (i < first.length && first[i] === last[i]) {
    i++;
  }

  return first.substring(0, i);
}

/**
 * Генерирует склонения для русского существительного
 * (простая версия, для полной версии нужна библиотека)
 * @param {string} noun - Существительное
 * @returns {string[]} - Массив склонений
 * @example
 * generateDeclensions('стол') // ['стол', 'стола', 'столу', ...]
 */
export function generateDeclensions(noun) {
  if (!noun || typeof noun !== 'string') return [noun];

  // Простая версия: добавляем стандартные окончания
  const endings = OPTIMIZERCONFIG.DECLENSIONENDINGS;
  return [noun, ...endings.map(e => noun + e)];
}

/**
 * Извлекает общий корень из массива триггеров (алиас для findCommonPrefix)
 * @param {string[]} triggers - Массив триггеров
 * @returns {string} - Общий корень
 * @example
 * extractCommonRoot(['test', 'testing']) // 'test'
 */
export function extractCommonRoot(triggers) {
  return findCommonPrefix(triggers);
}

/**
 * Проверяет, нужна ли оптимизация Type 1/2 для триггеров
 * @param {string[]} triggers - Массив триггеров
 * @returns {boolean} - true, если есть общий префикс длиной >= 3
 * @example
 * shouldApplyPrefixOptimization(['test', 'testing']) // true
 * shouldApplyPrefixOptimization(['hello', 'world']) // false
 */
export function shouldApplyPrefixOptimization(triggers) {
  if (!Array.isArray(triggers) || triggers.length < 2) return false;
  
  const commonPrefix = findCommonPrefix(triggers);
  return commonPrefix.length >= 3;
}

/**
 * Оптимизирует массив триггеров с автоматическим выбором лучшей стратегии
 * @param {string[]} triggers - Массив триггеров
 * @returns {string} - Оптимизированный regex
 * @example
 * autoOptimize(['test', 'testing', 'tester']) // 'test(|ing|er)'
 */
export function autoOptimize(triggers) {
  if (!Array.isArray(triggers) || triggers.length === 0) return '';
  if (triggers.length === 1) return escapeRegex(triggers[0]);

  // Если есть общий префикс - применяем Type 1
  if (shouldApplyPrefixOptimization(triggers)) {
    return applyType1(triggers);
  }

  // Иначе - просто объединяем через |
  return triggers.map(t => escapeRegex(t)).join('|');
}
