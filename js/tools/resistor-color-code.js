/**
 * 电阻色环码计算器
 * 支持 4色环、5色环电阻
 */
const COLOR_CODES = [
  { id: 0,  name: '黑', color: '#1a1a1a', value: 0, multiplier: 1,        tolerance: null,   },
  { id: 1,  name: '棕', color: '#8B4513', value: 1, multiplier: 10,       tolerance: '±1%',  },
  { id: 2,  name: '红', color: '#CC0000', value: 2, multiplier: 100,      tolerance: '±2%',  },
  { id: 3,  name: '橙', color: '#FF8C00', value: 3, multiplier: 1000,     tolerance: null,   },
  { id: 4,  name: '黄', color: '#CCCC00', value: 4, multiplier: 10000,    tolerance: null,   },
  { id: 5,  name: '绿', color: '#008000', value: 5, multiplier: 100000,   tolerance: '±0.5%',},
  { id: 6,  name: '蓝', color: '#0000CC', value: 6, multiplier: 1000000,  tolerance: '±0.25%',},
  { id: 7,  name: '紫', color: '#7B1FA2', value: 7, multiplier: 10000000, tolerance: '±0.1%',},
  { id: 8,  name: '灰', color: '#808080', value: 8, multiplier: 100000000,tolerance: '±0.05%',},
  { id: 9,  name: '白', color: '#E0E0E0', value: 9, multiplier: 1000000000,tolerance: null,  },
  { id: 10, name: '金', color: '#CFB53B', value: null, multiplier: 0.1,   tolerance: '±5%',  },
  { id: 11, name: '银', color: '#C0C0C0', value: null, multiplier: 0.01,  tolerance: '±10%', },
];

function getColorById(id) {
  return COLOR_CODES.find(c => c.id === id) || COLOR_CODES[0];
}

