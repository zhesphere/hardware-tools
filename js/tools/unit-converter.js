/**
 * 统一单位换算器
 * 支持：电阻、电容、电压、电流、功率、频率、电感
 */
const UNIT_TABLES = {
  resistance: {
    name: '电阻',
    icon: '🟢',
    baseUnit: 'Ω',
    units: [
      { unit: 'mΩ',  label: '毫欧 (mΩ)', scale: 1e-3 },
      { unit: 'Ω',   label: '欧姆 (Ω)',  scale: 1 },
      { unit: 'kΩ',  label: '千欧 (kΩ)', scale: 1e3 },
      { unit: 'MΩ',  label: '兆欧 (MΩ)', scale: 1e6 },
      { unit: 'GΩ',  label: '吉欧 (GΩ)', scale: 1e9 },
    ],
  },
  capacitance: {
    name: '电容',
    icon: '🔵',
    baseUnit: 'F',
    units: [
      { unit: 'pF', label: '皮法 (pF)', scale: 1e-12 },
      { unit: 'nF', label: '纳法 (nF)', scale: 1e-9 },
      { unit: 'µF', label: '微法 (µF)', scale: 1e-6 },
      { unit: 'mF', label: '毫法 (mF)', scale: 1e-3 },
      { unit: 'F',  label: '法 (F)',   scale: 1 },
    ],
  },
  voltage: {
    name: '电压',
    icon: '⚡',
    baseUnit: 'V',
    units: [
      { unit: 'µV', label: '微伏 (µV)', scale: 1e-6 },
      { unit: 'mV', label: '毫伏 (mV)', scale: 1e-3 },
      { unit: 'V',  label: '伏特 (V)',  scale: 1 },
      { unit: 'kV', label: '千伏 (kV)', scale: 1e3 },
      { unit: 'MV', label: '兆伏 (MV)', scale: 1e6 },
    ],
  },
  current: {
    name: '电流',
    icon: '🔌',
    baseUnit: 'A',
    units: [
      { unit: 'µA', label: '微安 (µA)', scale: 1e-6 },
      { unit: 'mA', label: '毫安 (mA)', scale: 1e-3 },
      { unit: 'A',  label: '安培 (A)',  scale: 1 },
      { unit: 'kA', label: '千安 (kA)', scale: 1e3 },
    ],
  },
  power: {
    name: '功率',
    icon: '🔥',
    baseUnit: 'W',
    units: [
      { unit: 'µW', label: '微瓦 (µW)', scale: 1e-6 },
      { unit: 'mW', label: '毫瓦 (mW)', scale: 1e-3 },
      { unit: 'W',  label: '瓦特 (W)',  scale: 1 },
      { unit: 'kW', label: '千瓦 (kW)', scale: 1e3 },
      { unit: 'MW', label: '兆瓦 (MW)', scale: 1e6 },
    ],
  },
  frequency: {
    name: '频率',
    icon: '📡',
    baseUnit: 'Hz',
    units: [
      { unit: 'mHz', label: '毫赫 (mHz)', scale: 1e-3 },
      { unit: 'Hz',  label: '赫兹 (Hz)',  scale: 1 },
      { unit: 'kHz', label: '千赫 (kHz)', scale: 1e3 },
      { unit: 'MHz', label: '兆赫 (MHz)', scale: 1e6 },
      { unit: 'GHz', label: '吉赫 (GHz)', scale: 1e9 },
    ],
  },
  inductance: {
    name: '电感',
    icon: '🧲',
    baseUnit: 'H',
    units: [
      { unit: 'µH', label: '微亨 (µH)', scale: 1e-6 },
      { unit: 'mH', label: '毫亨 (mH)', scale: 1e-3 },
      { unit: 'H',  label: '亨利 (H)',  scale: 1 },
    ],
  },
};

const QUANTITY_KEYS = Object.keys(UNIT_TABLES);

