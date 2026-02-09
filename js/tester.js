/**
 * ============================================
 * ТЕСТЕР REGEX
 * ============================================
 * 
 * Тестирование регулярных выражений на текстовых данных:
 * - Real-time проверка regex
 * - Подсветка совпадений
 * - Подсчет количества совпадений
 * - Список всех найденных совпадений
 * 
 * Зависимости: utils.js
 */

// ============================================
// КОНСТАНТЫ
// ============================================

const TESTER_CONFIG = {
    AUTO_TEST_DELAY: 500, // Задержка перед автотестированием (мс)
    MAX_MATCHES_DISPLAY: 100, // Максимум совпадений для отображения
    MAX_MATCH_LENGTH: 100 // Максимальная длина одного совпадения
};

// ============================================
// STATE
// ============================================

let testDebounceTimer = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Инициализация тестера
 */
function initTester() {
    console.log('[Tester] Инициализация...');
    
    // ИСПРАВЛЕНО: result → resultRegex
    const resultTextarea = document.getElementById('resultRegex');
    
    if (resultTextarea) {
        resultTextarea.addEventListener('input', debouncedTest);
    }

        // Закрытие панели тестера
        if (closeTesterBtn) {
            closeTesterBtn.addEventListener('click', hideTester);
        }

        console.log('✓ Тестер инициализирован');
    } catch (error) {
        console.error('Ошибка initTester:', error);
    }
}

// ============================================
// ПОКАЗ/СКРЫТИЕ ТЕСТЕРА
// ============================================

/**
 * Показать панель тестера
 */
function showTester() {
    const panel = document.getElementById('testerPanel');
    if (panel) {
        panel.style.display = 'block';
        
        // Прокрутка к панели
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Фокус на поле теста
        const testText = document.getElementById('testText');
        if (testText) {
            setTimeout(() => testText.focus(), 300);
        }
        
        // Запуск тестирования если есть данные
        runTest();
    }
}

/**
 * Скрыть панель тестера
 */
