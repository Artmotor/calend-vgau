document.addEventListener('DOMContentLoaded', function() {
    // Текущая дата
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
	window.currentYear = currentDate.getFullYear(); // Сохраняем в глобальную область
    let eventsData = [];

	
    // Элементы DOM
    const calendarBody = document.querySelector('#calendar tbody');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const eventsTableBody = document.querySelector('#events-table tbody');
    const modal = document.getElementById('event-modal');
    const modalDate = document.getElementById('modal-date');
    const modalEvents = document.getElementById('modal-events');
    const closeModal = document.querySelector('.close');
	
	const printMonthButton = document.getElementById('print-month');
	const printContainer = document.getElementById('print-container');
	const printYearButton = document.getElementById('print-year-btn');
	
    // Переключатели вида
	const monthViewBtn = document.getElementById('month-view-btn');
	const yearViewBtn = document.getElementById('year-view-btn');
	const monthView = document.getElementById('month-view');
	const yearView = document.getElementById('year-view');
	const yearCalendar = document.getElementById('year-calendar');
	const currentYearElement = document.getElementById('current-year');
	const prevYearButton = document.getElementById('prev-year');
	const nextYearButton = document.getElementById('next-year');
	
    // Загрузка данных с использованием CORS-прокси
    function loadEvents() {
        // Пробуем несколько прокси-серверов на случай недоступности одного
        const proxyUrls = [
            ''
        ];

        const sheetUrl = ('https://d5d4fmled1rhluh8ksno.akta928u.apigw.yandexcloud.net/data.csv');

        let currentProxyIndex = 0;

        function tryFetchWithProxy() {
            if (currentProxyIndex >= proxyUrls.length) {
                console.error('All proxies failed, using test data');
                useTestData();
                return;
            }

            const proxyUrl = proxyUrls[currentProxyIndex];
            fetch('https://d5d4fmled1rhluh8ksno.akta928u.apigw.yandexcloud.net/data.csv', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(data => {
                    eventsData = parseCSV(data);
					window.eventsData = parseCSV(data);
                    generateCalendar(currentMonth, currentYear);
                    generateEventsTable(currentMonth, currentYear);

                })
                .catch(error => {
                    console.error(`Proxy ${proxyUrl} failed:`, error);
                    currentProxyIndex++;
                    tryFetchWithProxy();
                });
        }

        tryFetchWithProxy();
    }

    // Запасной вариант с тестовыми данными
    function useTestData() {
        const testData = `Дата,Время,Название мероприятия,Описание,Цвет
01.${currentMonth + 1}.${currentYear},10:00,Пример мероприятия 1,Это тестовое мероприятие,#FF5733
15.${currentMonth + 1}.${currentYear},14:00,Пример мероприятия 2,Еще одно тестовое мероприятие,#33FF57
20.${currentMonth + 1}.${currentYear},,Мероприятие без времени,Описание без времени,#3385FF
01.${(currentMonth + 2) % 12 || 12}.${currentMonth === 11 ? currentYear + 1 : currentYear},09:30,Мероприятие в следующем месяце,Тест отображения в календаре,#FFC733`;

        eventsData = parseCSV(testData);
        generateCalendar(currentMonth, currentYear);
        generateEventsTable(currentMonth, currentYear);

        // Показываем уведомление о тестовых данных
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 20px';
        notification.style.backgroundColor = '#f5a623';
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.textContent = 'Используются тестовые данные из-за ошибки загрузки';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 5000);
    }

    // Парсинг CSV
    function parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const events = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"(.*)"$/, '$1'));
            if (values.length === headers.length) {
                const event = {};
                for (let j = 0; j < headers.length; j++) {
                    event[headers[j]] = values[j] || '';
                }
                events.push(event);
            }
        }

        return events;
    }

    // Генерация календаря
    function generateCalendar(month, year) {
        calendarBody.innerHTML = '';
        currentMonthElement.textContent = `${getMonthName(month)} ${year}`;

        // Корректировка дня недели (Пн=0, Вс=6)
        const firstDay = (new Date(year, month, 1).getDay() || 7) - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let date = 1;
        let nextMonthDate = 1;
        let isCurrentMonth = false;

        // Создаем 6 строк (максимально возможное количество недель в месяце)
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            // 7 дней в неделе
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day-number';

                if (i === 0 && j < firstDay) {
                    // Дни предыдущего месяца
                    const prevMonthDay = daysInPrevMonth - (firstDay - 1 - j);
                    dayDiv.textContent = prevMonthDay;
                    cell.classList.add('other-month');
                } else if (date > daysInMonth) {
                    // Дни следующего месяца
                    dayDiv.textContent = nextMonthDate;
                    cell.classList.add('other-month');
                    nextMonthDate++;
                } else {
                    // Дни текущего месяца
                    dayDiv.textContent = date;
                    
                    // Проверяем, является ли день текущим
                    const today = new Date();
                    if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        cell.classList.add('today');
                    }

                    // Добавляем события для этого дня
                    const dayEvents = getEventsForDate(date, month + 1, year);
                    dayEvents.forEach(event => {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event';
                        eventDiv.textContent = event['Название'] || 'Мероприятие';
                        
                        // Устанавливаем цвет, если он есть
                        if (event['Цвет']) {
                            eventDiv.style.backgroundColor = event['Цвет'];
                            
                            // Автоматически выбираем цвет текста для лучшей читаемости
                            const textColor = getContrastColor(event['Цвет']);
                            eventDiv.style.color = textColor;
                        }
                        
                        eventDiv.addEventListener('click', () => openModal(event));
                        cell.appendChild(eventDiv);
                    });

                    date++;
                }

                cell.appendChild(dayDiv);
                row.appendChild(cell);
            }

            calendarBody.appendChild(row);

            // Прекращаем создание строк, если все дни месяца отображены
            if (date > daysInMonth && nextMonthDate > 7) {
                break;
            }
        }
    }

    // Получение мероприятий для конкретной даты
    function getEventsForDate(day, month, year) {
        return eventsData.filter(event => {
            if (!event['Дата']) return false;
            
            const eventDate = parseDate(event['Дата']);
            return eventDate && 
                   eventDate.getDate() === day && 
                   eventDate.getMonth() + 1 === month && 
                   eventDate.getFullYear() === year;
        });
    }

    // Парсинг даты из строки
    function parseDate(dateString) {
        if (!dateString) return null;
        
        // Попробуем разные форматы даты
        const formats = [
            /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // DD.MM.YYYY
            /(\d{4})-(\d{1,2})-(\d{1,2})/,    // YYYY-MM-DD
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/   // MM/DD/YYYY
        ];
        
        for (const format of formats) {
            const match = dateString.match(format);
            if (match) {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const year = parseInt(match[3], 10);
                return new Date(year, month, day);
            }
        }
        
        return null;
    }

    // Форматирование даты для таблицы
    function formatDateForTable(dateString) {
        const date = parseDate(dateString);
        if (!date) return dateString;
        
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    }

    // Получение названия месяца
    function getMonthName(month) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель',
            'Май', 'Июнь', 'Июль', 'Август',
            'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[month];
    }

    // Функция для определения контрастного цвета текста
    function getContrastColor(hexColor) {
        // Удаляем # если есть
        const hex = hexColor.replace('#', '');
        
        // Конвертируем в RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Рассчитываем яркость (формула W3C)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Возвращаем черный или белый в зависимости от яркости фона
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    // Генерация таблицы мероприятий
    function generateEventsTable(month, year) {
        eventsTableBody.innerHTML = '';
        const monthEvents = eventsData.filter(event => {
            if (!event['Дата']) return false;
            
            const eventDate = parseDate(event['Дата']);
            return eventDate && eventDate.getMonth() === month && eventDate.getFullYear() === year;
        });

        if (monthEvents.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'Нет мероприятий в этом месяце';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            row.appendChild(cell);
            eventsTableBody.appendChild(row);
            return;
        }

        // Сортируем мероприятия по дате
        monthEvents.sort((a, b) => {
            const dateA = parseDate(a['Дата']);
            const dateB = parseDate(b['Дата']);
            return dateA - dateB;
        });

        monthEvents.forEach(event => {
            const row = document.createElement('tr');
            
            // Дата
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDateForTable(event['Дата']);
            row.appendChild(dateCell);
            
            // Время
            const timeCell = document.createElement('td');
            timeCell.textContent = event['Время'] || '-';
            row.appendChild(timeCell);
            
            // Название
            const nameCell = document.createElement('td');
            nameCell.textContent = event['Название'] || 'Мероприятие';
            
            // Добавляем цветной маркер перед названием
            if (event['Цвет']) {
                const colorMarker = document.createElement('span');
                colorMarker.style.display = 'inline-block';
                colorMarker.style.width = '12px';
                colorMarker.style.height = '12px';
                colorMarker.style.borderRadius = '50%';
                colorMarker.style.backgroundColor = event['Цвет'];
                colorMarker.style.marginRight = '8px';
                colorMarker.style.verticalAlign = 'middle';
                nameCell.insertBefore(colorMarker, nameCell.firstChild);
            }
            
            row.appendChild(nameCell);
            
            // Описание
            const descCell = document.createElement('td');
            descCell.className = 'description-column';
            descCell.textContent = event['Описание'] || '-';
            row.appendChild(descCell);
            
            row.addEventListener('click', () => openModal(event));
            eventsTableBody.appendChild(row);
        });
    }

    // Открытие модального окна с мероприятием
    function openModal(event) {
        modalDate.textContent = formatDateForTable(event['Дата']) || 'Дата не указана';
        modalEvents.innerHTML = '';

        const eventDiv = document.createElement('div');
        eventDiv.className = 'modal-event';
        
		// Добавляем цветной маркер, если есть цвет
        if (event['Цвет']) {
            const colorMarker = document.createElement('span');
            colorMarker.style.display = 'inline-block';
            colorMarker.style.width = '15px';
            colorMarker.style.height = '15px';
            colorMarker.style.borderRadius = '50%';
            colorMarker.style.backgroundColor = event['Цвет'];
            colorMarker.style.marginRight = '10px';
            colorMarker.style.verticalAlign = 'middle';
            eventDiv.appendChild(colorMarker);
        }
        
        if (event['Время']) {
            const timeP = document.createElement('p');
            timeP.className = 'modal-event-time';
            timeP.textContent = `Время: ${event['Время']}`;
            eventDiv.appendChild(timeP);
        }
        
        const titleH4 = document.createElement('h4');
        titleH4.textContent = event['Название'] || 'Мероприятие';
        eventDiv.appendChild(titleH4);
        
        if (event['Описание']) {
            const descP = document.createElement('p');
            descP.textContent = event['Описание'];
            eventDiv.appendChild(descP);
        }
        
        modalEvents.appendChild(eventDiv);
        modal.style.display = 'block';
    }

    // Переключение месяцев
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
        generateEventsTable(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
        generateEventsTable(currentMonth, currentYear);
    });

    // Добавим обработчик события для кнопки печати
