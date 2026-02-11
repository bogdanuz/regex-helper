/**
 * RegexHelper v4.0 - Test Suite Chat 1
 * Автотесты для модулей ЧАТ 1 (Core + Converter + UI Modals)
 * @version 2.0 (обновлено под Test Runner v4.0)
 * @date 12.02.2026
 */

import { APPCONFIG, SIMPLETRIGGERSCONFIG, OPTIMIZERCONFIG, ERRORMESSAGES } from '../js-new/core/config.js';
import { escapeRegex, pluralize, isEmpty } from '../js-new/core/utils.js';
import { showToast, logError, clearAllInlineErrors } from '../js-new/core/errors.js';
import { parseSimpleTriggers, replaceYo, getTriggerStats, hasTriggersInText } from '../js-new/converter/parser.js';
import { validateTriggers, validateRegexLength, validateTriggerLength, validateTriggerCount } from '../js-new/converter/validator.js';
import { applyType1, applyType2, applyType5, applyType6, findCommonPrefix } from '../js-new/converter/optimizer.js';
import { openModal, closeModal, showConfirm } from '../js-new/ui/modals.js';

console.log('══════════════════════════════════════════════════');
console.log('RegexHelper v4.0 - Test Suite Chat 1');
console.log('══════════════════════════════════════════════════');

let testResults = { passed: 0, failed: 0, total: 0 };

