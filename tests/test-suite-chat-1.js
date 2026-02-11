/**
 * RegexHelper v4.0 - Test Suite Chat 1
 * Тесты для модулей: core + converter + ui/modals
 * Адаптировано для TestRunner
 * @version 1.0
 * @date 11.02.2026
 */

(function() {
    'use strict';

    if (typeof TestRunner === 'undefined') {
        console.error('❌ TestRunner не найден! Загрузите test-runner.js');
        return;
    }

    const runner = window.testRunner;

    // =====================================================================
    // SUITE 1: CORE/CONFIG.JS (7 тестов)
    // =====================================================================
    runner.registerSuite({
        name: '1. core/config.js - Конфигурация',
        tests: [
            {
                name: 'APPCONFIG.VERSION должен быть 4.0.0',
                fn: async function() {
                    const { APPCONFIG } = await import('../js-new/core/config.js');
                    Assert.equals(APPCONFIG.VERSION, '4.0.0', 'VERSION должен быть 4.0.0');
                }
            },
            {
                name: 'APPCONFIG.APPNAME должен быть RegexHelper',
                fn: async function() {
                    const { APPCONFIG } = await import('../js-new/core/config.js');
                    Assert.equals(APPCONFIG.APPNAME, 'RegexHelper', 'APPNAME должен быть RegexHelper');
                }
            },
            {
                name: 'SIMPLETRIGGERSCONFIG.MAXTRIGGERS должен быть 200',
                fn: async function() {
                    const { SIMPLETRIGGERSCONFIG } = await import('../js-new/core/config.js');
                    Assert.equals(SIMPLETRIGGERSCONFIG.MAXTRIGGERS, 200, 'MAXTRIGGERS должен быть 200');
                }
            },
            {
                name: 'SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH должен быть 100',
                fn: async function() {
                    const { SIMPLETRIGGERSCONFIG } = await import('../js-new/core/config.js');
                    Assert.equals(SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH, 100, 'MAXTRIGGERLENGTH должен быть 100');
                }
            },
            {
                name: 'OPTIMIZERCONFIG.TYPES.TYPE1 должен быть prefixes',
                fn: async function() {
                    const { OPTIMIZERCONFIG } = await import('../js-new/core/config.js');
                    Assert.equals(OPTIMIZERCONFIG.TYPES.TYPE1, 'prefixes', 'TYPE1 должен быть prefixes');
                }
            },
            {
                name: 'OPTIMIZERCONFIG.TYPES.TYPE6 должен быть variations',
                fn: async function() {
                    const { OPTIMIZERCONFIG } = await import('../js-new/core/config.js');
                    Assert.equals(OPTIMIZERCONFIG.TYPES.TYPE6, 'variations', 'TYPE6 должен быть variations');
                }
            },
            {
                name: 'ERRORMESSAGES должны содержать правильные сообщения',
                fn: async function() {
                    const { ERRORMESSAGES } = await import('../js-new/core/config.js');
                    Assert.contains(ERRORMESSAGES.TOOMANYTRIGGERS, '200', 'Должно содержать 200');
                }
            }
        ]
    });

    // =====================================================================
    // SUITE 2: CORE/UTILS.JS (13 тестов) - КРИТИЧЕСКИЙ!
    // =====================================================================
    runner.registerSuite({
        name: '2. core/utils.js - Утилиты (КРИТИЧЕСКИЙ escapeRegex)',
        tests: [
            {
                name: 'escapeRegex - экранирование точки',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('test.'), 'test\\.', 'Точка должна экранироваться');
                }
            },
            {
                name: 'escapeRegex - экранирование плюса',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('a+b'), 'a\\+b', 'Плюс должен экранироваться');
                }
            },
            {
                name: 'escapeRegex - экранирование звезды',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('a*b'), 'a\\*b', 'Звезда должна экранироваться');
                }
            },
            {
                name: 'escapeRegex - экранирование вопроса',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('a?b'), 'a\\?b', 'Вопрос должен экранироваться');
                }
            },
            {
                name: 'escapeRegex - экранирование трубы',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('a|b'), 'a\\|b', 'Труба должна экранироваться');
                }
            },
            {
                name: 'escapeRegex - экранирование квадратных скобок',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('a[b]'), 'a\\[b\\]', 'Скобки должны экранироваться');
                }
            },
            {
                name: 'escapeRegex - экранирование обратного слэша',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex('a\\b'), 'a\\\\b', 'Слэш должен экранироваться');
                }
            },
            {
                name: 'escapeRegex - пустая строка',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex(''), '', 'Пустая строка должна вернуть пустую');
                }
            },
            {
                name: 'escapeRegex - null должен вернуть пустую строку',
                fn: async function() {
                    const { escapeRegex } = await import('../js-new/core/utils.js');
                    Assert.equals(escapeRegex(null), '', 'null должен вернуть пустую строку');
                }
            },
            {
                name: 'pluralize - форма для 1',
                fn: async function() {
                    const { pluralize } = await import('../js-new/core/utils.js');
                    Assert.equals(pluralize(1, ['триггер', 'триггера', 'триггеров']), 'триггер', 'Для 1 должна быть форма триггер');
                }
            },
            {
                name: 'pluralize - форма для 2',
                fn: async function() {
                    const { pluralize } = await import('../js-new/core/utils.js');
                    Assert.equals(pluralize(2, ['триггер', 'триггера', 'триггеров']), 'триггера', 'Для 2 должна быть форма триггера');
                }
            },
            {
                name: 'pluralize - форма для 5',
                fn: async function() {
                    const { pluralize } = await import('../js-new/core/utils.js');
                    Assert.equals(pluralize(5, ['триггер', 'триггера', 'триггеров']), 'триггеров', 'Для 5 должна быть форма триггеров');
                }
            },
            {
                name: 'isEmpty - проверка пустой строки',
                fn: async function() {
                    const { isEmpty } = await import('../js-new/core/utils.js');
                    Assert.equals(isEmpty(''), true, 'Пустая строка должна вернуть true');
                }
            }
        ]
    });

    // =====================================================================
    // SUITE 3: CORE/ERRORS.JS (3 теста)
    // =====================================================================
    runner.registerSuite({
        name: '3. core/errors.js - Обработка ошибок',
        tests: [
            {
                name: 'showToast - функция существует',
                fn: async function() {
                    const { showToast } = await import('../js-new/core/errors.js');
                    Assert.equals(typeof showToast, 'function', 'showToast должна быть функцией');
                }
            },
            {
                name: 'logError - функция существует',
                fn: async function() {
                    const { logError } = await import('../js-new/core/errors.js');
                    Assert.equals(typeof logError, 'function', 'logError должна быть функцией');
                }
            },
            {
                name: 'clearAllInlineErrors - функция существует',
                fn: async function() {
                    const { clearAllInlineErrors } = await import('../js-new/core/errors.js');
                    Assert.equals(typeof clearAllInlineErrors, 'function', 'clearAllInlineErrors должна быть функцией');
                }
            }
        ]
    });

    // =====================================================================
    // SUITE 4: CONVERTER/PARSER.JS (10 тестов)
    // =====================================================================
    runner.registerSuite({
        name: '4. converter/parser.js - Парсинг триггеров',
        tests: [
            {
                name: 'parseSimpleTriggers - возвращает массив',
                fn: async function() {
                    const { parseSimpleTriggers } = await import('../js-new/converter/parser.js');
                    const result = parseSimpleTriggers('яблоко\nгруша\n  банан  ');
                    Assert.truthy(Array.isArray(result), 'Должен вернуть массив');
                }
            },
            {
                name: 'parseSimpleTriggers - парсит 3 триггера',
                fn: async function() {
                    const { parseSimpleTriggers } = await import('../js-new/converter/parser.js');
                    const result = parseSimpleTriggers('яблоко\nгруша\n  банан  ');
                    Assert.equals(result.length, 3, 'Должно быть 3 триггера');
                }
            },
            {
                name: 'parseSimpleTriggers - содержит триггер яблоко',
                fn: async function() {
                    const { parseSimpleTriggers } = await import('../js-new/converter/parser.js');
                    const result = parseSimpleTriggers('яблоко\nгруша\n  банан  ');
                    Assert.contains(result, 'яблоко', 'Должен содержать яблоко');
                }
            },
            {
                name: 'replaceYo - замена ё на е',
                fn: async function() {
                    const { replaceYo } = await import('../js-new/converter/parser.js');
                    Assert.equals(replaceYo('ёлка'), 'елка', 'ё должна заменяться на е');
                }
            },
            {
                name: 'replaceYo - замена Ё на Е',
                fn: async function() {
                    const { replaceYo } = await import('../js-new/converter/parser.js');
                    Assert.equals(replaceYo('ЁЖИК'), 'ЕЖИК', 'Ё должна заменяться на Е');
                }
            },
            {
                name: 'replaceYo - сохранение регистра',
                fn: async function() {
                    const { replaceYo } = await import('../js-new/converter/parser.js');
                    Assert.equals(replaceYo('Берёза'), 'Береза', 'Регистр должен сохраняться');
                }
            },
            {
                name: 'getTriggerStats - подсчёт триггеров',
                fn: async function() {
                    const { getTriggerStats } = await import('../js-new/converter/parser.js');
                    const stats = getTriggerStats('яблоко\nгруша\nяблоко');
                    Assert.equals(stats.count, 3, 'count должен быть 3');
                }
            },
            {
                name: 'getTriggerStats - подсчёт дубликатов',
                fn: async function() {
                    const { getTriggerStats } = await import('../js-new/converter/parser.js');
                    const stats = getTriggerStats('яблоко\nгруша\nяблоко');
                    Assert.equals(stats.duplicatesCount, 1, 'duplicatesCount должен быть 1');
                }
            },
            {
                name: 'hasTriggersInText - true для текста с триггерами',
                fn: async function() {
                    const { hasTriggersInText } = await import('../js-new/converter/parser.js');
                    Assert.equals(hasTriggersInText('яблоко'), true, 'Должен вернуть true');
                }
            },
            {
                name: 'hasTriggersInText - false для пустого текста',
                fn: async function() {
                    const { hasTriggersInText } = await import('../js-new/converter/parser.js');
                    Assert.equals(hasTriggersInText('   \n   '), false, 'Должен вернуть false');
                }
            }
        ]
    });

    // =====================================================================
    // SUITE 5: CONVERTER/VALIDATOR.JS (7 тестов)
    // =====================================================================
    runner.registerSuite({
        name: '5. converter/validator.js - Валидация',
        tests: [
            {
                name: 'validateTriggers - валидный массив',
                fn: async function() {
                    const { validateTriggers } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateTriggers(['яблоко', 'груша']), true, 'Должен быть валидным');
                }
            },
            {
                name: 'validateTriggers - пустой массив невалиден',
                fn: async function() {
                    const { validateTriggers } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateTriggers([]), false, 'Пустой массив должен быть невалидным');
                }
            },
            {
                name: 'validateRegexLength - короткий regex валиден',
                fn: async function() {
                    const { validateRegexLength } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateRegexLength('test'), true, 'Короткий regex должен быть валидным');
                }
            },
            {
                name: 'validateRegexLength - длинный regex невалиден',
                fn: async function() {
                    const { validateRegexLength } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateRegexLength('a'.repeat(10001)), false, 'Длинный regex должен быть невалидным');
                }
            },
            {
                name: 'validateTriggerLength - нормальная длина',
                fn: async function() {
                    const { validateTriggerLength } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateTriggerLength('яблоко'), true, 'Нормальная длина должна быть валидной');
                }
            },
            {
                name: 'validateTriggerCount - 150 триггеров валидно',
                fn: async function() {
                    const { validateTriggerCount } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateTriggerCount(150), true, '150 должно быть валидным');
                }
            },
            {
                name: 'validateTriggerCount - 250 триггеров невалидно',
                fn: async function() {
                    const { validateTriggerCount } = await import('../js-new/converter/validator.js');
                    Assert.equals(validateTriggerCount(250), false, '250 должно быть невалидным');
                }
            }
        ]
    });

    // =====================================================================
    // SUITE 6: CONVERTER/OPTIMIZER.JS (7 тестов)
    // =====================================================================
    runner.registerSuite({
        name: '6. converter/optimizer.js - Оптимизации',
        tests: [
            {
                name: 'applyType1 - латиница д/d',
    fn: async function() {
        const { applyType1 } = await import('../js-new/converter/optimizer.js');
        const result = applyType1('дом');
        
        // ← ДОБАВЬ ЭТИ 3 СТРОКИ:
        console.log('🔍 DEBUG applyType1("дом"):', result);
        console.log('🔍 Содержит [дd]?', result.includes('[дd]'));
        console.log('🔍 Содержит [dд]?', result.includes('[dд]'));
        
        Assert.contains(result, '[дd]', 'Должно содержать [дd]');
                }
            },
            {
                name: 'applyType1 - латиница о/o',
                fn: async function() {
                    const { applyType1 } = await import('../js-new/converter/optimizer.js');
                    const result = applyType1('дом');
                    Assert.contains(result, '[оo]', 'Должно содержать [оo]');
                }
            },
            {
                name: 'applyType1 - латиница м/m',
                fn: async function() {
                    const { applyType1 } = await import('../js-new/converter/optimizer.js');
                    const result = applyType1('дом');
                    Assert.contains(result, '[мm]', 'Должно содержать [мm]');
                }
            },
            {
                name: 'applyType2 - общий корень',
                fn: async function() {
                    const { applyType2 } = await import('../js-new/converter/optimizer.js');
                    const result = applyType2(['тест', 'тестер']);
                    Assert.contains(result, 'тест', 'Должно содержать корень тест');
                }
            },
            {
                name: 'applyType5 - удвоенные буквы',
                fn: async function() {
                    const { applyType5 } = await import('../js-new/converter/optimizer.js');
                    const result = applyType5('аллея');
                    Assert.contains(result, 'л?', 'Должно содержать л?');
                }
            },
            {
                name: 'applyType6 - точки между буквами',
                fn: async function() {
                    const { applyType6 } = await import('../js-new/converter/optimizer.js');
                    Assert.equals(applyType6('test'), 't.e.s.t', 'Должно быть t.e.s.t');
                }
            },
            {
                name: 'findCommonPrefix - поиск общего префикса',
                fn: async function() {
                    const { findCommonPrefix } = await import('../js-new/converter/optimizer.js');
                    Assert.equals(findCommonPrefix(['тест', 'тестер', 'тестирование']), 'тест', 'Префикс должен быть тест');
                }
            }
        ]
    });

    // =====================================================================
    // SUITE 7: UI/MODALS.JS (3 теста)
    // =====================================================================
    runner.registerSuite({
        name: '7. ui/modals.js - Модальные окна',
        tests: [
            {
                name: 'openModal - функция существует',
                fn: async function() {
                    const { openModal } = await import('../js-new/ui/modals.js');
                    Assert.equals(typeof openModal, 'function', 'openModal должна быть функцией');
                }
            },
            {
                name: 'closeModal - функция существует',
                fn: async function() {
                    const { closeModal } = await import('../js-new/ui/modals.js');
                    Assert.equals(typeof closeModal, 'function', 'closeModal должна быть функцией');
                }
            },
            {
                name: 'showConfirm - функция существует',
                fn: async function() {
                    const { showConfirm } = await import('../js-new/ui/modals.js');
                    Assert.equals(typeof showConfirm, 'function', 'showConfirm должна быть функцией');
                }
            }
        ]
    });

    console.log('✅ Test Suite Chat 1 загружен (7 блоков, 50 тестов)');

})();
