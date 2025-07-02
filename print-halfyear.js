// print-halfyear.js

document.addEventListener('DOMContentLoaded', function() {
    initPrintButton();
});

function initPrintButton() {
    const printButton = document.getElementById('print-halfyear-btn');
    if (!printButton) return;
    
    printButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleHalfYearPrint();
    });
}

function handleHalfYearPrint() {
    if (!window.eventsData || window.eventsData.length === 0) {
        alert('Данные мероприятий еще не загружены. Пожалуйста, подождите...');
        return;
    }

    const loader = showLoader('Генерация полугодового календаря...');
    
    setTimeout(() => {
        try {
            const year = window.currentYear || new Date().getFullYear();
            const printContent = generateFullYearContent(year);
            openPrintWindow(printContent, ``);
        } catch (error) {
            console.error('Ошибка печати:', error);
            alert('Ошибка при печати: ' + error.message);
        } finally {
            document.body.removeChild(loader);
        }
    }, 100);
}

function generateFullYearContent(year) {
    return `
        <div class="print-container">
            <!-- Первое полугодие -->
            ${generateCalendarGrid(0, 5, year)}
            ${generateEventsTable(0, 5, year)}
            
            <!-- Второе полугодие -->
            ${generateCalendarGrid(6, 11, year)}
            ${generateEventsTable(6, 11, year)}
            
            <div class="footer">
                Сгенерировано ${new Date().toLocaleDateString('ru-RU')} | © ВГАУ
            </div>
        </div>
    `;
}

function showLoader(message) {
    const loader = document.createElement('div');
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    loader.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 5px;">
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(loader);
    return loader;
}

function openPrintWindow(content, title) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('Пожалуйста, разрешите всплывающие окна для печати');
    }

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 3mm;
                    font-size: 9pt;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 5mm;
                }
                .logos {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .logos img {
                    height: 50px;
                }
                .qr-code {
                    text-align: center;
                }
                .qr-code img {
                    width: 50px;
                    height: 50px;
                }
                .print-container {
                    width: 100%;
                }
                .calendar-title {
                    text-align: center;
                    color: #71A600;
                    margin-bottom: 5mm;
                    font-size: 12pt;
                }
                .halfyear-title {
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 5mm;
                    font-size: 12pt;
                    color: #71A600;
                    border-bottom: 1px solid #71A600;
                    padding-bottom: 2mm;
                }
                table.calendar-grid {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    margin-bottom: 12px;
                }
                table.calendar-grid td {
                    border: 1px solid #ddd;
                    padding: 3px;
                    text-align: center;
                    vertical-align: middle;
                    height: 5mm;
                    position: relative;
                }
                .month-header {
                    background-color: #71A600;
                    color: white;
                    font-weight: bold;
                    text-align: center;
                }
                .day-header {
                    background-color: #f5f5f5;
                    font-weight: bold;
                    width: 3.28%;
                }
                .day-cell {
                    position: relative;
                }
                .day-number {
                    position: absolute;
                    top: 1px;
                    right: 1px;
                    font-size: 8pt;
                    font-weight: bold;
                }
                .events-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 14px;
                    margin-bottom: 20px;
                }
                .events-table th {
                    background-color: #71A600;
                    color: white;
                    font-weight: bold;
                    text-align: center;
                    padding: 5px;
                    border: 1px solid #ddd;
                    width: 16.66%;
                }
                .events-table td {
                    padding: 4px;
                    border: 1px solid #ddd;
                    vertical-align: top;
                    width: 16.66%;
                }
                .footer {
                    text-align: center;
                    margin-top: 3mm;
                    font-size: 8pt;
                    color: #777;
                }
                @page {
                    size: A4 landscape;
                    margin: 5mm;
                }
                .page-break {
                    page-break-after: always;
                }
            </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 500);">
             <table class="header-table">
                <tr>
                    <td style="width: 20%;">
                        <div class="logos"><center>
                            <img src="" alt="">
                        </center>
                        </div>
			<td style="width: 10%;">
                        <div class="logos"><center>
                            <img src="https://static.tildacdn.com/tild3566-3134-4161-b666-303632393630/logo.svg" alt="ВГАУ">
                        </center>
                        </div>
                    </td>
                    <td style="width: 40%;">
                        <div class="title-container">
                            <h5 class="calendar-title">Календарь мероприятий ВГАУ на ${window.currentYear || new Date().getFullYear()} год</h5>
                        </div>
                    </td>
                    <td style="width: 20%;">
                        <div class="qr-code">
                            <img src="qr-dpo.png" alt="QR-код">
                            <div>dpo.v-gau.ru</div>
                        </div>
                    </td>
                </tr>
            </table>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
}