registerTool('color-code', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🌈 电阻色环码计算</h2>
        <p>点击色环选择颜色计算电阻值，支持4色环、5色环电阻</p>
      </div>
      <div class="tool-body">
        <div class="form-group">
          <label class="form-label">电阻类型</label>
          <select class="form-select" id="bandType" style="width:200px;">
            <option value="4">4色环电阻</option>
            <option value="5">5色环电阻</option>
          </select>
        </div>

        <!-- 可视化电阻 -->
        <div class="resistor-visual" id="resistorVisual">
          <div class="resistor-lead"></div>
          <div class="resistor-body" id="resistorBody"></div>
          <div class="resistor-lead"></div>
        </div>

        <!-- 色环选择行 -->
        <div class="color-bands" id="bandSelectors"></div>

        <!-- 颜色选择面板 -->
        <div id="colorPickerPanel" style="display:none; margin-top:12px;"></div>

        <!-- 计算结果 -->
        <div id="colorCodeResult" style="margin-top:16px;"></div>
      </div>
    </div>
  `;
}, () => {
  const bandType = document.getElementById('bandType');
  const resistorBody = document.getElementById('resistorBody');
  const bandSelectors = document.getElementById('bandSelectors');
  const pickerPanel = document.getElementById('colorPickerPanel');
  const colorCodeResult = document.getElementById('colorCodeResult');

  // 4-band: [digit1, digit2, multiplier, tolerance]
  // 5-band: [digit1, digit2, digit3, multiplier, tolerance]
  const defaults = {
    4: [1, 0, 4, 10],    // Brown, Black, Yellow, Gold = 100kΩ ±5%
    5: [1, 0, 0, 3, 10], // Brown, Black, Black, Orange, Gold = 100kΩ ±5%
  };

  let selections = JSON.parse(JSON.stringify(defaults));
  let activeBand = -1; // which band is being edited (-1 = none)

  function getType() { return bandType.value; }
  function getLabels() {
    return getType() === '4' ? ['第1位', '第2位', '倍乘数', '误差']
                             : ['第1位', '第2位', '第3位', '倍乘数', '误差'];
  }

  function getAvailableColors(bandIdx) {
    const type = getType();
    const isTol = (type === '4' && bandIdx === 3) || (type === '5' && bandIdx === 4);
    const isMul = (type === '4' && bandIdx === 2) || (type === '5' && bandIdx === 3);

    if (isTol) return COLOR_CODES.filter(c => c.tolerance !== null);
    if (isMul) return [...COLOR_CODES]; // all colors available for multiplier
    return COLOR_CODES.filter(c => c.value !== null); // digits: 0-9
  }

  function renderAll() {
    const type = getType();
    const labels = getLabels();
    const sel = selections[type];

    // --- Resistor body bands ---
    resistorBody.innerHTML = sel.map(id => {
      const c = getColorById(id);
      return `<div class="band" style="background-color:${c.color};" title="${c.name}"></div>`;
    }).join('');

    // --- Band selector circles ---
    bandSelectors.innerHTML = sel.map((id, i) => {
      const c = getColorById(id);
      const isActive = i === activeBand ? ' band-active' : '';
      return `
        <div class="band-group">
          <div class="band-label">${labels[i]}</div>
          <div class="band-color${isActive}"
               style="background-color:${c.color};"
               data-band="${i}"
               title="${c.name}"></div>
          <div class="swatch-label">${c.name}</div>
        </div>`;
    }).join('');

    // Bind band click
    bandSelectors.querySelectorAll('.band-color').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.band);
        if (activeBand === idx) {
          // clicking same band again → close picker
          activeBand = -1;
        } else {
          activeBand = idx;
        }
        renderAll();
      });
    });

    // --- Color picker ---
    if (activeBand >= 0 && activeBand < sel.length) {
      const available = getAvailableColors(activeBand);
      pickerPanel.style.display = 'block';
      pickerPanel.innerHTML = `
        <label class="form-label">
          选择 <strong>${labels[activeBand]}</strong> 颜色：
          <span style="font-weight:400;color:var(--text-muted);margin-left:8px;">
            当前：${getColorById(sel[activeBand]).name}
          </span>
        </label>
        <div class="color-options">
          ${available.map(c => {
            const isSel = c.id === sel[activeBand];
            return `<div class="color-swatch${isSel ? ' swatch-selected' : ''}"
                 style="background-color:${c.color};"
                 title="${c.name}${c.tolerance ? ' ' + c.tolerance : ''}"
                 data-id="${c.id}"></div>`;
          }).join('')}
        </div>
      `;

      pickerPanel.querySelectorAll('.color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
          const newId = parseInt(sw.dataset.id);
          selections[type][activeBand] = newId;
          activeBand = -1;
          renderAll();
        });
      });
    } else {
      pickerPanel.style.display = 'none';
      pickerPanel.innerHTML = '';
    }

    // --- Update result ---
    updateResult();
  }

  function updateResult() {
    const type = getType();
    const sel = selections[type];

    let digits, multiplier, toleranceId;
    if (type === '4') {
      digits = getColorById(sel[0]).value * 10 + getColorById(sel[1]).value;
      multiplier = getColorById(sel[2]).multiplier;
      toleranceId = sel[3];
    } else {
      digits = getColorById(sel[0]).value * 100 + getColorById(sel[1]).value * 10 + getColorById(sel[2]).value;
      multiplier = getColorById(sel[3]).multiplier;
      toleranceId = sel[4];
    }

    const resistance = digits * multiplier;
    const tolerance = getColorById(toleranceId).tolerance || '—';

    let html = `
      <div class="result-box">
        <div class="result-label">电阻值</div>
        <div class="result-value">${fmtNum(resistance)} Ω  ${tolerance}</div>
      </div>`;

    if (resistance >= 1000 && resistance < 1000000) {
      html += `<div class="formula-box" style="margin-top:8px; color: var(--green);">📌 ${fmtNum(resistance / 1000)} kΩ  ${tolerance}</div>`;
    } else if (resistance >= 1000000) {
      html += `<div class="formula-box" style="margin-top:8px; color: var(--green);">📌 ${fmtNum(resistance / 1000000)} MΩ  ${tolerance}</div>`;
    }

    colorCodeResult.innerHTML = html;
  }

  bandType.addEventListener('change', () => {
    activeBand = -1;
    renderAll();
  });

  renderAll();
});
