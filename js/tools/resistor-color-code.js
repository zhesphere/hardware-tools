/**
 * 电阻色环码计算器
 * 支持 4色环、5色环、6色环电阻
 */
const COLOR_CODES = [
  { name: '黑', color: '#1a1a1a', value: 0, multiplier: 1, tolerance: null, temp: null },
  { name: '棕', color: '#8B4513', value: 1, multiplier: 10, tolerance: '±1%', temp: 100 },
  { name: '红', color: '#CC0000', value: 2, multiplier: 100, tolerance: '±2%', temp: 50 },
  { name: '橙', color: '#FF8C00', value: 3, multiplier: 1000, tolerance: null, temp: 15 },
  { name: '黄', color: '#CCCC00', value: 4, multiplier: 10000, tolerance: null, temp: 25 },
  { name: '绿', color: '#008000', value: 5, multiplier: 100000, tolerance: '±0.5%', temp: 20 },
  { name: '蓝', color: '#0000CC', value: 6, multiplier: 1000000, tolerance: '±0.25%', temp: 10 },
  { name: '紫', color: '#7B1FA2', value: 7, multiplier: 10000000, tolerance: '±0.1%', temp: 5 },
  { name: '灰', color: '#808080', value: 8, multiplier: 100000000, tolerance: '±0.05%', temp: 1 },
  { name: '白', color: '#E0E0E0', value: 9, multiplier: 1000000000, tolerance: null, temp: null },
  { name: '金', color: '#CFB53B', value: null, multiplier: 0.1, tolerance: '±5%', temp: null },
  { name: '银', color: '#C0C0C0', value: null, multiplier: 0.01, tolerance: '±10%', temp: null },
];

// State for color picker
let colorPickerTarget = null;