function generateCalendarGrid(startMonth, endMonth, year) {
    const months = [];
    for (let i = startMonth; i <= endMonth; i++) {
        months.push({
            name: getMonthName(i),
            index: i,
            weeks: getMonthWeeks(i, year)
        });
    }

    const maxWeeks = Math.max(...months.map(m => m.weeks.length));
    
    let tableHTML = `
        <table class="calendar-grid">
            <tr>
                <td class="day-header"></td>
    `;
    
    months.forEach(month => {
        tableHTML += `<td colspan="${maxWeeks}" class="month-header">${month.name}</td>`;
    });
    
    tableHTML += `</tr>`;
    
    const daysOfWeek = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'Вс'];
    daysOfWeek.forEach(day => {
        tableHTML += `<tr><td class="day-header">${day}</td>`;
        
        months.forEach(month => {
            const dayIndex = daysOfWeek.indexOf(day);
            
            for (let week = 0; week < maxWeeks; week++) {
                if (week < month.weeks.length && month.weeks[week][dayIndex]) {
                    const dayNumber = month.weeks[week][dayIndex];
                    const events = getEventsForDate(dayNumber, month.index, year);
                    const isCurrent = isCurrentDay(dayNumber, month.index, year);
                    
                    let cellStyle = '';
                    if (events.length > 0) {
                        if (events.length === 1) {
                            cellStyle = `background-color: ${events[0].Цвет || '#f5a623'};`;
                        } else {
                            cellStyle = createMultiColorStyle(events);
                        }
                    }
                    
                    tableHTML += `
                        <td class="day-cell ${isCurrent ? 'current-day' : ''}" 
                            style="${cellStyle}">
                            <div class="day-number">${dayNumber}</div>
                        </td>
                    `;
                } else {
                    tableHTML += '<td></td>';
                }
            }
        });
        
        tableHTML += '</tr>';
    });
    
    return tableHTML + '</table>';
}

function generateEventsTable(startMonth, endMonth, year) {
    const monthsEvents = [];
    for (let month = startMonth; month <= endMonth; month++) {
        monthsEvents.push(getEventsForMonth(month, year));
    }
    
    const maxEvents = Math.max(...monthsEvents.map(events => events.length));
    
    let tableHTML = `
        <table class="events-table">
            <tr>
                ${Array.from({length: endMonth - startMonth + 1}, (_, i) => 
                    `<th>${getMonthName(startMonth + i)}</th>`
                ).join('')}
            </tr>
    `;
    
    for (let i = 0; i < maxEvents; i++) {
        tableHTML += '<tr>';
        
        for (let month = startMonth; month <= endMonth; month++) {
            const events = monthsEvents[month - startMonth];
            const event = events[i];
            
            if (event) {
                tableHTML += `
                    <td style="background-color: ${event.Цвет || '#f5a623'}">
                        <strong>${event.Название || 'Мероприятие'}</strong>
                        ${event.Время ? `<div>${event.Время}</div>` : ''}
                        ${event.Описание ? `<div><small>${event.Описание}</small></div>` : ''}
                    </td>
                `;
            } else {
                tableHTML += '<td></td>';
            }
        }
        
        tableHTML += '</tr>';
    }
    
    return tableHTML + '</table>';
}

function getMonthWeeks(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks = [];
    let currentWeek = Array(7).fill(null);

    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek[i] = '';
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayOfWeek = (new Date(year, month, day).getDay() + 6) % 7;
        currentWeek[dayOfWeek] = day;
        
        if (dayOfWeek === 6 || day === lastDay.getDate()) {
            weeks.push([...currentWeek]);
            currentWeek = Array(7).fill(null);
        }
    }

    return weeks;
}

function getEventsForDate(day, month, year) {
    if (!day) return [];
    
    return window.eventsData.filter(event => {
        const date = parseDate(event.Дата);
        return date && 
               date.getDate() === day && 
               date.getMonth() === month && 
               date.getFullYear() === year;
    });
}

function getEventsForMonth(month, year) {
    if (!window.eventsData) return [];
    
    return window.eventsData.filter(event => {
        const date = parseDate(event.Дата);
        return date && date.getMonth() === month && date.getFullYear() === year;
    }).sort((a, b) => {
        const dateA = parseDate(a.Дата);
        const dateB = parseDate(b.Дата);
        return (dateA || 0) - (dateB || 0);
    });
}

function isCurrentDay(day, month, year) {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
}

function createMultiColorStyle(events) {
    if (events.length === 0) return '';
    if (events.length === 1) return `background-color: ${events[0].Цвет || '#f5a623'};`;
    
    const stripeWidth = 100 / events.length;
    let gradientParts = [];
    
    events.forEach((event, index) => {
        const color = event.Цвет || '#f5a623';
        const start = index * stripeWidth;
        const end = (index + 1) * stripeWidth;
        gradientParts.push(`${color} ${start}%, ${color} ${end}%`);
    });
    
    return `background-image: linear-gradient(to right, ${gradientParts.join(', ')});`;
}

function getMonthName(monthIndex) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август',
        'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[monthIndex];
}

function parseDate(dateString) {
    if (!dateString) return null;
    const match = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return match ? new Date(match[3], match[2]-1, match[1]) : null;
}
