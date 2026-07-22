/**
 * 电容单位换算工具
 * 支持: pF, nF, µF, mF, F
 */
registerTool('capacitor', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🔵 电容单位换算</h2>
        <p>在 pF（皮法）、nF（纳法）、µF（微法）、mF（毫法）、F（法）之间快速换算</p>
      </div>
      <div class="tool-body">
        <div class="form-group">
          <label class="form-label">输入电容值</label>
          <div class="form-row">
            <input type="number" class="form-input" id="capValue" placeholder="输入数值" value="100" step="any">
            <select class="form-select" id="capUnit">
              <option value="pf">pF（皮法）</option>
              <option value="nf">nF（纳法）</option>
              <option value="uf" selected>µF（微法）</option>
              <option value="mf">mF（毫法）</option>
              <option value="f">F（法）</option>
            </select>
          </div>
        </div>
        <div id="capResult"></div>
        <div class="formula-box" style="margin-top:12px;">
          1 F = 1,000 mF = 1,000,000 µF = 1,000,000,000 nF = 1,000,000,000,000 pF
        </div>
      </div>
    </div>
  `;
}, () => {
  const input = document.getElementById('capValue');
  const unit = document.getElementById('capUnit');
  const result = document.getElementById('capResult');

  function convert() {
    const value = parseFloat(input.value) || 0;
    const from = unit.value;

    // Convert to farads first
    let farads;
    switch (from) {
      case 'pf': farads = value * 1e-12; break;
      case 'nf': farads = value * 1e-9; break;
      case 'uf': farads = value * 1e-6; break;
      case 'mf': farads = value * 1e-3; break;
      case 'f':  farads = value; break;
    }

    const units = [
      { unit: 'pF', value: fmtNum(farads * 1e12) },
      { unit: 'nF', value: fmtNum(farads * 1e9) },
      { unit: 'µF', value: fmtNum(farads * 1e6) },
      { unit: 'mF', value: fmtNum(farads * 1e3) },
      { unit: 'F',  value: fmtNum(farads) },
    ];

    const highlightMap = { pf: 'pF', nf: 'nF', uf: 'µF', mf: 'mF', f: 'F' };
    result.innerHTML = renderUnitGrid(units, highlightMap[from]);

    // Add common values reference
    if (farads > 0) {
      const pf = farads * 1e12;
      const nf = farads * 1e9;
      const uf = farads * 1e6;

      let common = [];
      if (pf >= 1 && pf <= 999999) common.push(`${fmtNum(pf)} pF`);
      if (nf >= 1 && nf <= 999999) common.push(`${fmtNum(nf)} nF`);
      if (uf >= 0.1 && uf <= 9999) common.push(`${fmtNum(uf)} µF`);

      if (common.length > 0) {
        result.innerHTML += `
          <div class="formula-box" style="margin-top:8px; color: var(--green);">
            📌 常用表示：${common.join(' = ')}
          </div>
        `;
      }
    }
  }

  input.addEventListener('input', convert);
  unit.addEventListener('change', convert);
  convert();
});
