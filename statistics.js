// Подключаем библиотеку Chart.js для построения диаграмм
const statisticsScript = document.createElement('script');
statisticsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(statisticsScript);

// Ждем загрузки библиотеки Chart.js
statisticsScript.onload = function() {
    // Инициализация статистики после загрузки библиотеки
    initStatistics();
};

function initStatistics() {
    // Создаем контейнер для статистики
    const statisticsTab = document.getElementById('statistics-tab');
    if (!statisticsTab) return;

    statisticsTab.innerHTML = `
        <div class="statistics-container">
            <h2>Статистика мероприятий</h2>
            <div class="charts-row">
                <div class="chart-container">
                    <h3>Количество мероприятий по годам</h3>
                    <canvas id="yearlyChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Сравнение по типам мероприятий</h3>
                    <canvas id="typesChart"></canvas>
                </div>
            </div>
            <div class="charts-row">
                <div class="chart-container">
                    <h3>Статусы мероприятий</h3>
                    <canvas id="statusChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Общая статистика</h3>
                    <div id="generalStats"></div>
                </div>
            </div>
            <div id="statistics-loader" class="loader hidden"></div>
            <div id="statistics-error" class="error-message hidden"></div>
        </div>
    `;

    // Добавляем стили
    addStatisticsStyles();

    // Запускаем ожидание данных
    waitForEventsData(updateStatistics);
}

function addStatisticsStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .statistics-container {
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: relative;
        }
        .charts-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        .chart-container {
            flex: 1;
            min-width: 300px;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.05);
        }
        .chart-container h3 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 16px;
        }
        canvas {
            width: 100% !important;
            height: auto !important;
            min-height: 250px;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-message {
            color: #e74c3c;
            padding: 10px;
            background: #f8d7da;
            border-radius: 4px;
            text-align: center;
            margin: 20px 0;
        }
        .hidden {
            display: none !important;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
            margin-top: 10px;
        }
        .stat-item {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

function waitForEventsData(callback) {
    const loader = document.getElementById('statistics-loader');
    const errorMsg = document.getElementById('statistics-error');
    
    if (loader) loader.classList.remove('hidden');
    if (errorMsg) errorMsg.classList.add('hidden');

    let attempts = 0;
    const maxAttempts = 10;
    const interval = 500;

    const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.eventsData && window.eventsData.length > 0) {
            clearInterval(checkInterval);
            if (loader) loader.classList.add('hidden');
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            if (loader) loader.classList.add('hidden');
            if (errorMsg) {
                errorMsg.textContent = 'Не удалось загрузить данные мероприятий';
                errorMsg.classList.remove('hidden');
            }
        }
    }, interval);
}

function updateStatistics() {
    if (!window.eventsData || window.eventsData.length === 0) {
        console.error('Данные мероприятий не загружены');
        return;
    }

    // Собираем уникальные мероприятия по ID
    const uniqueEvents = getUniqueEvents();

    // Группируем данные по годам
    const { eventsByYear, years } = groupEventsByYear(uniqueEvents);

    // Обновляем UI
    updateGeneralStats(uniqueEvents.length, years, eventsByYear);
    renderCharts(eventsByYear, years);
}

function getUniqueEvents() {
    const uniqueEventsMap = new Map();
    window.eventsData.forEach(event => {
        const eventId = event['ID курса'];
        if (eventId && !uniqueEventsMap.has(eventId)) {
            uniqueEventsMap.set(eventId, event);
        }
    });
    return Array.from(uniqueEventsMap.values());
}

function groupEventsByYear(events) {
    const eventsByYear = {};
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
    
    // Инициализация структуры данных
    years.forEach(year => {
        eventsByYear[year] = {
            total: 0,
            types: {
                'Мастер-класс': 0,
                'КПК': 0,
                'Переподготовка': 0,
                'Мероприятие': 0,
                'Другое': 0
            },
            statuses: {
                'active': 0,
                'upcoming': 0,
                'completed': 0
            }
        };
    });

    // Заполнение данных
    events.forEach(event => {
        const eventYear = extractYearFromEvent(event);
        if (!eventYear || !eventsByYear[eventYear]) return;

        eventsByYear[eventYear].total++;
        
        const eventType = getEventType(event['ID курса']);
        if (eventsByYear[eventYear].types[eventType] !== undefined) {
            eventsByYear[eventYear].types[eventType]++;
        }

        const status = getEventStatus(event);
        if (eventsByYear[eventYear].statuses[status] !== undefined) {
            eventsByYear[eventYear].statuses[status]++;
        }
    });

    return { eventsByYear, years };
}