printMonthButton.addEventListener('click', printMonthCalendar);

// Функция для подготовки календаря к печати
function printMonthCalendar() {
    const printWindow = window.open('', '', 'width=1000,height=600');
    const printDocument = printWindow.document;
    
    // Получаем данные для печати
    const monthName = currentMonthElement.textContent;
    const monthEvents = getEventsForMonth(currentMonth + 1, currentYear);
    
    // Создаем HTML для печати
    printDocument.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Календарь мероприятий - ${monthName}</title>
            <style>
                body {
                    font-family: 'Roboto', sans-serif;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .print-page {
                    width: 297mm;
                    height: 210mm;
                    padding: 10mm;
                    page-break-after: always;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .print-header h2 {
                    color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')};
                    margin: 0 0 5px 0;
                    font-size: 24pt;
                }
                .print-header h3 {
                    margin: 0;
                    font-size: 18pt;
                    color: #555;
                }
                .calendar-container {
                    display: flex;
                    margin-bottom: 10px;
                }
                .print-calendar {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    margin-right: 10px;
                }
                .print-calendar th {
                    background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')};
                    color: white;
                    padding: 8px;
                    text-align: center;
                    font-size: 10pt;
                    height: 30px;
                }
                .print-calendar td {
                    border: 1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--border-color')};
                    height: 25mm; /* Фиксированная высота ячеек */
                    vertical-align: top;
                    padding: 3px;
                    position: relative;
                    font-size: 9pt;
                    overflow: hidden;
                }
                .print-day-number {
                    position: absolute;
                    top: 3px;
                    right: 3px;
                    font-weight: bold;
                }
                .print-event {
                    font-size: 8pt;
                    padding: 1px 3px;
                    border-radius: 2px;
                    margin-top: 15px;
                    margin-bottom: 1px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    border: 1px solid rgba(0,0,0,0.1);
                    display: block;
                }
                .print-other-month {
                    background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--other-month')};
                    color: ${getComputedStyle(document.documentElement).getPropertyValue('--light-text')};
                }
                .print-today {
                    background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--current-day')};
                }
                .events-list {
                    width: 35%;
                    font-size: 9pt;
                }
                .events-list h4 {
                    color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')};
                    margin: 0 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--border-color')};
                }
                .event-item {
                    margin-bottom: 8px;
                    page-break-inside: avoid;
                }
                .event-date {
                    font-weight: bold;
                    color: ${getComputedStyle(document.documentElement).getPropertyValue('--accent-color')};
                }
                .event-title {
                    font-weight: 500;
                }
                .event-time {
                    color: #666;
                    font-size: 8pt;
                }
                .print-footer {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 8pt;
                    color: ${getComputedStyle(document.documentElement).getPropertyValue('--light-text')};
                }
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }
            </style>
        </head>
        <body>
            <div class="print-page">
                <div class="print-header">
                    <h2>Календарь мероприятий</h2>
                    <h3>${monthName}</h3>
                </div>
                
                <div class="calendar-container">
                    <table class="print-calendar">
                        <thead>
                            <tr>
                                <th style="width:14.28%">Пн</th>
                                <th style="width:14.28%">Вт</th>
                                <th style="width:14.28%">Ср</th>
                                <th style="width:14.28%">Чт</th>
                                <th style="width:14.28%">Пт</th>
                                <th style="width:14.28%">Сб</th>
                                <th style="width:14.28%">Вс</th>
                            </tr>
                        </thead>
                        <tbody>
    `);

    // Добавляем строки календаря
    const rows = calendarBody.querySelectorAll('tr');
    rows.forEach(row => {
        printDocument.write('<tr>');
        
        row.querySelectorAll('td').forEach(cell => {
            const isOtherMonth = cell.classList.contains('other-month');
            const isToday = cell.classList.contains('today');
            
            printDocument.write(`<td class="${isOtherMonth ? 'print-other-month' : isToday ? 'print-today' : ''}">`);
            
            // Номер дня
            const dayNumber = cell.querySelector('.day-number').textContent;
            printDocument.write(`<div class="print-day-number">${dayNumber}</div>`);
            
            // События дня
            const events = cell.querySelectorAll('.event');
            events.forEach(event => {
                const bgColor = event.style.backgroundColor || getComputedStyle(event).backgroundColor;
                const textColor = event.style.color || getComputedStyle(event).color;
                
                printDocument.write(`
                    <div class="print-event" style="background-color:${bgColor};color:${textColor}">
                        ${event.textContent}
                    </div>
                `);
            });
            
            printDocument.write('</td>');
        });
        
        printDocument.write('</tr>');
    });

    // Закрываем таблицу и добавляем список событий
    printDocument.write(`
                        </tbody>
                    </table>
                    
                    <div class="events-list">
                        <h4>Список мероприятий</h4>
    `);

    // Добавляем список мероприятий
    if (monthEvents.length > 0) {
        monthEvents.forEach(event => {
            const eventDate = parseDate(event['Дата']);
            const formattedDate = eventDate ? eventDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : event['Дата'];
            
            printDocument.write(`
                <div class="event-item">
                    <div class="event-date">${formattedDate}</div>
                    ${event['Время'] ? `<div class="event-time">${event['Время']}</div>` : ''}
                    <div class="event-title">${event['Название'] || 'Мероприятие'}</div>
                </div>
            `);
        });
    } else {
        printDocument.write('<div>Нет мероприятий в этом месяце</div>');
    }

    // Завершаем HTML
    printDocument.write(`
                    </div>
                </div>
                
                <div class="print-footer">
                    Сгенерировано ${new Date().toLocaleDateString('ru-RU')} | © ВГАУ
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 300);
                };
            </script>
        </body>
        </html>
    `);

    printDocument.close();
}

// Вспомогательная функция для получения событий месяца
function getEventsForMonth(month, year) {
    return eventsData.filter(event => {
        if (!event['Дата']) return false;
        const eventDate = parseDate(event['Дата']);
        return eventDate && 
               eventDate.getMonth() + 1 === month && 
               eventDate.getFullYear() === year;
    }).sort((a, b) => {
        const dateA = parseDate(a['Дата']);
        const dateB = parseDate(b['Дата']);
        return dateA - dateB;
    });
}
	
	// Функция для генерации годового календаря
function generateYearCalendar(year) {
    yearCalendar.innerHTML = '';
    currentYearElement.textContent = year;

    for (let month = 0; month < 12; month++) {
        const monthContainer = document.createElement('div');
        monthContainer.className = 'year-month';

        const monthTitle = document.createElement('h3');
        monthTitle.textContent = `${getMonthName(month)} ${year}`;
        monthContainer.appendChild(monthTitle);

        const monthTable = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Заголовки дней недели
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        monthTable.appendChild(thead);

        const tbody = document.createElement('tbody');
        
        // Генерация календаря для месяца
        const firstDay = (new Date(year, month, 1).getDay() || 7) - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let date = 1;
        let nextMonthDate = 1;
        let row = document.createElement('tr');

        // Создаем 6 строк (максимально возможное количество недель в месяце)
        for (let i = 0; i < 6; i++) {
            // Очищаем строку перед заполнением
            row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day-number';

                if (i === 0 && j < firstDay) {
                    // Дни предыдущего месяца
                    const prevMonthDay = daysInPrevMonth - (firstDay - 1 - j);
                    dayDiv.textContent = prevMonthDay;
                    cell.classList.add('other-month');
                } else if (date > daysInMonth) {
                    // Дни следующего месяца
                    dayDiv.textContent = nextMonthDate;
                    cell.classList.add('other-month');
                    nextMonthDate++;
                } else {
                    // Дни текущего месяца
                    dayDiv.textContent = date;
                    
                    // Проверяем, является ли день текущим
                    const today = new Date();
                    if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        cell.classList.add('today');
                    }

                    // Добавляем события для этого дня
                    const dayEvents = getEventsForDate(date, month + 1, year);
                    dayEvents.forEach(event => {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event';
                        // Сокращаем длинные названия
                        const eventName = event['Название'] || '✓';
                        eventDiv.textContent = eventName.length > 10 ? 
                            eventName.substring(0, 8) + '...' : eventName;
                        
                        if (event['Цвет']) {
                            eventDiv.style.backgroundColor = event['Цвет'];
                            const textColor = getContrastColor(event['Цвет']);
                            eventDiv.style.color = textColor;
                        }
                        
                        eventDiv.addEventListener('click', () => openModal(event));
                        cell.appendChild(eventDiv);
                    });

                    date++;
                }

                cell.appendChild(dayDiv);
                row.appendChild(cell);
            }

            tbody.appendChild(row);
            if (date > daysInMonth && nextMonthDate > 7) break;
        }

        // Добавляем пустые строки, если месяц закончился раньше 6 строк
        while (tbody.children.length < 6) {
            const emptyRow = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const emptyCell = document.createElement('td');
                emptyCell.innerHTML = '&nbsp;';
                emptyRow.appendChild(emptyCell);
            }
            tbody.appendChild(emptyRow);
        }

        monthTable.appendChild(tbody);
        monthContainer.appendChild(monthTable);
        yearCalendar.appendChild(monthContainer);
    }
}

   // Переключение между видами календаря
    monthViewBtn.addEventListener('click', () => {
        monthViewBtn.classList.add('active');
        yearViewBtn.classList.remove('active');
        monthView.style.display = 'block';
        yearView.style.display = 'none';
    });

    yearViewBtn.addEventListener('click', () => {
        yearViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        yearView.style.display = 'block';
        monthView.style.display = 'none';
        generateYearCalendar(currentYear);
    });

    // Навигация по годам
    prevYearButton.addEventListener('click', () => {
        currentYear--;
        generateYearCalendar(currentYear);
    });

    nextYearButton.addEventListener('click', () => {
        currentYear++;
        generateYearCalendar(currentYear);
    });

 

    // Закрытие модального окна
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    // Инициализация
    loadEvents();
	// В конце файла script.js, после loadEvents();
printYearButton.addEventListener('click', function() {
  generateYearCalendar(currentYear);
  window.print();
});
});

