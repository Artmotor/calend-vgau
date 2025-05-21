document.addEventListener('DOMContentLoaded', function() {
    // Добавляем кнопку в header
    addEventsListButton();
    
    // Инициализируем модальное окно для списка мероприятий
    initEventsListModal();
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleResponsiveLayout);
});

function addEventsListButton() {
    const header = document.querySelector('.header-container');
    if (!header) return;
    
    // Удаляем старую кнопку, если есть
    const oldButton = document.getElementById('events-list-btn');
    if (oldButton) {
        oldButton.remove();
    }
    
    // Создаем новую кнопку
    const button = document.createElement('button');
    button.id = 'events-list-btn';
    button.className = 'events-list-button';
    button.innerHTML = '<i class="fas fa-list"></i> Список мероприятий';
    
    button.addEventListener('click', openEventsListModal);
    
    // Создаем контейнер для центрирования
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'events-list-button-container';
    buttonContainer.appendChild(button);
    
    header.appendChild(buttonContainer);
}

function toggleMobileMenu() {
    const header = document.querySelector('.header-container');
    if (header) {
        header.classList.toggle('mobile-menu-open');
    }
}

function handleResponsiveLayout() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const listButton = document.getElementById('events-list-btn');
    const burgerButton = document.querySelector('.burger-menu-button');
    
    if (isMobile) {
        // Мобильная версия
        if (listButton) {
            listButton.classList.add('mobile-version');
            listButton.querySelector('.button-text').style.display = 'none';
        }
        if (burgerButton) {
            burgerButton.style.display = 'block';
        }
    } else {
        // Десктопная версия
        if (listButton) {
            listButton.classList.remove('mobile-version');
            listButton.querySelector('.button-text').style.display = 'inline';
        }
        if (burgerButton) {
            burgerButton.style.display = 'none';
        }
        // Закрываем меню, если оно было открыто
        const header = document.querySelector('.header-container');
        if (header) {
            header.classList.remove('mobile-menu-open');
        }
    }
}

function initEventsListModal() {
    const modal = document.createElement('div');
    modal.id = 'events-list-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <span class="close">&times;</span>
            <h3>Список всех мероприятий</h3>
            <div class="events-list-container">
                <table id="all-events-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Действие</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openEventsListModal() {
    if (!window.eventsData || window.eventsData.length === 0) {
        alert('Данные мероприятий еще не загружены. Пожалуйста, подождите...');
        return;
    }
    
    const modal = document.getElementById('events-list-modal');
    const tableBody = modal.querySelector('#all-events-table tbody');
    tableBody.innerHTML = '';
    
    // Группируем мероприятия по ID курса
    const eventsByCourse = groupEventsByCourseId(window.eventsData);
    
    // Сортируем мероприятия по дате начала
    const sortedCourses = Object.values(eventsByCourse).sort((b, a) => {
        const dateA = parseDate(a[0].Дата);
        const dateB = parseDate(b[0].Дата);
        return (dateA || 0) - (dateB || 0);
    });
    
    // Заполняем таблицу
    sortedCourses.forEach(courseEvents => {
        const row = document.createElement('tr');
        
        // ID курса
        // const idCell = document.createElement('td');
        // idCell.textContent = courseEvents[0]['ID курса'] || '—';
        // row.appendChild(idCell);
        
        // Название
        const nameCell = document.createElement('td');
        nameCell.textContent = courseEvents[0]['Название'] || 'Мероприятие';
        row.appendChild(nameCell);
        
        // Даты проведения
        // const datesCell = document.createElement('td');
        // const uniqueDates = [...new Set(courseEvents.map(e => e.Дата))];
        // datesCell.textContent = uniqueDates.join(', ');
        // row.appendChild(datesCell);
        
        // Статус
        // const statusCell = document.createElement('td');
        // const status = getCourseStatus(courseEvents);
        // statusCell.textContent = status.text;
        // statusCell.style.backgroundColor = status.color;
        // statusCell.style.color = getContrastColor(status.color);
        // row.appendChild(statusCell);
        
        // Описание
        const descCell = document.createElement('td');
        descCell.textContent = courseEvents[0]['Описание'] || '—';
        row.appendChild(descCell);
        
        // Кнопка записи
        const actionCell = document.createElement('td');
        const registrationButton = createRegistrationButton(courseEvents);
        actionCell.appendChild(registrationButton);
        row.appendChild(actionCell);
        
        tableBody.appendChild(row);
    });
    
    modal.style.display = 'block';
}

