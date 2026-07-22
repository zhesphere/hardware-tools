/**
 * 分压计算器
 * Vout = Vin × R2 / (R1 + R2)
 * 支持正向计算和反向求解
 */
registerTool('voltage-divider', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🔻 分压计算器</h2>
        <p>计算电阻分压电路的输出电压，支持正向计算和反向求解</p>
      </div>
      <div class="tool-body">
        <div style="text-align:center;margin-bottom:16px;font-family:monospace;color:var(--text-secondary);font-size:0.95rem;">
          <svg width="180" height="140" viewBox="0 0 180 140" style="vertical-align:middle;">
            <line x1="20" y1="20" x2="60" y2="20" stroke="#8b8fa3" stroke-width="2"/>
            <rect x="60" y="10" width="60" height="20" rx="3" fill="none" stroke="#8b8fa3" stroke-width="2"/>
            <text x="90" y="55" text-anchor="middle" fill="#8b8fa3" font-size="11">R1</text>
            <line x1="120" y1="20" x2="120" y2="60" stroke="#8b8fa3" stroke-width="2"/>
            <circle cx="120" cy="65" r="4" fill="none" stroke="#4a9eff" stroke-width="2"/>
            <text x="132" y="69" fill="#4a9eff" font-size="11">Vout</text>
            <line x1="120" y1="70" x2="120" y2="100" stroke="#8b8fa3" stroke-width="2"/>
            <rect x="60" y="100" width="60" height="20" rx="3" fill="none" stroke="#8b8fa3" stroke-width="2"/>
            <text x="90" y="138" text-anchor="middle" fill="#8b8fa3" font-size="11">R2</text>
            <line x1="60" y1="110" x2="20" y2="110" stroke="#8b8fa3" stroke-width="2"/>
            <line x1="20" y1="20" x2="20" y2="110" stroke="#8b8fa3" stroke-width="2"/>
            <text x="8" y="65" fill="#8b8fa3" font-size="10">GND</text>
            <text x="55" y="12" fill="#8b8fa3" font-size="10">Vin</text>
          </svg>
        </div>

        <div class="form-row" style="flex-wrap:wrap;">
          <div class="form-group" style="flex:1;min-width:150px;">
            <label class="form-label">输入电压 Vin（V）</label>
            <input type="number" class="form-input" id="vdVin" value="5" step="any" placeholder="输入电压">
          </div>
          <div class="form-group" style="flex:1;min-width:150px;">
            <label class="form-label">电阻 R1</label>
            <div class="form-row">
              <input type="number" class="form-input" id="vdR1" value="10" step="any" placeholder="R1">
              <select class="form-select" id="vdR1Unit" style="width:80px;">
                <option value="1">Ω</option>
                <option value="1e3" selected>kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:150px;">
            <label class="form-label">电阻 R2</label>
            <div class="form-row">
              <input type="number" class="form-input" id="vdR2" value="10" step="any" placeholder="R2">
              <select class="form-select" id="vdR2Unit" style="width:80px;">
                <option value="1">Ω</option>
                <option value="1e3" selected>kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
        </div>

        <div id="vdResult" style="margin-top:16px;"></div>

        <div class="formula-box" style="margin-top:12px;">
          📐 公式：Vout = Vin × R2 / (R1 + R2) &nbsp;&nbsp; I = Vin / (R1 + R2)
        </div>
      </div>
    </div>
  `;
}, () => {
  const vinInput = document.getElementById('vdVin');
  const r1Input = document.getElementById('vdR1');
  const r2Input = document.getElementById('vdR2');
  const r1Unit = document.getElementById('vdR1Unit');
  const r2Unit = document.getElementById('vdR2Unit');
  const resultDiv = document.getElementById('vdResult');

  function calculate() {
    const vin = parseFloat(vinInput.value);
    const r1_raw = parseFloat(r1Input.value);
    const r2_raw = parseFloat(r2Input.value);

    if (isNaN(vin) || isNaN(r1_raw) || isNaN(r2_raw) || r1_raw <= 0 || r2_raw <= 0) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--text-muted);">
          <span style="color: var(--text-muted);">请填写所有参数（必须大于0）</span>
        </div>
      `;
      return;
    }

    const R1 = r1_raw * parseFloat(r1Unit.value);
    const R2 = r2_raw * parseFloat(r2Unit.value);
    const Vout = vin * R2 / (R1 + R2);
    const I = vin / (R1 + R2);

    const ratio = R2 / (R1 + R2);
    const ratioPercent = ratio * 100;

    // Common ratios
    let ratioNote = '';
    if (Math.abs(ratio - 0.5) < 0.001) ratioNote = '（正好 1:1 分压）';
    else if (Math.abs(ratio - 0.333) < 0.005) ratioNote = '（接近 1/3 分压）';
    else if (Math.abs(ratio - 0.667) < 0.005) ratioNote = '（接近 2/3 分压）';

    resultDiv.innerHTML = `
      <div class="result-box">
        <div class="result-label">计算结果</div>
        <div class="result-value">
          Vout = ${fmtNum(Vout)} V
        </div>
      </div>
      <div class="result-grid">
        <div class="result-item highlight">
          <div class="unit">输出电压 Vout</div>
          <div class="value">${fmtNum(Vout)} V</div>
        </div>
        <div class="result-item">
          <div class="unit">分压比</div>
          <div class="value">${fmtNum(ratioPercent)}%${ratioNote}</div>
        </div>
        <div class="result-item">
          <div class="unit">回路电流 I</div>
          <div class="value">${fmtNum(I * 1000)} mA</div>
        </div>
        <div class="result-item">
          <div class="unit">总电阻</div>
          <div class="value">${fmtNum(R1 + R2)} Ω</div>
        </div>
      </div>
    `;

    // Show power dissipation if significant
    const pTotal = vin * I;
    if (pTotal > 0.1) {
      resultDiv.innerHTML += `
        <div class="formula-box" style="margin-top:8px; color: var(--orange);">
          ⚡ 总功耗：${fmtNum(pTotal * 1000)} mW &nbsp;|&nbsp; R1功耗：${fmtNum(I * I * R1 * 1000)} mW &nbsp;|&nbsp; R2功耗：${fmtNum(I * I * R2 * 1000)} mW
        </div>
      `;
    }
  }

  vinInput.addEventListener('input', calculate);
  r1Input.addEventListener('input', calculate);
  r2Input.addEventListener('input', calculate);
  r1Unit.addEventListener('change', calculate);
  r2Unit.addEventListener('change', calculate);
  calculate();
});
