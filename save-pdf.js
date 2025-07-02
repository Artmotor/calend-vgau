/**
 * Скрипт для генерации и скачивания PDF версии календаря мероприятий
 */

document.addEventListener('DOMContentLoaded', function() {
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (!downloadPdfBtn) return;
    
    downloadPdfBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handlePdfDownload();
    });
});

function handlePdfDownload() {
    if (!window.eventsData || window.eventsData.length === 0) {
        alert('Данные мероприятий еще не загружены. Пожалуйста, подождите...');
        return;
    }

    const loader = showLoader('Подготовка PDF для скачивания...');
    
    setTimeout(() => {
        try {
            const year = window.currentYear || new Date().getFullYear();
            const pdfContent = generateFullYearContent(year);
            downloadAsPdf(pdfContent, `Календарь_мероприятий_ВГАУ_${year}_год`);
        } catch (error) {
            console.error('Ошибка при создании PDF:', error);
            alert('Ошибка при создании PDF: ' + error.message);
        } finally {
            document.body.removeChild(loader);
        }
    }, 100);
}

function generateFullYearContent(year) {
    const firstHalf = `
        ${generateHeader(year, 'Первое полугодие')}
        ${generateCalendarGrid(0, 5, year)}
        ${generateEventsTable(0, 5, year)}
    `;
    
    const secondHalf = `
        ${generateHeader(year, 'Второе полугодие')}
        ${generateCalendarGrid(6, 11, year)}
        ${generateEventsTable(6, 11, year)}
    `;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial; margin: 0; padding: 5mm; font-size: 9pt; }
                .header-table { width: 100%; margin-bottom: 5mm; }
                .calendar-title { color: #71A600; text-align: center; font-size: 14pt; }
                .halfyear-title { color: #71A600; text-align: center; font-size: 12pt; margin-bottom: 5mm; }
                table.calendar-grid { width: 100%; border-collapse: collapse; margin-bottom: 5mm; }
                .month-header { background: #71A600; color: white; text-align: center; padding: 2mm; }
                .day-header { background: #f5f5f5; font-weight: bold; padding: 1mm; text-align: center; }
                .day-cell { border: 1px solid #ddd; height: 6mm; position: relative; }
                .day-number { position: absolute; top: 0; right: 1mm; font-size: 7pt; }
                table.events-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
                .events-table th { background: #71A600; color: white; padding: 2mm; text-align: center; }
                .events-table td { border: 1px solid #ddd; padding: 1mm; vertical-align: top; }
                .event-name { font-weight: bold; font-size: 8pt; }
                .page-break { page-break-after: always; }
                .footer { text-align: center; margin-top: 5mm; font-size: 8pt; color: #777; }
            </style>
        </head>
        <body>
            <div class="print-container">
                ${firstHalf}
                <div class="page-break"></div>
                ${secondHalf}
                <div class="footer">
                    Сгенерировано ${new Date().toLocaleDateString('ru-RU')} | © ВГАУ
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateHeader(year, period) {
    return `
        <table class="header-table">
            <tr>
                <td style="width: 40%;">
                    <div class="title-container">
                        <h5 class="calendar-title">Календарь мероприятий ВГАУ на ${year} год</h5>
                        <h6 class="halfyear-title">${period}</h6>
                    </div>
                </td>
            </tr>
        </table>
    `;
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
                        cellStyle = events.length === 1 
                            ? `background-color: ${events[0].Цвет || '#f5a623'};` 
                            : createMultiColorStyle(events);
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
    const eventsByCourse = groupEventsByCourseId(window.eventsData);
    
    const filteredCourses = Object.values(eventsByCourse).filter(courseEvents => {
        const eventDate = parseDate(courseEvents[0].Дата);
        return eventDate && 
               eventDate.getFullYear() === year && 
               eventDate.getMonth() >= startMonth && 
               eventDate.getMonth() <= endMonth;
    });
    
    filteredCourses.sort((a, b) => {
        const dateA = parseDate(a[0].Дата);
        const dateB = parseDate(b[0].Дата);
        return (dateA || 0) - (dateB || 0);
    });
    
    const coursesByMonth = Array(endMonth - startMonth + 1).fill().map(() => []);
    
    filteredCourses.forEach(courseEvents => {
        const uniqueDates = [...new Set(courseEvents.map(e => parseDate(e.Дата)))].filter(Boolean);
        if (uniqueDates.length === 0) return;
        
        const minMonth = Math.min(...uniqueDates.map(d => d.getMonth()));
        const maxMonth = Math.max(...uniqueDates.map(d => d.getMonth()));
        
        for (let month = minMonth; month <= maxMonth; month++) {
            if (month >= startMonth && month <= endMonth) {
                const relativeMonthIndex = month - startMonth;
                coursesByMonth[relativeMonthIndex].push(courseEvents);
            }
        }
    });
    
    const maxCourses = Math.max(...coursesByMonth.map(month => month.length));
    
    let tableHTML = `
        <table class="events-table">
            <tr>
                ${Array.from({length: endMonth - startMonth + 1}, (_, i) => 
                    `<th>${getMonthName(startMonth + i)}</th>`
                ).join('')}
            </tr>
    `;
    
    for (let i = 0; i < maxCourses; i++) {
        tableHTML += '<tr>';
        
        for (let month = 0; month < coursesByMonth.length; month++) {
            const course = coursesByMonth[month][i];
            
            if (course) {
                const firstEvent = course[0];
                const formattedName = formatEventName(firstEvent.Название);
                const description = firstEvent.Описание ? formatDescription(firstEvent.Описание) : '';
                
                tableHTML += `
                    <td style="background-color: ${firstEvent.Цвет || '#f5a623'}; padding: 1px;">
                        <div class="event-name">${formattedName}</div>
                        ${description ? `<div class="event-desc">${description}</div>` : ''}
                    </td>
                `;
            } else {
                tableHTML += '<td style="padding: 1px;"></td>';
            }
        }
        
        tableHTML += '</tr>';
    }
    
    return tableHTML + '</table>';
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

function downloadAsPdf(content, filename) {
    const element = document.createElement('div');
    element.innerHTML = content;
    document.body.appendChild(element);

    const opt = {
        margin: 5,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            logging: true,
            useCORS: true,
            allowTaint: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'landscape' 
        }
    };

    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            document.body.removeChild(element);
        });
}


// Вспомогательные функции
function formatEventName(name) {
    if (!name || typeof name !== 'string') return 'Мероприятие';
    
    // Сначала обрезаем до разумной длины, чтобы избежать переполнения стека
    const maxInputLength = 500;
    if (name.length > maxInputLength) {
        name = name.substring(0, maxInputLength);
    }

    // Основные сокращения
    const abbreviations = {
        'образовательный': 'образ.',
        'профессиональный': 'проф.',
        'сельскохозяйственный': 'с/х',
        'Ветеринарная': 'Вет.',
        'программа': 'прогр.',
        'повышение': 'повыш.',
        'квалификации': 'квалиф.',
        'семинар': 'сем.',
        'мероприятие': 'меропр.',
        'специалистов': 'спец.',
        'обучение': 'обуч.',
        'вебинар': 'веб.',
		'фармацевтической': 'фарм.',
		'Правовые': 'Прав-е',
		'деятельности': 'деят.',
        'конференция': 'конф.'
    };

    // Заменяем полные слова на сокращения
    let result = name;
    for (const [full, short] of Object.entries(abbreviations)) {
        result = result.replace(new RegExp(full, 'gi'), short);
    }

    // Удаляем лишние символы и пробелы
    result = result
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()«»"']/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Финализируем длину
    const maxLength = 40;
    if (result.length > maxLength) {
        result = result.substring(0, maxLength) + '...';
    }

    return result || 'Мероприятие';
}

function shortenText(text, maxLength = 30) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    const words = text.split(' ');
    let result = '';
    
    for (const word of words) {
        if ((result + ' ' + word).length > maxLength) {
            result += ' ' + word.substring(0, 1) + '.';
        } else {
            result += (result ? ' ' : '') + word;
        }
        
        if (result.length >= maxLength) break;
    }
    
    return result.trim();
}

function formatDescription(desc) {
    if (!desc) return '';
    const firstSentence = desc.split(/[.!?]+/)[0].trim().replace(/\s+/g, ' ');
    return firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
}

function groupEventsByCourseId(events) {
    const grouped = {};
    events.forEach(event => {
        const courseId = event['ID курса'] || 'no-id';
        if (!grouped[courseId]) grouped[courseId] = [];
        grouped[courseId].push(event);
    });
    return grouped;
}

function parseDate(dateString) {
    if (!dateString) return null;
    const match = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return match ? new Date(match[3], match[2]-1, match[1]) : null;
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
        const date = new Date(year, month, day);
        const dayOfWeek = (date.getDay() + 6) % 7;
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
        return date && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
    });
}

function isCurrentDay(day, month, year) {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
}

function createMultiColorStyle(events) {
    if (events.length <= 1) return '';
    const stripeWidth = 100 / events.length;
    let gradientParts = events.map((event, index) => {
        const color = event.Цвет || '#f5a623';
        const start = index * stripeWidth;
        const end = (index + 1) * stripeWidth;
        return `${color} ${start}%, ${color} ${end}%`;
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