function createRegistrationButton(courseEvents) {
    const now = new Date();
    const button = document.createElement('button');
    button.className = 'registration-button';
    
    // Анализируем даты мероприятий
    let hasPastDates = false;
    let hasCurrentDates = false;
    let hasFutureDates = false;
    
    courseEvents.forEach(event => {
        const eventDate = parseDate(event.Дата);
        if (!eventDate) return;
        
        // Считаем, что мероприятие длится один день
        const startOfDay = new Date(eventDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(eventDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (now < startOfDay) {
            hasFutureDates = true;
        } else if (now > endOfDay) {
            hasPastDates = true;
        } else {
            hasCurrentDates = true;
        }
    });
    
    // Проверяем наличие ссылки
    const registrationLink = courseEvents[0]['Ссылка'] || '';
    
    // Определяем состояние кнопки
    if (hasCurrentDates || (hasPastDates && hasFutureDates)) {
        // Если есть текущая дата или смесь прошлых и будущих дат
        button.textContent = 'Запись завершена';
        button.disabled = true;
        button.classList.add('completed');
    } else if (hasFutureDates && !hasPastDates && !hasCurrentDates) {
        // Если все даты в будущем
        if (registrationLink) {
            button.textContent = 'Записаться';
            button.disabled = false;
            button.classList.add('active');
            button.addEventListener('click', () => {
                window.open(registrationLink, '_blank');
            });
        } else {
            button.textContent = 'Запись недоступна';
            button.disabled = true;
            button.classList.add('unavailable');
        }
    } else if (hasPastDates && !hasFutureDates && !hasCurrentDates) {
        // Если все даты в прошлом
        button.textContent = 'Запись закрыта';
        button.disabled = true;
        button.classList.add('closed');
    } else {
        // На всякий случай
        button.textContent = 'Запись недоступна';
        button.disabled = true;
        button.classList.add('unavailable');
    }
    
    return button;
}

function groupEventsByCourseId(events) {
    const grouped = {};
    
    events.forEach(event => {
        const courseId = event['ID курса'] || 'no-id';
        if (!grouped[courseId]) {
            grouped[courseId] = [];
        }
        grouped[courseId].push(event);
    });
    
    return grouped;
}

function getCourseStatus(courseEvents) {
    const now = new Date();
    let hasPastDates = false;
    let hasCurrentDates = false;
    let hasFutureDates = false;
    
    courseEvents.forEach(event => {
        const eventDate = parseDate(event.Дата);
        if (!eventDate) return;
        
        // Считаем, что мероприятие длится один день
        const startOfDay = new Date(eventDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(eventDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (now < startOfDay) {
            hasFutureDates = true;
        } else if (now > endOfDay) {
            hasPastDates = true;
        } else {
            hasCurrentDates = true;
        }
    });
    
    if (hasCurrentDates || (hasPastDates && hasFutureDates)) {
        return { text: 'Идет сейчас', color: '#FFD700' }; // Желтый
    } else if (hasFutureDates) {
        return { text: 'Не началось', color: '#90EE90' }; // Зеленый
    } else if (hasPastDates) {
        return { text: 'Завершено', color: '#FF6347' }; // Красный
    } else {
        return { text: 'Нет данных', color: '#CCCCCC' }; // Серый
    }
}

function parseDate(dateString) {
    if (!dateString) return null;
    const match = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    return match ? new Date(match[3], match[2]-1, match[1]) : null;
}

function getContrastColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}