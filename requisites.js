// ===== Реквизиты ВУЗа - подключение одним скриптом =====
(function() {
  // Создаем контейнер, если его нет
  let container = document.getElementById('requisites-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'requisites-container';
    container.className = 'requisites-wrapper';
    
    // Ищем место для вставки (после календаря или в конец body)
    const calendar = document.querySelector('.calendar, main, article') || document.body;
    calendar.appendChild(container);
  }

  // Загружаем стили
  if (!document.querySelector('link[href*="https://artmotor.github.io/calend-vgau/requisites/styleData.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styleData.css';
    document.head.appendChild(link);
  }

  // Загружаем данные и рендерим
  fetch('https://artmotor.github.io/calend-vgau/requisites/requisites.json')
    .then(response => response.json())
    .then(data => {
      renderRequisites(container, data);
    })
    .catch(err => {
      container.innerHTML = '<div style="color: #b33; padding: 1rem;">⚠️ Ошибка загрузки реквизитов</div>';
      console.error('Requisites load error:', err);
    });

  // ===== Функция рендера =====
  function renderRequisites(container, d) {
    // Базовая разметка
    container.innerHTML = `
      <div class="requisites-toggle" id="reqToggle">
        <span class="icon">🏛</span>
        <span id="reqToggleText">Свернуть реквизиты</span>
        <span id="reqToggleIcon">▼</span>
      </div>
      <div class="requisites-content" id="reqContent">
        <div class="requisites-card">
          <div class="requisites-actions">
            <button class="btn-copy-all" id="copyAllBtn"><span>📋</span> Копировать все</button>
            <div ="display: flex; gap: 0.5rem;">
              <button class="btn-download" id="downloadTxt"><span>📄</span> .txt</button>
              <button class="btn-download" id="downloadPdf"><span>📑</span> .pdf</button>
            </div>
          </div>
          <div class="requisites-grid" id="reqGrid"></div>
          <div class="ref-block" id="reqRef"></div>
        </div>
        <div class="requisites-footer">⚡ Нажми на 📋 рядом с полем — скопируется отдельно</div>
      </div>
    `;

    // Заполняем основные блоки
    const grid = document.getElementById('reqGrid');
    grid.innerHTML = `
      <div class="requisites-block">
        <div class="block-title"><span>🏛</span> Основное</div>
        ${createRow('Полное наименование', d.fullName, 'fullName')}
        ${createRow('Сокращенное', d.shortName, 'shortName')}
        ${createRow('Руководитель', d.head, 'head')}
        ${createRow('Адрес', d.address, 'address')}
      </div>
      <div class="requisites-block">
        <div class="block-title"><span>🔢</span> Коды</div>
        ${createRow('ОГРН', d.ogrn, 'ogrn')}
        ${createRow('ИНН/КПП', d.inn + ' / ' + d.kpp, 'innKpp')}
        ${createRow('ОКТМО', d.oktmo, 'oktmo')}
        ${createRow('ОКПО', d.okpo, 'okpo')}
      </div>
      <div class="requisites-block">
        <div class="block-title"><span>🏦</span> Счета</div>
        ${createRow('Казначейский счет', d.treasuryAcc, 'treasuryAcc')}
        ${createRow('Корр. счет', d.korrAcc, 'korrAcc')}
        ${createRow('Банк', d.bankInfo, 'bankInfo')}
      </div>
      <div class="requisites-block">
        <div class="block-title"><span>📞</span> Контакты / Оплата</div>
        ${createRow('Телефон', d.phone, 'phone')}
        ${createRow('Email', d.email, 'email')}
        ${createRow('КБК обучение', d.kbkStudy, 'kbkStudy')}
        ${createRow('КБК пожертв.', d.kbkDonation, 'kbkDonation')}
      </div>
    `;

    // Справочный блок
    document.getElementById('reqRef').innerHTML = `
      <div class="ref-title">📌 Справочно (дополнительные счета)</div>
      ${createRow('Счет текущих расчетов', d.noteSchet, 'noteSchet')}
      ${createRow('Врем. распоряжение', d.noteVrem, 'noteVrem')}
      ${createRow('КБК обеспечение', d.noteKbk, 'noteKbk')}
    `;

    // Добавляем обработчики
    attachHandlers(d);
  }

  function createRow(label, value, id) {
    return `
      <div class="row-item">
        <span class="item-label">${label}</span>
        <span class="item-value" id="val_${id}">${value}</span>
        <button class="copy-icon" data-copy="val_${id}" title="Копировать">📋</button>
      </div>
    `;
  }

  function attachHandlers(d) {
    // Копирование отдельных полей
    document.querySelectorAll('.copy-icon').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const targetId = this.getAttribute('data-copy');
        const el = document.getElementById(targetId);
        if (el) {
          navigator.clipboard.writeText(el.innerText).then(() => {
            this.innerText = '✅';
            setTimeout(() => this.innerText = '📋', 700);
          });
        }
      });
    });

    // Копировать всё
    document.getElementById('copyAllBtn').addEventListener('click', function() {
      const text = getAllText(d);
      navigator.clipboard.writeText(text).then(() => {
        this.innerHTML = '<span>✅</span> Скопировано!';
        setTimeout(() => this.innerHTML = '<span>📋</span> Копировать все', 1500);
      });
    });

    // Скачать .txt
    document.getElementById('downloadTxt').addEventListener('click', () => {
      const blob = new Blob([getAllText(d)], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'rekvizity_vgau.txt';
      a.click();
    });

    // Скачать .pdf (печать)
    document.getElementById('downloadPdf').addEventListener('click', () => {
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>Реквизиты ВГАУ</title><>body{padding:2rem;font-family:system-ui} pre{white-space:pre-wrap}</></head><body><h2>ФГБОУ ВО "Верхневолжский ГАУ"</h2><pre>${getAllText(d)}</pre></body></html>`);
      win.print();
    });

    // Аккордеон
    document.getElementById('reqToggle').addEventListener('click', function() {
      const content = document.getElementById('reqContent');
      const icon = document.getElementById('reqToggleIcon');
      const text = document.getElementById('reqToggleText');
      const isCollapsed = content.classList.toggle('collapsed');
      icon.innerText = isCollapsed ? '▶' : '▼';
      text.innerText = isCollapsed ? 'Развернуть реквизиты' : 'Свернуть реквизиты';
    });
  }

  function getAllText(d) {
    return `ПОЛНОЕ НАИМЕНОВАНИЕ: ${d.fullName}
СОКРАЩЕННОЕ: ${d.shortName}
РУКОВОДИТЕЛЬ: ${d.head}
АДРЕС: ${d.address}
ОГРН: ${d.ogrn}  ИНН/КПП: ${d.inn}/${d.kpp}
ОКТМО: ${d.oktmo}  ОКПО: ${d.okpo}
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