function hideTester() {
    const panel = document.getElementById('testerPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

/**
 * Переключить видимость тестера
 */
function toggleTester() {
    const panel = document.getElementById('testerPanel');
    if (panel) {
        if (panel.style.display === 'none') {
            showTester();
        } else {
            hideTester();
        }
    }
}

// ============================================
// ТЕСТИРОВАНИЕ
// ============================================

/**
 * Отложенное тестирование (debounce)
 */
function debouncedTest() {
    if (testDebounceTimer) {
        clearTimeout(testDebounceTimer);
    }
    
    testDebounceTimer = setTimeout(() => {
        runTest();
    }, TESTER_CONFIG.AUTO_TEST_DELAY);
}

/**
 * Запуск тестирования
 */
function runTest() {
    try {
        const resultTextarea = document.getElementById('result');
        const testText = document.getElementById('testText');
        const testResults = document.getElementById('testResults');
        const testEmpty = document.getElementById('testEmpty');

        if (!resultTextarea || !testText || !testResults || !testEmpty) {
            return;
        }

        const regex = resultTextarea.value.trim();
        const text = testText.value;

        // Если нет текста для теста
        if (!text) {
            testResults.style.display = 'none';
            testEmpty.style.display = 'block';
            return;
        }

        // Если нет regex
        if (!regex) {
            testResults.style.display = 'none';
            testEmpty.style.display = 'block';
            return;
        }

        // Проверка валидности regex
        let regexObj;
        try {
            regexObj = new RegExp(regex, 'gi'); // g = global, i = case insensitive
        } catch (error) {
            showTestError('Некорректное регулярное выражение');
            return;
        }

        // Поиск совпадений
        const matches = [];
        let match;
        
        while ((match = regexObj.exec(text)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
                length: match[0].length
            });
            
            // Защита от бесконечного цикла (пустые совпадения)
            if (match.index === regexObj.lastIndex) {
                regexObj.lastIndex++;
            }
            
            // Лимит совпадений
            if (matches.length >= TESTER_CONFIG.MAX_MATCHES_DISPLAY) {
                break;
            }
        }

        // Отображение результатов
        displayTestResults(text, matches, regex);

    } catch (error) {
        console.error('Ошибка runTest:', error);
        showTestError('Ошибка тестирования');
    }
}

/**
 * Отображение результатов тестирования
 * @param {string} text - Исходный текст
 * @param {Array} matches - Массив совпадений
 * @param {string} regex - Регулярное выражение
 */
function displayTestResults(text, matches, regex) {
    const testResults = document.getElementById('testResults');
    const testEmpty = document.getElementById('testEmpty');
    const matchCount = document.getElementById('matchCount');
    const testHighlight = document.getElementById('testHighlight');
    const testMatchesContainer = document.getElementById('testMatchesContainer');
    const testMatchesList = document.getElementById('testMatchesList');

    // Показать панель результатов
    testResults.style.display = 'block';
    testEmpty.style.display = 'none';

    // Обновить счетчик
    if (matchCount) {
        matchCount.textContent = matches.length;
        matchCount.style.color = matches.length > 0 ? '#4CAF50' : '#F44336';
    }

    // Создать текст с подсветкой
    if (testHighlight) {
        testHighlight.innerHTML = highlightMatches(text, matches);
    }

    // Показать список совпадений
    if (matches.length > 0 && testMatchesContainer && testMatchesList) {
        testMatchesContainer.style.display = 'block';
        testMatchesList.innerHTML = matches.map((match, index) => {
            const truncatedText = match.text.length > TESTER_CONFIG.MAX_MATCH_LENGTH
                ? match.text.substring(0, TESTER_CONFIG.MAX_MATCH_LENGTH) + '...'
                : match.text;
            
            return `
                <div class="test-match-item">
                    <span class="test-match-text">${escapeHTML(truncatedText)}</span>
                    <span class="test-match-position">позиция: ${match.index}</span>
                </div>
            `;
        }).join('');
    } else if (testMatchesContainer) {
        testMatchesContainer.style.display = 'none';
    }
}

/**
 * Подсветка совпадений в тексте
 * @param {string} text - Исходный текст
 * @param {Array} matches - Массив совпадений
 * @returns {string} HTML с подсветкой
 */
function highlightMatches(text, matches) {
    if (matches.length === 0) {
        return escapeHTML(text);
    }

    // Сортировка по позиции
    const sortedMatches = matches.slice().sort((a, b) => a.index - b.index);

    let result = '';
    let lastIndex = 0;

    sortedMatches.forEach(match => {
        // Текст до совпадения
        result += escapeHTML(text.substring(lastIndex, match.index));
        
        // Само совпадение (с подсветкой)
        result += `<span class="test-match">${escapeHTML(match.text)}</span>`;
        
        lastIndex = match.index + match.length;
    });

    // Остаток текста
    result += escapeHTML(text.substring(lastIndex));

    return result;
}

/**
 * Показать ошибку тестирования
 * @param {string} message - Сообщение об ошибке
 */
function showTestError(message) {
    const testResults = document.getElementById('testResults');
    const testEmpty = document.getElementById('testEmpty');
    const testHighlight = document.getElementById('testHighlight');

    if (testResults) {
        testResults.style.display = 'block';
    }
    
    if (testEmpty) {
        testEmpty.style.display = 'none';
    }

    if (testHighlight) {
        testHighlight.innerHTML = `
            <div style="color: #F44336; font-weight: 600;">
                ⚠️ ${escapeHTML(message)}
            </div>
        `;
    }
}

// ============================================
// ЭКСПОРТ
// ============================================

window.initTester = initTester;
window.showTester = showTester;
window.hideTester = hideTester;
window.toggleTester = toggleTester;
window.runTest = runTest;

console.log('✓ Модуль tester.js загружен');
