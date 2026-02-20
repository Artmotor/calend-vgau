(function() {
    // Данные реквизитов
    const requisitesData = {
        fullName: "федеральное государственное бюджетное образовательное учреждение высшего образования «Верхневолжский государственный агробиотехнологический университет»",
        shortName: "ФГБОУ ВО \"Верхневолжский ГАУ\"",
        head: "ректор Малиновская Екатерина Евгеньевна (действует на основании Устава)",
        address: "153012, г. Иваново, ул. Советская, д.45",
        ogrn: "1033700052858",
        inn: "3728012857",
        kpp: "370201001",
        okpo: "00492902240001",
        oktmo: "24701000",
        treasuryAcc: "03214643000000013237",
        korrAcc: "40102810745370000024",
        bankInfo: "ОКЦ №1 Волго-Вятского ГУ Банка России//УФК по Нижегородской области, г. Нижний Новгород",
        phone: "8 (4932) 32-81-44 (приемная ректора)",
        email: "rektorat@ivgsha.ru",
        kbkStudy: "0000000000000000000130",
        kbkDonation: "00000000000000000150",
        noteSchet: "03214643000000013237",
        noteVrem: "03212643000000013237",
        noteKbk: "0000000000000000000510"
    };

    // Подключаем стили
    if (!document.querySelector('link[href*="https://artmotor.github.io/calend-vgau/styleData.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'styleData.css';
        document.head.appendChild(link);
    }

    document.addEventListener('DOMContentLoaded', function() {
        // 1. НАХОДИМ ИЛИ СОЗДАЕМ КОНТЕЙНЕР ДЛЯ КНОПКИ
        const header = document.querySelector('header');
        if (!header) return;

        // Удаляем старую кнопку, если есть
        const oldBtn = document.getElementById('requisitesHeaderBtn');
        if (oldBtn) oldBtn.remove();

        // Создаем новую кнопку
        const requisitesBtn = document.createElement('button');
        requisitesBtn.id = 'requisitesHeaderBtn';
        requisitesBtn.className = 'requisites-header-btn';
        requisitesBtn.innerHTML = '🏛 Реквизиты';

        // Просто добавляем в конец шапки (всегда будет новой строкой)
        header.appendChild(requisitesBtn);

        // 2. СОЗДАЕМ МОДАЛЬНОЕ ОКНО
        // Удаляем старое модальное окно
        const oldModal = document.getElementById('requisitesModal');
        if (oldModal) oldModal.remove();

        // Создаем новое
        const modal = document.createElement('div');
        modal.id = 'requisitesModal';
        modal.className = 'requisites-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2>🏛 Реквизиты университета</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body" id="requisites-container"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Элементы управления
        const modalOverlay = modal.querySelector('.modal-overlay');
        const modalClose = modal.querySelector('.modal-close');
        const container = document.getElementById('requisites-container');

        // Открытие модального окна
        requisitesBtn.onclick = function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            if (!container.hasAttribute('data-loaded')) {
                renderRequisites(container, requisitesData);
                container.setAttribute('data-loaded', 'true');
            }
        };

        // Закрытие
        modalClose.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        modalOverlay.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
    });

    function renderRequisites(container, d) {
        container.innerHTML = `
            <div class="requisites-content">
                <div class="requisites-actions">
                    <button class="btn-copy-all" id="copyAllBtn">
                        📋 Копировать все реквизиты
                    </button>
                    <div class="download-group">
                        <button class="btn-download" id="downloadTxt">📄 Скачать TXT</button>
                        <button class="btn-download" id="downloadPdf">📑 Скачать PDF</button>
                    </div>
                </div>

                <div class="requisites-section">
                    <h3>🏛 Основное</h3>
                    ${createRow('Полное наименование', d.fullName)}
                    ${createRow('Сокращенное', d.shortName)}
                    ${createRow('Руководитель', d.head)}
                    ${createRow('Адрес', d.address)}
                    ${createRow('ИНН', d.inn)}
                </div>

                <div class="requisites-section">
                    <h3>🔢 Коды и регистрация</h3>
                    ${createRow('ОГРН', d.ogrn)}
                    ${createRow('ИНН/КПП', `${d.inn} / ${d.kpp}`)}
                    ${createRow('ОКТМО', d.oktmo)}
                    ${createRow('ОКПО', d.okpo)}
                </div>

                <div class="requisites-section">
                    <h3>🏦 Банковские реквизиты</h3>
                    ${createRow('Казначейский счет', d.treasuryAcc)}
                    ${createRow('Корреспондентский счет', d.korrAcc)}
                    ${createRow('Банк', d.bankInfo)}
                </div>

                <div class="requisites-section">
                    <h3>📞 Контакты</h3>
                    ${createRow('Телефон', d.phone)}
                    ${createRow('Email', d.email)}
                </div>

                <div class="requisites-section">
                    <h3>💰 Для оплаты</h3>
                    ${createRow('КБК (обучение/общежитие)', d.kbkStudy)}
                    ${createRow('КБК (пожертвования)', d.kbkDonation)}
                </div>

                <div class="requisites-section ref-section">
                    <h3>📌 Дополнительные счета</h3>
                    ${createRow('Счет текущих расчетов', d.noteSchet)}
                    ${createRow('Временное распоряжение', d.noteVrem)}
                    ${createRow('КБК обеспечение', d.noteKbk)}
                </div>
            </div>
        `;

        // Добавляем обработчики для копирования
        const rows = container.querySelectorAll('.row-item');
        rows.forEach(row => {
            const copyBtn = row.querySelector('.copy-btn');
            const valueSpan = row.querySelector('.item-value');
            
            copyBtn.onclick = function() {
                navigator.clipboard.writeText(valueSpan.innerText).then(() => {
                    copyBtn.textContent = '✅';
                    setTimeout(() => copyBtn.textContent = '📋', 700);
                });
            };
        });

        // Копировать всё
        document.getElementById('copyAllBtn').onclick = function() {
            const text = getAllText(d);
            navigator.clipboard.writeText(text).then(() => {
                this.textContent = '✅ Скопировано!';
                setTimeout(() => this.textContent = '📋 Копировать все реквизиты', 1500);
            });
        };

        // Скачать TXT
        document.getElementById('downloadTxt').onclick = function() {
            const blob = new Blob([getAllText(d)], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'rekvizity_vgau.txt';
            a.click();
        };

        // Скачать PDF
        document.getElementById('downloadPdf').onclick = function() {
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                <head>
                    <title>Реквизиты Верхневолжский ГАУ</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h2>ФГБОУ ВО "Верхневолжский ГАУ"</h2>
                    <pre>${getAllText(d)}</pre>
                </body>
                </html>
            `);
            win.print();
        };
    }

    function createRow(label, value) {
        return `
            <div class="row-item">
                <span class="item-label">${label}</span>
                <span class="item-value">${value}</span>
                <button class="copy-btn">📋</button>
            </div>
        `;
    }

    function getAllText(d) {
        return `ФГБОУ ВО "Верхневолжский ГАУ"
        
ПОЛНОЕ НАИМЕНОВАНИЕ: ${d.fullName}
СОКРАЩЕННОЕ: ${d.shortName}
РУКОВОДИТЕЛЬ: ${d.head}
АДРЕС: ${d.address}

ОГРН: ${d.ogrn}
ИНН/КПП: ${d.inn}/${d.kpp}
ОКТМО: ${d.oktmo}
ОКПО: ${d.okpo}

КАЗНАЧЕЙСКИЙ СЧЕТ: ${d.treasuryAcc}
КОРР. СЧЕТ: ${d.korrAcc}
БАНК: ${d.bankInfo}

ТЕЛЕФОН: ${d.phone}
EMAIL: ${d.email}

КБК (обучение/общежитие): ${d.kbkStudy}
КБК (пожертвования): ${d.kbkDonation}

ДОПОЛНИТЕЛЬНЫЕ СЧЕТА:
Счет текущих расчетов: ${d.noteSchet}
Временное распоряжение: ${d.noteVrem}
КБК обеспечение: ${d.noteKbk}`;
    }
})();