registerTool('color-code', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🌈 电阻色环码计算</h2>
        <p>选择色环颜色计算电阻值，支持4色环、5色环电阻</p>
      </div>
      <div class="tool-body">
        <div class="form-group">
          <label class="form-label">电阻类型</label>
          <select class="form-select" id="bandType" style="width:200px;">
            <option value="4">4色环电阻</option>
            <option value="5">5色环电阻</option>
          </select>
        </div>

        <div class="resistor-visual" id="resistorVisual">
          <div class="resistor-lead"></div>
          <div class="resistor-body" id="resistorBody">
          </div>
          <div class="resistor-lead"></div>
        </div>

        <div class="color-bands" id="bandSelectors"></div>

        <div id="colorPickerContainer"></div>

        <div id="colorCodeResult" style="margin-top: 16px;"></div>
      </div>
    </div>
  `;
}, () => {
  const bandType = document.getElementById('bandType');
  const resistorBody = document.getElementById('resistorBody');
  const bandSelectors = document.getElementById('bandSelectors');
  const colorPickerContainer = document.getElementById('colorPickerContainer');
  const colorCodeResult = document.getElementById('colorCodeResult');

  // Band indices for each type
  // 4-band: [digit1, digit2, multiplier, tolerance]
  // 5-band: [digit1, digit2, digit3, multiplier, tolerance]
  const defaultSelections = {
    4: [1, 0, 4, 10],    // Brown, Black, Yellow, Gold = 100kΩ ±5%
    5: [1, 0, 0, 3, 10], // Brown, Black, Black, Orange, Gold = 100kΩ ±5%
  };

  let selections = { 4: [...defaultSelections[4]], 5: [...defaultSelections[5]] };

  function getBandLabels(type) {
    if (type === '4') return ['第1位', '第2位', '倍乘数', '误差'];
    return ['第1位', '第2位', '第3位', '倍乘数', '误差'];
  }

  function renderBands() {
    const type = bandType.value;
    const labels = getBandLabels(type);
    const sel = selections[type];

    // Update visual resistor body
    resistorBody.innerHTML = sel.map(i => {
      const c = COLOR_CODES[i];
      return `<div class="band" style="background-color:${c.color};" title="${c.name}"></div>`;
    }).join('');

    // Update band selectors
    bandSelectors.innerHTML = sel.map((colorIdx, i) => `
      <div class="band-group">
        <div class="band-label">${labels[i]}</div>
        <div class="band-color"
             style="background-color:${COLOR_CODES[colorIdx].color};"
             data-band="${i}"
             title="${COLOR_CODES[colorIdx].name}"></div>
        <div class="swatch-label">${COLOR_CODES[colorIdx].name}</div>
      </div>
    `).join('');

    // Re-bind color picker triggers
    bandSelectors.querySelectorAll('.band-color').forEach(el => {
      el.addEventListener('click', () => {
        colorPickerTarget = parseInt(el.dataset.band);
        renderColorPicker();
      });
    });

    updateResult();
  }

  function renderColorPicker() {
    if (colorPickerTarget === null) {
      colorPickerContainer.innerHTML = '';
      return;
    }

    const type = bandType.value;
    const labels = getBandLabels(type);

    // Filter available colors based on band position
    const bandIdx = colorPickerTarget;
    const isTolerance = (type === '4' && bandIdx === 3) || (type === '5' && bandIdx === 4);
    const isMultiplier = (type === '4' && bandIdx === 2) || (type === '5' && bandIdx === 3);

    let availableColors;
    if (isTolerance) {
      // Tolerance band: only brown, red, green, blue, purple, gold, silver
      availableColors = COLOR_CODES.filter(c => c.tolerance !== null);
    } else if (isMultiplier) {
      // Multiplier band: all including gold, silver
      availableColors = COLOR_CODES.filter(c => c.multiplier !== undefined);
    } else {
      // Digit bands: black through white
      availableColors = COLOR_CODES.filter(c => c.value !== null);
    }

    colorPickerContainer.innerHTML = `
      <label class="form-label" style="margin-top:12px;">
        选择色环颜色：<strong>${labels[bandIdx]}</strong>
      </label>
      <div class="color-options">
        ${availableColors.map((c, i) => `
          <div class="color-swatch"
               style="background-color:${c.color};"
               title="${c.name}${c.tolerance ? ' ' + c.tolerance : ''}"
               data-index="${COLOR_CODES.indexOf(c)}"></div>
        `).join('')}
      </div>
    `;

    colorPickerContainer.querySelectorAll('.color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index);
        selections[type][colorPickerTarget] = idx;
        colorPickerTarget = null;
        renderBands();
      });
    });
  }

  function updateResult() {
    const type = bandType.value;
    const sel = selections[type];

    let digits, multiplier, toleranceIdx;
    if (type === '4') {
      digits = COLOR_CODES[sel[0]].value * 10 + COLOR_CODES[sel[1]].value;
      multiplier = COLOR_CODES[sel[2]].multiplier;
      toleranceIdx = sel[3];
    } else {
      digits = COLOR_CODES[sel[0]].value * 100 + COLOR_CODES[sel[1]].value * 10 + COLOR_CODES[sel[2]].value;
      multiplier = COLOR_CODES[sel[3]].multiplier;
      toleranceIdx = sel[4];
    }

    const resistance = digits * multiplier;
    const tolerance = COLOR_CODES[toleranceIdx].tolerance || '—';

    colorCodeResult.innerHTML = `
      <div class="result-box">
        <div class="result-label">电阻值</div>
        <div class="result-value">
          ${fmtNum(resistance)} Ω  ${tolerance}
        </div>
      </div>
      ${resistance >= 1000 ? `
        <div class="formula-box" style="margin-top:8px; color: var(--green);">
          📌 常用表示：${fmtNum(resistance / 1000)} kΩ  ${tolerance}
        </div>
      ` : ''}
      ${resistance >= 1000000 ? `
        <div class="formula-box" style="margin-top:4px; color: var(--green);">
          📌 常用表示：${fmtNum(resistance / 1000000)} MΩ  ${tolerance}
        </div>
      ` : ''}
    `;
  }

  bandType.addEventListener('change', () => {
    colorPickerTarget = null;
    renderBands();
  });

  renderBands();
});
