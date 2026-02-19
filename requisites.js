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

    // Добавляем кнопку в шапку
    document.addEventListener('DOMContentLoaded', function() {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav') || header;
        
        if (!header) return;

        // Находим контейнер с кнопками меню
        const navContainer = document.querySelector('.nav-links, .menu, .navigation') || nav;
        
        // Создаем отдельный контейнер для мобильного меню
        const mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'requisites-mobile-container';
        
        // Создаем кнопку реквизитов
        const requisitesBtn = document.createElement('button');
        requisitesBtn.id = 'requisitesHeaderBtn';
        requisitesBtn.className = 'requisites-header-btn';
        requisitesBtn.innerHTML = '<span class="btn-icon">🏛</span><span class="btn-text">Реквизиты</span>';
        
        // Добавляем кнопку в отдельный контейнер
        mobileMenuBtn.appendChild(requisitesBtn);
        
        // Вставляем после навигации (чтобы была на новой строке на мобилках)
        if (navContainer) {
            navContainer.parentNode.insertBefore(mobileMenuBtn, navContainer.nextSibling);
        } else {
            header.appendChild(mobileMenuBtn);
        }

        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.id = 'requisitesModal';
        modal.className = 'requisites-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2>🏛 Реквизиты университета</h2>
                    <button class="modal-close">&times;</button>
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
        requisitesBtn.addEventListener('click', function() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (!container.hasAttribute('data-loaded')) {
                renderRequisites(container, requisitesData);
                container.setAttribute('data-loaded', 'true');
            }
        });

        // Закрытие
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Адаптация для мобильных
        function handleMobileLayout() {
            if (window.innerWidth <= 768) {
                requisitesBtn.innerHTML = '<span class="btn-icon">🏛</span><span class="btn-text">Реквизиты</span>';
                requisitesBtn.title = '';
                mobileMenuBtn.style.display = 'block';
                mobileMenuBtn.style.width = '100%';
                mobileMenuBtn.style.padding = '8px 16px 0';
            } else {
                requisitesBtn.innerHTML = '<span class="btn-icon">🏛</span><span class="btn-text">Реквизиты</span>';
                requisitesBtn.title = '';
                mobileMenuBtn.style.display = 'inline-block';
                mobileMenuBtn.style.width = 'auto';
                mobileMenuBtn.style.padding = '0';
            }
        }

        handleMobileLayout();
        window.addEventListener('resize', handleMobileLayout);
    });

    function renderRequisites(container, d) {
        container.innerHTML = `
            <div class="requisites-content">
                <div class="requisites-actions">
                    <button class="btn-copy-all" id="copyAllBtn">
                        <span>📋</span> Копировать все
                    </button>
                    <div class="download-group">
                        <button class="btn-download" id="downloadTxt">
                            <span>📄</span> TXT
                        </button>
                        <button class="btn-download" id="downloadPdf">
                            <span>📑</span> PDF
                        </button>
                    </div>
                </div>

                <div class="requisites-grid">
                    ${renderBlock('🏛 Основное', [
                        ['Полное наименование', d.fullName, 'fullName'],
                        ['Сокращенное', d.shortName, 'shortName'],
                        ['Руководитель', d.head, 'head'],
                        ['Адрес', d.address, 'address']
                    ])}
                    
                    ${renderBlock('🔢 Коды', [
                        ['ОГРН', d.ogrn, 'ogrn'],
                        ['ИНН/КПП', `${d.inn} / ${d.kpp}`, 'innKpp'],
                        ['ОКТМО', d.oktmo, 'oktmo'],
                        ['ОКПО', d.okpo, 'okpo']
                    ])}
                    
                    ${renderBlock('🏦 Счета', [
                        ['Казначейский счет', d.treasuryAcc, 'treasuryAcc'],
                        ['Корр. счет', d.korrAcc, 'korrAcc'],
                        ['Банк', d.bankInfo, 'bankInfo']
                    ])}
                    
                    ${renderBlock('📞 Контакты / Оплата', [
                        ['Телефон', d.phone, 'phone'],
                        ['Email', d.email, 'email'],
                        ['КБК обучение', d.kbkStudy, 'kbkStudy'],
                        ['КБК пожертв.', d.kbkDonation, 'kbkDonation']
                    ])}
                </div>

                <div class="requisites-ref">
                    <h3>📌 Дополнительные счета</h3>
                    ${renderRows([
                        ['Счет текущих расчетов', d.noteSchet, 'noteSchet'],
                        ['Врем. распоряжение', d.noteVrem, 'noteVrem'],
                        ['КБК обеспечение', d.noteKbk, 'noteKbk']
                    ])}
                </div>
            </div>
        `;

        attachHandlers(d);
    }

    function renderBlock(title, rows) {
        return `
            <div class="requisites-block">
                <div class="block-title">${title}</div>
                ${renderRows(rows)}
            </div>
        `;
    }

    function renderRows(rows) {
        return rows.map(([label, value, id]) => `
            <div class="row-item">
                <span class="item-label">${label}</span>
                <span class="item-value" id="val_${id}">${value}</span>
                <button class="copy-btn" data-copy="val_${id}" title="Копировать">📋</button>
            </div>
        `).join('');
    }

    function attachHandlers(d) {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.copy;
                const el = document.getElementById(targetId);
                if (el) {
                    navigator.clipboard.writeText(el.innerText).then(() => {
                        this.innerText = '✅';
                        setTimeout(() => this.innerText = '📋', 700);
                    });
                }
            });
        });

        document.getElementById('copyAllBtn')?.addEventListener('click', function() {
            const text = getAllText(d);
            navigator.clipboard.writeText(text).then(() => {
                this.innerHTML = '<span>✅</span> Скопировано!';
                setTimeout(() => this.innerHTML = '<span>📋</span> Копировать все', 1500);
            });
        });

        document.getElementById('downloadTxt')?.addEventListener('click', () => {
            const blob = new Blob([getAllText(d)], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'rekvizity_vgau.txt';
            a.click();
        });

        document.getElementById('downloadPdf')?.addEventListener('click', () => {
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                <head>
                    <title>Реквизиты Верхневолжский ГАУ</title>
                    <style>
                        body { padding: 2rem; font-family: system-ui; line-height: 1.5; }
                        pre { white-space: pre-wrap; background: #f5f5f5; padding: 1rem; border-radius: 8px; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h2>ФГБОУ ВО "Верхневолжский ГАУ"</h2>
                    <pre>${getAllText(d)}</pre>
                </body>
                </html>
            `);
            win.print();
        });
    }

    function getAllText(d) {
        return `ПОЛНОЕ НАИМЕНОВАНИЕ: ${d.fullName}
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
КБК (обучение): ${d.kbkStudy}
КБК (пожертвования): ${d.kbkDonation}
СЧЕТ ТЕКУЩИХ РАСЧЕТОВ: ${d.noteSchet}
СЧЕТ ВРЕМ. РАСПОРЯЖЕНИЯ: ${d.noteVrem}
КБК ОБЕСПЕЧЕНИЕ: ${d.noteKbk}`;
    }
})();
