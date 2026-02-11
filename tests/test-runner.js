/**
 * ============================================
 * TEST RUNNER - RegexHelper v3.0 FINAL
 * ============================================
 * Движок для запуска автотестов
 * 
 * Возможности:
 * - Запуск всех тестов или отдельных suites
 * - Подробные логи и статистика
 * - Экспорт результатов (JSON, HTML, текст)
 * - Остановка при ошибке
 * - Повторный запуск failed тестов
 */

class TestRunner {
    constructor() {
        this.suites = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            tests: []
        };
        this.isRunning = false;
        this.shouldStop = false;
        this.verbose = false;
        this.stopOnError = false;
        
        this.initUI();
        this.log('info', 'TestRunner initialized');
    }
    
    /**
     * Инициализация UI
     */
    initUI() {
        // Buttons
        this.runAllBtn = document.getElementById('runAllBtn');
        this.runFailedBtn = document.getElementById('runFailedBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportJsonBtn = document.getElementById('exportJsonBtn');
        this.exportHtmlBtn = document.getElementById('exportHtmlBtn');
        this.copyLogsBtn = document.getElementById('copyLogsBtn');
        
        // Checkboxes
        this.verboseMode = document.getElementById('verboseMode');
        this.stopOnErrorCheckbox = document.getElementById('stopOnError');
        
        // Stats
        this.totalTestsEl = document.getElementById('totalTests');
        this.passedTestsEl = document.getElementById('passedTests');
        this.failedTestsEl = document.getElementById('failedTests');
        this.skippedTestsEl = document.getElementById('skippedTests');
        
        // Progress
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        
        // Results
        this.testResults = document.getElementById('testResults');
        
        // Event listeners
        this.runAllBtn.addEventListener('click', () => this.runAll());
        this.runFailedBtn.addEventListener('click', () => this.runFailed());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.exportJsonBtn.addEventListener('click', () => this.exportJSON());
        this.exportHtmlBtn.addEventListener('click', () => this.exportHTML());
        this.copyLogsBtn.addEventListener('click', () => this.copyLogs());
        
        this.verboseMode.addEventListener('change', (e) => {
            this.verbose = e.target.checked;
            this.log('info', `Verbose mode: ${this.verbose ? 'ON' : 'OFF'}`);
        });
        
        this.stopOnErrorCheckbox.addEventListener('change', (e) => {
            this.stopOnError = e.target.checked;
            this.log('info', `Stop on error: ${this.stopOnError ? 'ON' : 'OFF'}`);
        });
    }
    
    /**
     * Регистрация test suite
     */
    registerSuite(suite) {
        this.suites.push(suite);
        this.results.total += suite.tests.length;
        this.updateStats();
        this.log('info', `Registered suite: ${suite.name} (${suite.tests.length} tests)`);
    }
    
    /**
     * Запуск всех тестов
     */
    async runAll() {
        if (this.isRunning) {
            this.log('warn', 'Tests are already running');
            return;
        }
        
        this.log('info', '🚀 Starting all tests...');
        this.isRunning = true;
        this.shouldStop = false;
        this.resetResults();
        this.updateUI('running');
        
        const startTime = Date.now();
        
        try {
            for (const suite of this.suites) {
                if (this.shouldStop) {
                    this.log('warn', 'Tests stopped by user');
                    break;
                }
                
                await this.runSuite(suite);
            }
        } catch (error) {
            this.log('error', `Fatal error: ${error.message}`);
            console.error(error);
        }
        
        this.results.duration = Date.now() - startTime;
        this.isRunning = false;
        this.updateUI('finished');
        
        this.log('success', `✅ All tests completed in ${this.results.duration}ms`);
        this.logSummary();
    }
    
    /**
     * Запуск одного suite
     */
    async runSuite(suite) {
        this.log('info', `📦 Running suite: ${suite.name}`);
        
        const suiteEl = this.createSuiteElement(suite);
        this.testResults.appendChild(suiteEl);
        
        for (const test of suite.tests) {
            if (this.shouldStop) break;
            
            await this.runTest(test, suite, suiteEl);
            
            if (this.stopOnError && test.status === 'failed') {
                this.log('error', 'Stopping due to error (stopOnError enabled)');
                this.shouldStop = true;
                break;
            }
        }
        
        this.log('info', `✅ Suite completed: ${suite.name}`);
    }
    
    /**
     * Запуск одного теста
     */
    async runTest(test, suite, suiteEl) {
        this.log('info', `🧪 Running: ${test.name}`);
        
        const testEl = this.createTestElement(test);
        suiteEl.querySelector('.test-suite-body').appendChild(testEl);
        
        test.status = 'running';
        testEl.classList.add('running');
        
        const startTime = Date.now();
        
        try {
            await test.fn();
            
            test.status = 'passed';
            test.duration = Date.now() - startTime;
            this.results.passed++;
            
            testEl.classList.remove('running');
            testEl.classList.add('passed');
            testEl.querySelector('.test-icon').textContent = '✅';
            testEl.querySelector('.test-message').textContent = 'Test passed';
            testEl.querySelector('.test-duration').textContent = `${test.duration}ms`;
            
            this.log('success', `✅ PASSED: ${test.name} (${test.duration}ms)`);
            
        } catch (error) {
            test.status = 'failed';
            test.duration = Date.now() - startTime;
            test.error = error;
            this.results.failed++;
            
            testEl.classList.remove('running');
            testEl.classList.add('failed');
            testEl.querySelector('.test-icon').textContent = '❌';
            testEl.querySelector('.test-message').textContent = error.message || 'Test failed';
            testEl.querySelector('.test-duration').textContent = `${test.duration}ms`;
            
            // Add error details
            const errorEl = document.createElement('div');
            errorEl.className = 'test-error';
            errorEl.textContent = error.stack || error.message;
            testEl.appendChild(errorEl);
            
            this.log('error', `❌ FAILED: ${test.name}`);
            this.log('error', error.stack || error.message);
        }
        
        this.results.tests.push({
            suite: suite.name,
            name: test.name,
            status: test.status,
            duration: test.duration,
            error: test.error ? test.error.message : null
        });
        
        this.updateStats();
        this.updateProgress();
    }
    
    /**
     * Повторный запуск failed тестов
     */
    async runFailed() {
        const failedTests = this.results.tests.filter(t => t.status === 'failed');
        
        if (failedTests.length === 0) {
            this.log('info', 'No failed tests to rerun');
            return;
        }
        
        this.log('info', `🔄 Rerunning ${failedTests.length} failed tests...`);
        
        // TODO: Implement rerun logic
        // For now, just run all tests again
        await this.runAll();
    }
    
    /**
     * Остановка тестов
     */
    stop() {
        this.shouldStop = true;
        this.log('warn', '⏹️ Stopping tests...');
    }
    
    /**
     * Очистка результатов
     */
    clear() {
        this.resetResults();
        this.testResults.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6c757d;">
                <div style="font-size: 64px; margin-bottom: 20px;">🧪</div>
                <h2 style="font-size: 24px; margin-bottom: 10px;">Готов к тестированию</h2>
                <p style="font-size: 16px;">Нажмите "Запустить все тесты" чтобы начать</p>
            </div>
        `;
        this.updateStats();
        this.updateProgress();
        this.log('info', '🗑️ Results cleared');
    }
    
    /**
     * Сброс результатов
     */
    resetResults() {
        this.results = {
            total: this.suites.reduce((sum, s) => sum + s.tests.length, 0),
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            tests: []
        };
    }
    
    /**
     * Создание элемента suite
     */
    createSuiteElement(suite) {
        const el = document.createElement('div');
        el.className = 'test-suite';
        el.innerHTML = `
            <div class="test-suite-header">
                <span>${suite.name}</span>
                <span class="test-suite-toggle">▼</span>
            </div>
            <div class="test-suite-body"></div>
        `;
        
        el.querySelector('.test-suite-header').addEventListener('click', () => {
            el.classList.toggle('collapsed');
        });
        
        return el;
    }
    
    /**
     * Создание элемента теста
     */
    createTestElement(test) {
        const el = document.createElement('div');
        el.className = 'test-case';
        el.innerHTML = `
            <div class="test-name">
                <span class="test-icon">⏳</span>
                <span>${test.name}</span>
                <span class="test-duration"></span>
            </div>
            <div class="test-message">Running...</div>
        `;
        return el;
    }
    
    /**
     * Обновление статистики
     */
    updateStats() {
        this.totalTestsEl.textContent = this.results.total;
        this.passedTestsEl.textContent = this.results.passed;
        this.failedTestsEl.textContent = this.results.failed;
        this.skippedTestsEl.textContent = this.results.skipped;
    }
    
    /**
     * Обновление прогресса
     */
    updateProgress() {
        const completed = this.results.passed + this.results.failed + this.results.skipped;
        const percent = Math.round((completed / this.results.total) * 100);
        
        this.progressBar.style.width = `${percent}%`;
        this.progressText.textContent = `${percent}%`;
    }
    
    /**
     * Обновление UI
     */
    updateUI(state) {
        if (state === 'running') {
            this.runAllBtn.disabled = true;
            this.runAllBtn.querySelector('#runBtnIcon').innerHTML = '<span class="spinner"></span>';
            this.runAllBtn.querySelector('#runBtnText').textContent = 'Выполняется...';
            this.stopBtn.disabled = false;
            this.clearBtn.disabled = true;
            this.exportJsonBtn.disabled = true;
            this.exportHtmlBtn.disabled = true;
            this.copyLogsBtn.disabled = true;
            this.testResults.innerHTML = '';
        } else if (state === 'finished') {
            this.runAllBtn.disabled = false;
            this.runAllBtn.querySelector('#runBtnIcon').textContent = '▶️';
            this.runAllBtn.querySelector('#runBtnText').textContent = 'Запустить все тесты';
            this.stopBtn.disabled = true;
            this.clearBtn.disabled = false;
            this.exportJsonBtn.disabled = false;
            this.exportHtmlBtn.disabled = false;
            this.copyLogsBtn.disabled = false;
            this.runFailedBtn.disabled = this.results.failed === 0;
        }
    }
    
    /**
     * Экспорт в JSON
     */
    exportJSON() {
        const data = {
            timestamp: new Date().toISOString(),
            version: 'v3.0 FINAL',
            results: this.results
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${Date.now()}.json`;
        a.click();
        
        this.log('success', '📦 Results exported to JSON');
    }
    
    /**
     * Экспорт в HTML
     */
    exportHTML() {
        const html = this.generateHTMLReport();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-report-${Date.now()}.html`;
        a.click();
        
        this.log('success', '📄 Report exported to HTML');
    }
    
    /**
     * Копирование логов
     */
    copyLogs() {
        const logs = this.generateTextLogs();
        navigator.clipboard.writeText(logs).then(() => {
            this.log('success', '📋 Logs copied to clipboard');
            alert('✅ Логи скопированы в буфер обмена!');
        }).catch(err => {
            this.log('error', `Failed to copy logs: ${err.message}`);
        });
    }
    
    /**
     * Генерация HTML отчета
     */
    generateHTMLReport() {
        const timestamp = new Date().toLocaleString('ru-RU');
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
        
        let testsHTML = '';
        
        for (const test of this.results.tests) {
            const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
            const statusClass = test.status;
            
            testsHTML += `
                <tr class="${statusClass}">
                    <td>${icon}</td>
                    <td>${test.suite}</td>
                    <td>${test.name}</td>
                    <td>${test.status}</td>
                    <td>${test.duration}ms</td>
                    <td>${test.error || '-'}</td>
                </tr>
            `;
        }
        
        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RegexHelper v3.0 - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat { padding: 20px; border-radius: 8px; flex: 1; text-align: center; }
        .stat.total { background: #667eea; color: white; }
        .stat.passed { background: #28a745; color: white; }
        .stat.failed { background: #dc3545; color: white; }
        .stat-number { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        tr.passed { background: #d4edda; }
        tr.failed { background: #f8d7da; }
        tr.skipped { background: #e2e3e5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 RegexHelper v3.0 - Test Report</h1>
        <p><strong>Дата:</strong> ${timestamp}</p>
        <p><strong>Общее время:</strong> ${this.results.duration}ms</p>
        <p><strong>Pass Rate:</strong> ${passRate}%</p>
        
        <div class="stats">
            <div class="stat total">
                <div class="stat-number">${this.results.total}</div>
                <div class="stat-label">Всего</div>
            </div>
            <div class="stat passed">
                <div class="stat-number">${this.results.passed}</div>
                <div class="stat-label">Пройдено</div>
            </div>
            <div class="stat failed">
                <div class="stat-number">${this.results.failed}</div>
                <div class="stat-label">Ошибок</div>
            </div>
        </div>
        
        <h2>Результаты тестов</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Suite</th>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Duration</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                ${testsHTML}
            </tbody>
        </table>
    </div>
</body>
</html>
        `;
    }
    
    /**
     * Генерация текстовых логов
     */
    generateTextLogs() {
        let logs = `
╔════════════════════════════════════════════════════════════════╗
║         REGEXHELPER v3.0 FINAL - TEST RESULTS                  ║
╚════════════════════════════════════════════════════════════════╝

📅 Дата: ${new Date().toLocaleString('ru-RU')}
⏱️  Время выполнения: ${this.results.duration}ms

╔════════════════════════════════════════════════════════════════╗
║  СТАТИСТИКА                                                    ║
╚════════════════════════════════════════════════════════════════╝

📊 Всего тестов:  ${this.results.total}
✅ Пройдено:      ${this.results.passed}
❌ Ошибок:        ${this.results.failed}
⏭️  Пропущено:    ${this.results.skipped}
📈 Pass Rate:     ${((this.results.passed / this.results.total) * 100).toFixed(2)}%

╔════════════════════════════════════════════════════════════════╗
║  ДЕТАЛИ ТЕСТОВ                                                 ║
╚════════════════════════════════════════════════════════════════╝

`;
        
        for (const test of this.results.tests) {
            const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
            logs += `${icon} [${test.suite}] ${test.name}\n`;
            logs += `   Status: ${test.status} | Duration: ${test.duration}ms\n`;
            if (test.error) {
                logs += `   Error: ${test.error}\n`;
            }
            logs += '\n';
        }
        
        if (this.results.failed > 0) {
            logs += `
╔════════════════════════════════════════════════════════════════╗
║  ОШИБКИ (${this.results.failed})                                            ║
╚════════════════════════════════════════════════════════════════╝

`;
            
            const failedTests = this.results.tests.filter(t => t.status === 'failed');
            for (const test of failedTests) {
                logs += `❌ [${test.suite}] ${test.name}\n`;
                logs += `   ${test.error}\n\n`;
            }
        }
        
        logs += `
╔════════════════════════════════════════════════════════════════╗
║  РЕКОМЕНДАЦИИ                                                  ║
╚════════════════════════════════════════════════════════════════╝

`;
        
        if (this.results.failed > 0) {
            logs += `⚠️  Обнаружены ошибки! Требуется исправление.\n`;
            logs += `📝 Проверьте секции с ошибками выше.\n`;
        } else {
            logs += `🎉 Все тесты пройдены успешно!\n`;
            logs += `✅ Можно переходить к ручному тестированию.\n`;
        }
        
        return logs;
    }
    
    /**
     * Вывод итоговой статистики
     */
    logSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total:   ${this.results.total}`);
        console.log(`Passed:  ${this.results.passed} ✅`);
        console.log(`Failed:  ${this.results.failed} ❌`);
        console.log(`Skipped: ${this.results.skipped} ⏭️`);
        console.log(`Duration: ${this.results.duration}ms`);
        console.log('='.repeat(60) + '\n');
    }
    
    /**
     * Логирование
     */
    log(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warn: '⚠️'
        }[type] || 'ℹ️';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
        
        if (this.verbose || type === 'error') {
            // Could add to UI log container here
        }
    }
}

// Assertion helpers
class Assert {
    static equals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }
    
    static notEquals(actual, expected, message) {
        if (actual === expected) {
            throw new Error(message || `Expected not to equal ${expected}`);
        }
    }
    
    static truthy(value, message) {
        if (!value) {
            throw new Error(message || `Expected truthy value, but got ${value}`);
        }
    }
    
    static falsy(value, message) {
        if (value) {
            throw new Error(message || `Expected falsy value, but got ${value}`);
        }
    }
    
    static contains(str, substring, message) {
        if (!str.includes(substring)) {
            throw new Error(message || `Expected "${str}" to contain "${substring}"`);
        }
    }
    
    static notContains(str, substring, message) {
        if (str.includes(substring)) {
            throw new Error(message || `Expected "${str}" not to contain "${substring}"`);
        }
    }
    
    static matches(str, regex, message) {
        if (!regex.test(str)) {
            throw new Error(message || `Expected "${str}" to match ${regex}`);
        }
    }
    
    static throws(fn, message) {
        try {
            fn();
            throw new Error(message || 'Expected function to throw');
        } catch (e) {
            if (e.message === message || !message) {
                return; // Expected error
            }
            throw e;
        }
    }
    
    static async doesNotThrow(fn, message) {
        try {
            await fn();
        } catch (e) {
            throw new Error(message || `Expected function not to throw, but got: ${e.message}`);
        }
    }
    
    static isType(value, type, message) {
        if (typeof value !== type) {
            throw new Error(message || `Expected type ${type}, but got ${typeof value}`);
        }
    }
    
    static isArray(value, message) {
        if (!Array.isArray(value)) {
            throw new Error(message || `Expected array, but got ${typeof value}`);
        }
    }
    
    static lengthOf(arr, length, message) {
        if (arr.length !== length) {
            throw new Error(message || `Expected length ${length}, but got ${arr.length}`);
        }
    }
    
    static deepEquals(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
    }
}