function test(name, fn) {
    testResults.total++;
    try {
        fn();
        testResults.passed++;
        console.log(`✅ ${testResults.total}. ${name}`);
    } catch (error) {
        testResults.failed++;
        console.log(`❌ ${testResults.total}. ${name}`);
        console.error(`   ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

console.log('\n📦 Suite 1: core/config.js');
test('APPCONFIG.VERSION === "4.0.0"', () => {
    assert(APPCONFIG.VERSION === '4.0.0', `VERSION должен быть "4.0.0", получено: ${APPCONFIG.VERSION}`);
});

test('APPCONFIG.APPNAME === "RegexHelper"', () => {
    assert(APPCONFIG.APPNAME === 'RegexHelper', `APPNAME должен быть "RegexHelper", получено: ${APPCONFIG.APPNAME}`);
});

test('SIMPLETRIGGERSCONFIG.MAXTRIGGERS === 200', () => {
    assert(SIMPLETRIGGERSCONFIG.MAXTRIGGERS === 200, `MAXTRIGGERS должен быть 200, получено: ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS}`);
});

test('SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH === 100', () => {
    assert(SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH === 100, `MAXTRIGGERLENGTH должен быть 100, получено: ${SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH}`);
});

test('OPTIMIZERCONFIG.TYPES.TYPE1 === "prefixes"', () => {
    assert(OPTIMIZERCONFIG.TYPES.TYPE1 === 'prefixes', `TYPE1 должен быть "prefixes", получено: ${OPTIMIZERCONFIG.TYPES.TYPE1}`);
});

test('OPTIMIZERCONFIG.TYPES.TYPE6 === "variations"', () => {
    assert(OPTIMIZERCONFIG.TYPES.TYPE6 === 'variations', `TYPE6 должен быть "variations", получено: ${OPTIMIZERCONFIG.TYPES.TYPE6}`);
});

test('ERRORMESSAGES содержит TOOMANYTRIGGERS', () => {
    assert(ERRORMESSAGES.TOOMANYTRIGGERS.includes('200'), 'TOOMANYTRIGGERS должен содержать "200"');
});

console.log('\n📦 Suite 2: core/utils.js');
test('escapeRegex - точка экранируется', () => {
    assert(escapeRegex('test.') === 'test\\.', `Должно быть "test\\.", получено: ${escapeRegex('test.')}`);
});

test('escapeRegex - звёздочка экранируется', () => {
    assert(escapeRegex('a*b') === 'a\\*b', `Должно быть "a\\*b", получено: ${escapeRegex('a*b')}`);
});

test('escapeRegex - плюс экранируется', () => {
    assert(escapeRegex('a+b') === 'a\\+b', `Должно быть "a\\+b", получено: ${escapeRegex('a+b')}`);
});

test('escapeRegex - вопросительный знак экранируется', () => {
    assert(escapeRegex('a?b') === 'a\\?b', `Должно быть "a\\?b", получено: ${escapeRegex('a?b')}`);
});

test('pluralize - 1 элемент', () => {
    assert(pluralize(1, 'элемент', 'элемента', 'элементов') === '1 элемент', `Должно быть "1 элемент", получено: ${pluralize(1, 'элемент', 'элемента', 'элементов')}`);
});

test('pluralize - 2 элемента', () => {
    assert(pluralize(2, 'элемент', 'элемента', 'элементов') === '2 элемента', `Должно быть "2 элемента", получено: ${pluralize(2, 'элемент', 'элемента', 'элементов')}`);
});

test('pluralize - 5 элементов', () => {
    assert(pluralize(5, 'элемент', 'элемента', 'элементов') === '5 элементов', `Должно быть "5 элементов", получено: ${pluralize(5, 'элемент', 'элемента', 'элементов')}`);
});

test('isEmpty - пустая строка', () => {
    assert(isEmpty('') === true, `isEmpty('') должен вернуть true`);
});

console.log('\n📦 Suite 3: core/errors.js');
test('showToast - функция экспортирована', () => {
    assert(typeof showToast === 'function', 'showToast должна быть функцией');
});

test('logError - функция экспортирована', () => {
    assert(typeof logError === 'function', 'logError должна быть функцией');
});

test('clearAllInlineErrors - функция экспортирована', () => {
    assert(typeof clearAllInlineErrors === 'function', 'clearAllInlineErrors должна быть функцией');
});

console.log('\n📦 Suite 4: converter/parser.js');
test('parseSimpleTriggers - возвращает массив', () => {
    const result = parseSimpleTriggers(['тест']);
    assert(Array.isArray(result), 'parseSimpleTriggers должен возвращать массив');
});

test('parseSimpleTriggers - парсит 3 триггера', () => {
    const result = parseSimpleTriggers(['тест1', 'тест2', 'тест3']);
    assert(result.length === 3, `Должно быть 3 триггера, получено: ${result.length}`);
});

test('parseSimpleTriggers - экранирует спецсимволы', () => {
    const result = parseSimpleTriggers(['тест.']);
    assert(result.includes('тест\\.'), 'Должно экранировать точку');
});

test('replaceYo - заменяет ё на [её]', () => {
    assert(replaceYo('ёлка') === '[её]лка', `Должно быть "[её]лка", получено: ${replaceYo('ёлка')}`);
});

test('replaceYo - заменяет Ё на [ЁЕ]', () => {
    assert(replaceYo('Ёлка') === '[ЁЕ]лка', `Должно быть "[ЁЕ]лка", получено: ${replaceYo('Ёлка')}`);
});

test('replaceYo - оставляет без изменений', () => {
    assert(replaceYo('тест') === 'тест', `Должно быть "тест", получено: ${replaceYo('тест')}`);
});

test('getTriggerStats - count === 3', () => {
    const stats = getTriggerStats(['тест1', 'тест2', 'тест3']);
    assert(stats.count === 3, `count должен быть 3, получено: ${stats.count}`);
});

test('getTriggerStats - duplicatesCount === 1', () => {
    const stats = getTriggerStats(['тест', 'тест', 'тест2']);
    assert(stats.duplicatesCount === 1, `duplicatesCount должен быть 1, получено: ${stats.duplicatesCount}`);
});

test('hasTriggersInText - true', () => {
    assert(hasTriggersInText('тест') === true, 'hasTriggersInText должен вернуть true');
});

test('hasTriggersInText - false', () => {
    assert(hasTriggersInText('   ') === false, 'hasTriggersInText должен вернуть false');
});

console.log('\n📦 Suite 5: converter/validator.js');
test('validateTriggers - пустой массив', () => {
    assert(validateTriggers([]) === true, 'validateTriggers([]) должен вернуть true');
});

test('validateTriggers - null', () => {
    assert(validateTriggers(null) === false, 'validateTriggers(null) должен вернуть false');
});

test('validateRegexLength - короткий regex', () => {
    assert(validateRegexLength('test') === true, 'validateRegexLength("test") должен вернуть true');
});

test('validateRegexLength - длинный regex', () => {
    assert(validateRegexLength('a'.repeat(10001)) === false, 'validateRegexLength(10001 символ) должен вернуть false');
});

test('validateTriggerLength - корректная длина', () => {
    assert(validateTriggerLength('тест') === true, 'validateTriggerLength("тест") должен вернуть true');
});

test('validateTriggerCount - 150 триггеров', () => {
    assert(validateTriggerCount(150) === true, 'validateTriggerCount(150) должен вернуть true');
});

test('validateTriggerCount - 250 триггеров', () => {
    assert(validateTriggerCount(250) === false, 'validateTriggerCount(250) должен вернуть false');
});

console.log('\n📦 Suite 6: converter/optimizer.js');
test('applyType1 - добавляет [дД]?', () => {
    const result = applyType1(['дом']);
    assert(result.includes('[дД]'), 'Должно содержать [дД]');
});

test('applyType1 - добавляет [оО]?', () => {
    const result = applyType1(['дом']);
    assert(result.includes('[оО]'), 'Должно содержать [оО]');
});

test('applyType1 - добавляет [мМ]?', () => {
    const result = applyType1(['дом']);
    assert(result.includes('[мМ]'), 'Должно содержать [мМ]');
});

test('applyType2 - добавляет склонения', () => {
    const result = applyType2(['дом'], 'мужской');
    assert(result.includes('дом'), 'Должно содержать "дом"');
});

test('applyType5 - добавляет \'?', () => {
    const result = applyType5(['дом']);
    assert(result.includes('\'?'), 'Должно содержать \'?');
});

test('applyType6 - t.e.s.t', () => {
    assert(applyType6('test') === 't.e.s.t', `Должно быть "t.e.s.t", получено: ${applyType6('test')}`);
});

test('findCommonPrefix - находит общий префикс', () => {
    assert(findCommonPrefix(['тест1', 'тест2', 'тест3']) === 'тест', `Должно быть "тест", получено: ${findCommonPrefix(['тест1', 'тест2', 'тест3'])}`);
});

console.log('\n📦 Suite 7: ui/modals.js');
test('openModal - функция экспортирована', () => {
    assert(typeof openModal === 'function', 'openModal должна быть функцией');
});

test('closeModal - функция экспортирована', () => {
    assert(typeof closeModal === 'function', 'closeModal должна быть функцией');
});

test('showConfirm - функция экспортирована', () => {
    assert(typeof showConfirm === 'function', 'showConfirm должна быть функцией');
});

console.log('\n══════════════════════════════════════════════════');
console.log('РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
console.log('══════════════════════════════════════════════════');
console.log(`✅ Пройдено: ${testResults.passed}/${testResults.total}`);
console.log(`❌ Провалено: ${testResults.failed}/${testResults.total}`);
console.log(`📊 Pass Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
console.log('══════════════════════════════════════════════════');

if (testResults.failed === 0) {
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
} else {
    console.log(`⚠️ ПРОВАЛЕНО: ${testResults.failed} тестов`);
}

console.log('══════════════════════════════════════════════════');
