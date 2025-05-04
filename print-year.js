// print-year.js

document.addEventListener('DOMContentLoaded', function() {
    const printYearButton = document.getElementById('print-year-btn');
    if (printYearButton) {
        printYearButton.addEventListener('click', handleYearPrint);
    }
});

function handleYearPrint() {
    if (!window.eventsData || window.eventsData.length === 0) {
        alert('Данные мероприятий еще не загружены. Пожалуйста, подождите...');
        return;
    }

    showPrintLoader();
    
    setTimeout(() => {
        try {
            const printContent = generateYearCalendarHTML();
            openPrintWindow(printContent);
        } catch (error) {
            console.error('Print error:', error);
            alert('Ошибка при подготовке печати: ' + error.message);
        } finally {
            hidePrintLoader();
        }
    }, 100);
}

function showPrintLoader() {
    const loader = document.createElement('div');
    loader.id = 'print-loader';
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
            <p>Подготовка годового календаря...</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hidePrintLoader() {
    const loader = document.getElementById('print-loader');
    if (loader) loader.remove();
}

function openPrintWindow(content) {
    const printWindow = window.open('', '_blank', 'width=1000,height=600');
    if (!printWindow) {
        alert('Пожалуйста, разрешите всплывающие окна для печати');
        return;
    }

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Годовой календарь мероприятий ${window.currentYear || new Date().getFullYear()}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 5mm;
                    font-size: 10pt;
                }
                .print-page { 
                    width: 297mm; 
                    height: 210mm; 
                    page-break-after: always;
                }
                .calendar-title {
                    text-align: center;
                    font-size: 16pt;
                    margin-bottom: 5mm;
                    color: #71A600;
                }
                .calendar-container {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }
                .day-header {
                    background: #71A600;
                    color: white;
                    padding: 3mm;
                    text-align: center;
                    font-weight: bold;
                    width: 15mm;
                }
                .month-header {
                    background: #71A600;
                    color: white;
                    padding: 3mm;
                    text-align: center;
                    font-weight: bold;
                }
                .day-cell {
                    border: 1px solid black;
                    height: 10mm;
                    vertical-align: top;
                    padding: 0;
                    position: relative;
                }
                .day-number {
                    position: absolute;
                    top: 1mm;
                    right: 1mm;
                    font-weight: bold;
                    font-size: 8pt;
                }
                .event-segment {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .event-part {
                    flex: 1;
                    min-height: 3mm;
                    color: white;
                    font-size: 6pt;
                    padding: 1mm;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .footer {
                    text-align: center;
                    margin-top: 5mm;
                    font-size: 8pt;
                    color: #777;
                }
                @page {
                    size: A4 landscape;
                    margin: 5mm;
                }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
        }, 500);
    };
}

function generateYearCalendarHTML() {
    const year = window.currentYear || new Date().getFullYear();
    let html = '';
    
    // Генерируем по два полугодия
    for (let half = 0; half < 2; half++) {
        const startMonth = half * 6;
        const endMonth = startMonth + 5;
        
        html += `
        <div class="print-page">
            <h1 class="calendar-title">Программа мероприятий на ${half === 0 ? 'первое' : 'второе'} полугодие ${year} года</h1>
            ${generateHalfYearCalendar(startMonth, endMonth, year)}
            <div class="footer">
                Сгенерировано ${new Date().toLocaleDateString('ru-RU')} | © ВГАУ
            </div>
        </div>`;
    }
    
    return html;
}

function generateHalfYearCalendar(startMonth, endMonth, year) {
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const eventsByMonth = groupEventsByMonth(year);
    
    let html = `
    <table class="calendar-container">
        <thead>
            <tr>
                <th class="day-header">День</th>`;
    
    // Заголовки месяцев
    for (let month = startMonth; month <= endMonth; month++) {
        html += `<th class="month-header" colspan="1">${getMonthName(month)}</th>`;
    }
    
    html += `</tr></thead><tbody>`;
    
    // Строки с днями недели
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        html += `<tr><td class="day-header">${daysOfWeek[dayOfWeek]}</td>`;
        
        for (let month = startMonth; month <= endMonth; month++) {
            html += generateWeekDayCells(month, dayOfWeek, eventsByMonth[month]);
        }
        
        html += `</tr>`;
    }
    
    return html + `</tbody></table>`;
}

function generateWeekDayCells(month, dayOfWeek, monthEvents) {
    const year = window.currentYear || new Date().getFullYear();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Пн=0, Вс=6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    let html = '';
    
    // Находим все дни для этого дня недели в месяце
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        if ((new Date(year, month, day).getDay() + 6) % 7 === dayOfWeek) {
            days.push(day);
        }
    }
    
    if (days.length > 0) {
        html += `<td class="day-cell">`;
        
        days.forEach(day => {
            const dayEvents = monthEvents.filter(event => {
                const date = parseDate(event['Дата']);
                return date?.getDate() === day;
            });
            
            const isToday = day === today.getDate() && 
                          month === today.getMonth() && 
                          year === today.getFullYear();
            
            html += `<div style="${isToday ? 'border: 2px solid red;' : ''}">`;
            html += `<div class="day-number">${day}</div>`;
            html += `<div class="event-segment">`;
            
            if (dayEvents.length > 0) {
                dayEvents.forEach(event => {
                    const color = event['Цвет'] || '#f5a623';
                    const eventName = event['Название'] || 'Мероприятие';
                    html += `<div class="event-part" style="background:${color}" title="${eventName}">${eventName}</div>`;
                });
            } else {
                html += `<div class="event-part" style="background:white"></div>`;
            }
            
            html += `</div></div>`;
        });
        
        html += `</td>`;
    } else {
        html += `<td class="day-cell"></td>`;
    }
    
    return html;
}

// Остальные вспомогательные функции остаются без изменений
function groupEventsByMonth(year) {
    const eventsByMonth = Array(12).fill().map(() => []);
    
    if (window.eventsData) {
        window.eventsData.forEach(event => {
            const date = parseDate(event['Дата']);
            if (date?.getFullYear() === year) {
                eventsByMonth[date.getMonth()].push(event);
            }
        });

        eventsByMonth.forEach(monthEvents => {
            monthEvents.sort((a, b) => {
                const dateA = parseDate(a['Дата']);
                const dateB = parseDate(b['Дата']);
                return (dateA || 0) - (dateB || 0);
            });
        });
    }

    return eventsByMonth;
}

function getMonthName(month) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август',
        'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month];
}

function parseDate(dateString) {
    if (!dateString) return null;
    
    const match = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return match ? new Date(match[3], match[2]-1, match[1]) : null;
}