registerTool('unit-converter', () => {
  const defaultQ = 'resistance';
  const tabs = QUANTITY_KEYS.map(k => {
    const t = UNIT_TABLES[k];
    const active = k === defaultQ ? ' active' : '';
    return `<button class="quantity-tab${active}" data-q="${k}">${t.icon} ${t.name}</button>`;
  }).join('');

  const defaultUnits = UNIT_TABLES[defaultQ].units;
  const unitOptions = defaultUnits.map((u, i) => {
    const sel = i === 2 ? ' selected' : '';
    return `<option value="${u.scale}"${sel}>${u.label}</option>`;
  }).join('');

  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🔄 单位换算器</h2>
        <p>选择物理量类型，输入数值即可看到所有单位的换算结果</p>
      </div>
      <div class="tool-body">
        <div class="quantity-tabs" id="quantityTabs">${tabs}</div>

        <div class="form-group" style="margin-top:20px;">
          <label class="form-label" id="converterLabel">输入电阻值</label>
          <div class="form-row">
            <input type="number" class="form-input" id="convValue" placeholder="输入数值" value="100" step="any">
            <select class="form-select" id="convUnit">${unitOptions}</select>
          </div>
        </div>

        <div id="convResult"></div>
      </div>
    </div>
  `;
}, () => {
  const tabsContainer = document.getElementById('quantityTabs');
  const label = document.getElementById('converterLabel');
  const valueInput = document.getElementById('convValue');
  const unitSelect = document.getElementById('convUnit');
  const resultDiv = document.getElementById('convResult');

  let currentQuantity = 'resistance';

  function updateUnitSelect() {
    const table = UNIT_TABLES[currentQuantity];
    unitSelect.innerHTML = table.units.map((u, i) => {
      const sel = i === 2 ? ' selected' : '';
      return `<option value="${u.scale}"${sel}>${u.label}</option>`;
    }).join('');
  }

  function convert() {
    const table = UNIT_TABLES[currentQuantity];
    const value = parseFloat(valueInput.value) || 0;
    const fromScale = parseFloat(unitSelect.value);

    // Convert to base unit
    const baseValue = value * fromScale;

    // Find the selected unit
    const selectedUnit = table.units.find(u => u.scale === fromScale);

    const results = table.units.map(u => ({
      unit: u.unit,
      value: fmtNum(baseValue / u.scale),
    }));

    resultDiv.innerHTML = renderUnitGrid(results, selectedUnit ? selectedUnit.unit : table.baseUnit);

    // Show common notation
    const baseVal = baseValue;
    if (baseVal > 0 && table.units.length >= 3) {
      const mid = table.units[Math.floor(table.units.length / 2)].scale;
      const midVal = baseVal / mid;
      const alt1 = table.units[1].scale;
      const alt1Val = baseVal / alt1;
      const alt3 = table.units[table.units.length - 2].scale;
      const alt3Val = baseVal / alt3;

      let notations = [];
      if (midVal >= 0.1 && midVal <= 9999) notations.push(`${fmtNum(midVal)} ${table.units[Math.floor(table.units.length / 2)].unit}`);
      if (alt1Val >= 0.1 && alt1Val <= 9999 && alt1Val !== midVal) notations.push(`${fmtNum(alt1Val)} ${table.units[1].unit}`);
      if (alt3Val >= 0.1 && alt3Val <= 9999 && alt3Val !== midVal) notations.push(`${fmtNum(alt3Val)} ${table.units[table.units.length - 2].unit}`);

      if (notations.length > 0) {
        resultDiv.innerHTML += `
          <div class="formula-box" style="margin-top:8px; color: var(--green);">
            📌 常用表示：${notations.join(' = ')}
          </div>
        `;
      }
    }
  }

  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.quantity-tab');
    if (!tab) return;

    currentQuantity = tab.dataset.q;
    const table = UNIT_TABLES[currentQuantity];

    tabsContainer.querySelectorAll('.quantity-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    label.textContent = `输入${table.name}值`;
    valueInput.value = '100';
    updateUnitSelect();
    convert();
  });

  valueInput.addEventListener('input', convert);
  unitSelect.addEventListener('change', convert);
  convert();
});