function updateGeneralStats(totalEvents, years, eventsByYear) {
    const generalStats = document.getElementById('generalStats');
    if (!generalStats) return;

    let html = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${totalEvents}</div>
                <div class="stat-label">Всего мероприятий</div>
            </div>
    `;

    years.forEach(year => {
        if (eventsByYear[year].total > 0) {
            html += `
                <div class="stat-item">
                    <div class="stat-value">${eventsByYear[year].total}</div>
                    <div class="stat-label">в ${year} году</div>
                </div>
            `;
        }
    });

    const types = ['Мастер-класс', 'КПК', 'Переподготовка', 'Мероприятие'];
    types.forEach(type => {
        let count = 0;
        years.forEach(year => {
            count += eventsByYear[year].types[type] || 0;
        });
        if (count > 0) {
            html += `
                <div class="stat-item">
                    <div class="stat-value">${count}</div>
                    <div class="stat-label">${type}</div>
                </div>
            `;
        }
    });

    html += `</div>`;
    generalStats.innerHTML = html;
}

function renderCharts(eventsByYear, years) {
    // Удаляем старые диаграммы
    destroyOldCharts();

    // Создаем новые диаграммы
    createYearlyChart(eventsByYear, years);
    createTypesChart(eventsByYear, years);
    createStatusChart(eventsByYear, years);
}

function destroyOldCharts() {
    ['yearlyChart', 'typesChart', 'statusChart'].forEach(chartId => {
        const chart = Chart.getChart(chartId);
        if (chart) chart.destroy();
    });
}

// Вспомогательные функции
function extractYearFromEvent(event) {
    if (!event) return null;
    
    // Пробуем извлечь год из ID
    const id = event['ID курса'] || '';
    const match = id.match(/-(\d{2,4})-/);
    if (match) {
        let year = parseInt(match[1]);
        if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
        return year;
    }
    
    // Пробуем извлечь год из даты
    const date = event['Дата'];
    if (date) {
        const dateParts = date.split('.');
        if (dateParts.length === 3) return parseInt(dateParts[2]);
    }
    
    return null;
}

function getEventType(courseId) {
    if (!courseId) return 'Другое';
    if (courseId.startsWith('Й')) return 'Мастер-класс';
    if (courseId.startsWith('Z')) return 'Переподготовка';
    if (courseId.startsWith('X')) return 'КПК';
    if (courseId.startsWith('М')) return 'Мероприятие';
    return 'Другое';
}

function getEventStatus(event) {
    if (!event) return 'completed';
    
    const now = new Date();
    const eventDate = parseEventDate(event['Дата']);
    if (!eventDate) return 'completed';

    const startOfDay = new Date(eventDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(eventDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (now < startOfDay) return 'upcoming';
    if (now > endOfDay) return 'completed';
    return 'active';
}

function parseEventDate(dateString) {
    if (!dateString) return null;
    const match = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return match ? new Date(match[3], match[2]-1, match[1]) : null;
}

// Функции для создания диаграмм
function createYearlyChart(data, years) {
    const ctx = document.getElementById('yearlyChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years.map(year => year.toString()),
            datasets: [{
                label: 'Количество мероприятий',
                data: years.map(year => data[year]?.total || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: getChartOptions('Количество мероприятий')
    });
}

function createTypesChart(data, years) {
    const ctx = document.getElementById('typesChart')?.getContext('2d');
    if (!ctx) return;

    const types = ['Мастер-класс', 'КПК', 'Переподготовка', 'Мероприятие', 'Другое'];
    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
    ];

    const datasets = types.map((type, i) => ({
        label: type,
        data: years.map(year => data[year]?.types[type] || 0),
        backgroundColor: colors[i],
        borderColor: colors[i].replace('0.7', '1'),
        borderWidth: 1
    }));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years.map(year => year.toString()),
            datasets: datasets
        },
        options: getChartOptions('Количество мероприятий', false)
    });
}

function createStatusChart(data, years) {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;

    const statuses = [
        { label: 'Идет сейчас', key: 'active', color: 'rgba(75, 192, 192, 0.7)' },
        { label: 'Не началось', key: 'upcoming', color: 'rgba(255, 206, 86, 0.7)' },
        { label: 'Завершено', key: 'completed', color: 'rgba(255, 99, 132, 0.7)' }
    ];

    const datasets = statuses.map(status => ({
        label: status.label,
        data: years.map(year => data[year]?.statuses[status.key] || 0),
        backgroundColor: status.color,
        borderColor: status.color.replace('0.7', '1'),
        borderWidth: 2,
        fill: false,
        tension: 0.1
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years.map(year => year.toString()),
            datasets: datasets
        },
        options: getChartOptions('Количество мероприятий')
    });
}

function getChartOptions(yAxisTitle, stacked = false) {
    return {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                stacked: stacked,
                title: {
                    display: true,
                    text: yAxisTitle
                }
            },
            x: {
                stacked: stacked,
                title: {
                    display: true,
                    text: 'Год'
                }
            }
        }
    };
}

// Обработчик события обновления данных
document.addEventListener('eventsUpdated', function() {
    waitForEventsData(updateStatistics);
});