/**
 * 电阻单位换算工具
 * 支持: mΩ, Ω, kΩ, MΩ, GΩ
 */
registerTool('resistor', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🟢 电阻单位换算</h2>
        <p>在 mΩ（毫欧）、Ω（欧姆）、kΩ（千欧）、MΩ（兆欧）、GΩ（吉欧）之间快速换算</p>
      </div>
      <div class="tool-body">
        <div class="form-group">
          <label class="form-label">输入电阻值</label>
          <div class="form-row">
            <input type="number" class="form-input" id="resValue" placeholder="输入数值" value="4.7" step="any">
            <select class="form-select" id="resUnit">
              <option value="mohm">mΩ（毫欧）</option>
              <option value="ohm">Ω（欧姆）</option>
              <option value="kohm" selected>kΩ（千欧）</option>
              <option value="Mohm">MΩ（兆欧）</option>
              <option value="Gohm">GΩ（吉欧）</option>
            </select>
          </div>
        </div>
        <div id="resResult"></div>
        <div class="formula-box" style="margin-top:12px;">
          1 GΩ = 1,000 MΩ = 1,000,000 kΩ = 1,000,000,000 Ω = 1,000,000,000,000 mΩ
        </div>
      </div>
    </div>
  `;
}, () => {
  const input = document.getElementById('resValue');
  const unit = document.getElementById('resUnit');
  const result = document.getElementById('resResult');

  function convert() {
    const value = parseFloat(input.value) || 0;
    const from = unit.value;

    // Convert to ohms first
    let ohms;
    switch (from) {
      case 'mohm': ohms = value * 1e-3; break;
      case 'ohm':  ohms = value; break;
      case 'kohm': ohms = value * 1e3; break;
      case 'Mohm': ohms = value * 1e6; break;
      case 'Gohm': ohms = value * 1e9; break;
    }

    const units = [
      { unit: 'mΩ',  value: fmtNum(ohms * 1e3) },
      { unit: 'Ω',   value: fmtNum(ohms) },
      { unit: 'kΩ',  value: fmtNum(ohms * 1e-3) },
      { unit: 'MΩ',  value: fmtNum(ohms * 1e-6) },
      { unit: 'GΩ',  value: fmtNum(ohms * 1e-9) },
    ];

    const highlightMap = { mohm: 'mΩ', ohm: 'Ω', kohm: 'kΩ', Mohm: 'MΩ', Gohm: 'GΩ' };
    result.innerHTML = renderUnitGrid(units, highlightMap[from]);
  }

  input.addEventListener('input', convert);
  unit.addEventListener('change', convert);
  convert();
});
