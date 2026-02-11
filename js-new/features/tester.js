/**
 * RegexHelper v4.0 - Features Tester
 * Real-time тестирование regex
 * @version 1.0
 * @date 12.02.2026
 */

import { debounce } from '../core/utils.js';
import { showToast, showInlineError, clearInlineError } from '../core/errors.js';
import { TESTERCONFIG } from '../core/config.js';

let testerVisible = false;

/**
 * Инициализирует тестер
 * @example
 * initTester();
 */
export function initTester() {
    const testBtn = document.getElementById('testRegexBtn');
    
    if (testBtn) {
        testBtn.addEventListener('click', toggleTester);
    }
    
    const testTextarea = document.getElementById('testText');
    const regexInput = document.getElementById('testRegexInput');
    
    if (testTextarea && regexInput) {
        const debouncedTest = debounce(() => {
            runTest(regexInput.value, testTextarea.value);
        }, TESTERCONFIG.DEBOUNCEDELAY);
        
        testTextarea.addEventListener('input', debouncedTest);
        regexInput.addEventListener('input', debouncedTest);
    }
}

/**
 * Показывает панель тестера
 * @example
 * showTester();
 */
export function showTester() {
    const panel = document.getElementById('testerPanel');
    
    if (!panel) {
        return;
    }
    
    panel.style.display = 'block';
    testerVisible = true;
    
    const regexTextarea = document.getElementById('regexResult');
    const regexInput = document.getElementById('testRegexInput');
    
    if (regexTextarea && regexInput) {
        regexInput.value = regexTextarea.value;
    }
}

/**
 * Скрывает панель тестера
 * @example
 * hideTester();
 */
export function hideTester() {
    const panel = document.getElementById('testerPanel');
    
    if (!panel) {
        return;
    }
    
    panel.style.display = 'none';
    testerVisible = false;
}

/**
 * Переключает видимость тестера
 * @example
 * toggleTester();
 */
export function toggleTester() {
    if (testerVisible) {
        hideTester();
    } else {
        showTester();
    }
}

/**
 * Запускает тест regex
 * @param {string} regex - Regex для тестирования
 * @param {string} text - Текст для теста
 * @example
 * runTest('test|testing', 'this is a test');
 */
export function runTest(regex, text) {
    if (!regex || !text) {
        clearTestResults();
        return;
    }
    
    try {
        const regexObj = new RegExp(regex, 'gi');
        const matches = [];
        let match;
        
        while ((match = regexObj.exec(text)) !== null && matches.length < TESTERCONFIG.MAXMATCHES) {
            matches.push({
                value: match[0],
                index: match.index,
                length: match[0].length
            });
        }
        
        displayTestResults(matches);
        highlightMatches(text, matches);
        clearInlineError('testRegexInput');
    } catch (error) {
        showTestError(error.message);
    }
}

/**
 * Запускает тест с debounce
 * @param {string} regex - Regex
 * @param {string} text - Текст
 * @example
 * debouncedTest('test', 'testing');
 */
export function debouncedTest(regex, text) {
    const debouncedFn = debounce(() => runTest(regex, text), TESTERCONFIG.DEBOUNCEDELAY);
    debouncedFn();
}

/**
 * Отображает результаты теста
 * @param {Array} matches - Массив совпадений
 * @example
 * displayTestResults(matches);
 */
export function displayTestResults(matches) {
    const resultsEl = document.getElementById('testResults');
    
    if (!resultsEl) {
        return;
    }
    
    if (matches.length === 0) {
        resultsEl.innerHTML = '<p class="text-muted">Совпадений не найдено</p>';
        return;
    }
    
    const limit = matches.length >= TESTERCONFIG.MAXMATCHES ? ` (показано первых ${TESTERCONFIG.MAXMATCHES})` : '';
    
    resultsEl.innerHTML = `
        <div class="test-stats">
            <strong>Найдено совпадений:</strong> ${matches.length}${limit}
        </div>
        <div class="test-matches">
            ${matches.slice(0, 20).map((m, i) => `
                <div class="match-item">
                    <span class="match-index">${i + 1}.</span>
                    <span class="match-value">${m.value}</span>
                    <span class="match-position">позиция: ${m.index}</span>
                </div>
            `).join('')}
            ${matches.length > 20 ? '<p class="text-muted">... и ещё ' + (matches.length - 20) + '</p>' : ''}
        </div>
    `;
}

/**
 * Подсвечивает совпадения в тексте
 * @param {string} text - Исходный текст
 * @param {Array} matches - Массив совпадений
 * @example
 * highlightMatches('test text', matches);
 */
export function highlightMatches(text, matches) {
    const highlightEl = document.getElementById('testTextHighlight');
    
    if (!highlightEl) {
        return;
    }
    
    if (matches.length === 0) {
        highlightEl.innerHTML = text;
        return;
    }
    
    let result = '';
    let lastIndex = 0;
    
    matches.forEach(match => {
        result += text.substring(lastIndex, match.index);
        result += `<mark style="background-color: #${TESTERCONFIG.HIGHLIGHTCOLOR}">${match.value}</mark>`;
        lastIndex = match.index + match.length;
    });
    
    result += text.substring(lastIndex);
    highlightEl.innerHTML = result;
}

/**
 * Показывает ошибку regex
 * @param {string} error - Сообщение об ошибке
 * @example
 * showTestError('Invalid regex');
 */
export function showTestError(error) {
    showInlineError('testRegexInput', `Ошибка regex: ${error}`);
    clearTestResults();
}

/**
 * Парсит элементы character class
 * @param {Array} matches - Совпадения
 * @returns {Array} - Распарсенные элементы
 * @example
 * parseCharClassItems(matches);
 */
export function parseCharClassItems(matches) {
    return matches.map(m => m.value);
}

function clearTestResults() {
    const resultsEl = document.getElementById('testResults');
    const highlightEl = document.getElementById('testTextHighlight');
    
    if (resultsEl) {
        resultsEl.innerHTML = '';
    }
    
    if (highlightEl) {
        highlightEl.innerHTML = '';
    }
}
